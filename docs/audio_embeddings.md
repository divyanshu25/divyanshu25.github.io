# Audio Embeddings, from First Principles

*A from-scratch tour of audio embeddings: how sound becomes numbers, how numbers become vectors, and how every major audio encoder relates to the others, from wav2vec and HuBERT to Whisper, CLAP, BEATs, and the voice encoders behind speaker verification. I'll assume you know transformers and supervised training, and nothing else.*

---

## 1. Sound is a list of numbers

Let's start at the very bottom, because audio is one of those modalities that feels mysterious until you look at the actual data, and then it becomes almost disappointingly concrete.

Sound is air pressure wiggling. Someone talks, their vocal cords slap air molecules around, a pressure wave spreads through the room, and your eardrum wiggles in sympathy. That's the entire physical phenomenon. A microphone is an artificial eardrum: a little membrane that wiggles, attached to something that converts the wiggle into voltage.

To get this into a computer we measure that voltage repeatedly and write down the numbers. Measure it 16,000 times per second (the standard rate for speech; music tends to use 44,100) and store each measurement as a float. That's it. That is literally all a digital audio file is.

So a ten-second clip of someone talking at 16 kHz is a 1-D array of 160,000 floats, each one saying "here's where the air pressure was at this instant." When you see a waveform plot, you are looking at these numbers. Everything in this post, every model, every embedding, every clever trick, is a function of this one array. I want you to hold onto that, because it keeps the whole subject honest: there is no magic anywhere below us, just 160,000 floats.

And here is the first interesting problem: those floats are a terrible input representation. The number at index 84,001 tells you essentially nothing; it's the co-movement of thousands of samples that encodes a vowel or a dog bark. The array is also brutally long: 160,000 tokens is not a sequence you want to feed a transformer raw. So before anything intelligent happens, every audio model first compresses the array into something more digestible. There are exactly two popular ways to do it, and the split turns out to shape the whole field.

## 2. Two ways to chop up a waveform

**Option 1: let a neural net do it.** Run the raw waveform through a small stack of 1-D convolutions with big strides. Each conv layer summarizes a longer window, and after a few layers you get one vector per ~20 milliseconds of audio, each vector summarizing about 25 ms of signal. Our ten-second clip becomes a sequence of ~500 vectors. That's a shape a transformer is happy with, and it looks exactly like a sequence of token embeddings. This is what wav2vec 2.0, HuBERT, and WavLM do, and it's why those models are, at heart, BERTs that listen.

**Option 2: use a hundred years of signal processing.** Take a short window of the waveform, say 25 ms, and ask: which frequencies are present in this window, and how strongly? (This is the Fourier transform; if you haven't met it, it's a change of coordinates from "pressure over time" to "energy per frequency," and it's the single most useful trick in signal processing.) Slide the window along the clip in 10 ms hops and stack the results into a 2-D array: time on one axis, frequency on the other, energy as brightness. Squash the frequency axis onto a log-like scale called the mel scale, because human ears resolve low frequencies much more finely than high ones, and you get a **mel-spectrogram**. For our clip: roughly 1,000 time steps by 80 frequency bins.

Look at what we just did: we turned sound into an *image*. Harmonics show up as stacked bright bands, a dog bark is a vertical smear, wind is low-frequency fuzz along the bottom. And once your audio is an image, you can throw the entire computer vision toolbox at it: cut it into patches, feed a ViT. This is what AST, AudioMAE, and BEATs do.

![The two input pipelines: waveform to conv frames to transformer, and waveform to mel-spectrogram patches to ViT](/blog/audio-embeddings/two_front_doors.png)

**Fig. 1:** *The two front doors. Learn your own filterbank with 1-D convs and treat audio like a token sequence, or compute a mel-spectrogram and treat it like an image.*

Neither door is more correct. Speech genuinely has token-sequence structure (a smallish inventory of sounds, strung out in time, with grammar-ish rules), so the BERT toolbox fits. Ambient sound genuinely has texture structure (energy patterns spread over time-frequency), so the vision toolbox fits. Audio is both, so the field kept both, and knowing which door a model walked through tells you a lot about it immediately.

Fine. We can get audio into a network. Now, what do we want out?

## 3. What we actually want: a vector where distance means something

For most practical purposes, what you want from an audio model is an **embedding**: one vector, maybe 768 floats, summarizing a clip, arranged so that geometry means something. Similar clips nearby, different clips far apart. Get that and a pile of hard problems become one-liners:

- **Search**: embed your library, embed the query, return nearest neighbors.
- **Classification**: frozen embeddings + a linear layer, trained in minutes.
- **Speaker verification**: "is this the same voice?" becomes a cosine similarity against a threshold.
- **Recommendation, dedup, clustering**: all just distances.
- **Multimodal LLMs**: every model that "hears" is an audio embedding model bolted onto a language model.

One technicality to file away before we go on. Audio encoders are built on sequences, so what they naturally produce is a vector *per frame*, one every ~20 ms; a single vector per clip only exists if you make one, usually by averaging the frames. Some training objectives grade the frames, some grade the clip summary, and this distinction will matter later. Pocket it.

Now the real problem, and it's not an engineering problem. I said "similar clips nearby." Similar *how*? Take a concrete five-second recording: **a woman says "the tide is coming in" on a windy beach, and a dog barks in the background.** What should be near it?

- The same sentence read by a stranger in a studio? (Same *words*.)
- The same woman saying something else? (Same *voice*.)
- The same beach with nobody talking? (Same *scene*.)
- A different dog in a park? (Same *event*.)

Every answer is defensible, and they point in completely different directions. Here's a way to feel it: play that clip to a court stenographer, a casting director, a film sound editor, a triage nurse, and a dog trainer, and ask them what they heard. You get five different, correct answers, because the signal carries all five things *at once*, superimposed in one waveform, and each listener's training decides which layer they pull out.

![Five professionals hearing five different things in the same waveform](/blog/audio-embeddings/five_listeners.png)

**Fig. 2:** *One recording, five correct descriptions. Every audio embedding model is one of these listeners, implemented in weights.*

So "similar" is not a property of audio. It's a choice. And, this is the part I find genuinely deep, *you never get to make the choice directly*. There is no principled "embedding loss" you write down that says "please arrange clips by meaning." What actually happens, in every model we're about to meet, is this: **you train the network on some task, and the embedding is the residue**, the internal arrangement of inputs the network was forced into in order to do the task. Pick the task and you've picked which layers of the signal survive into the vector and which get erased. A network trained to transcribe becomes the stenographer and forgets the voice. A network trained to spot barks becomes the trainer and forgets the words.

The rest of this post is just the history of that choice: the tasks people trained on, what each task's residue kept and destroyed, and how the field clawed its way toward embeddings that keep more. The history has a shape you might not expect, so here's the plan: first labels (§4), then, unusually early, *no* labels (§5), and only years later, language (§6).

## 4. The obvious thing first: supervised classification

The first decade of deep audio did the obvious thing, the same thing every field did: collect labels, train a classifier with cross-entropy, and afterwards notice that the penultimate layer is a decent embedding. This is a happy accident that's worth understanding rather than accepting: to classify well, the network must arrange inputs in its last hidden layer so that a linear boundary can separate the classes, and any arrangement good enough for that turns out to transfer to other tasks. The embedding was never the goal. It's residue, exactly as promised.

Audio ran this recipe separately for each kind of listener:

- **Events**: [AudioSet](https://research.google.com/audioset/) (Google, 2017), 2 million YouTube clips tagged with 527 classes ("dog bark", "sirens", "acoustic guitar"), and classifiers trained on it: [VGGish](https://arxiv.org/abs/1609.09430), then [PANNs](https://arxiv.org/abs/1912.10211), then the transformer [AST](https://arxiv.org/abs/2104.01778).
- **Voice**: train a network to answer "which of these 7,000 speakers is talking?", keep the penultimate layer, and you get a voice embedding ([x-vectors](https://www.danielpovey.com/files/2018_icassp_xvectors.pdf), 2018): same person close together, regardless of what they say.
- **Words**: classic supervised speech recognition, whose internals encode spoken content.

It works, and you should notice the two ways it's stuck. First, the label list is a ceiling: a 527-way classifier is only ever asked one question per clip, and the objective actively *rewards* discarding everything the labels don't mention, because invariance to it makes classification easier. The event model destroys the words and the voice on purpose; the speaker model destroys the words and the beach on purpose. One clip, five layers, and every label list picks one and shreds the rest.

Second, labels are painfully expensive, and in audio more than anywhere. AudioSet took a Google team years and is still noisy. Transcription is worse: an hour of speech costs many hours of human labeling, and most of the world's languages have essentially no transcribed audio at all. Meanwhile unlabeled audio (podcasts, radio, videos, voice notes) is functionally infinite.

Here's where audio's history forks from vision's, and it's worth appreciating why. When vision hit its label ceiling, it found billions of images with free text attached (alt-text) and escaped through language: that's CLIP, 2021. Audio checked its pockets and found nothing; the internet does not caption sound at scale. So speech research, sitting on infinite unlabeled audio and unaffordable labels, went the other way, hard, and years before "self-supervised" became fashionable elsewhere: **drop the labels entirely and make the audio teach itself.**

## 5. Let the audio teach itself

### 5.1 The idea, and the trap

How can data with no labels teach anything? The trick is old, it's the one BERT is built on: **hide part of the input and predict it from the rest.**

Mask out a few hundred milliseconds from the middle of our beach clip and ask the model to fill in what belongs there. Think about what it takes to do this well. The missing frames were *her* voice, so her timbre must be encoded to predict them. The wind blows straight through the gap, so the ambience must be tracked. The sentence so far is "the tide is...", so the missing word is far likelier "coming" than "purple": that's phonetics, vocabulary, a shadow of grammar. Nothing needed a label. Better, nothing needed a *name*: the exact texture of wind and the rasp of a voice have no words for them, and fill-in-the-blank teaches them anyway. Squint and you can see the promise: the residue of this task could be a listener with all five ears at once.

But try to implement it naively and you fall into a hole. Say the encoder embeds the visible audio, the same encoder embeds the hidden audio, and the loss is "make the prediction match the target." Now ask, the way you should always ask of a loss: what is the *cheapest* way to drive this to zero? Notice the loss only rewards prediction matching target. Nothing anywhere rewards telling clips apart. So the cheapest solution is total: **ignore the input, output the same constant vector, always.** Prediction equals target (both are the constant) for every frame of every clip on Earth. Loss: zero. Knowledge: none.

![Left: an embedding space with meaningful clusters. Right: every clip collapsed onto a single point](/blog/audio-embeddings/collapse.png)

**Fig. 3:** *Collapse. Nothing in "predict yourself" rewards distinguishing clips, so the constant output wins and the embedding space implodes to a dot.*

This is called **collapse**, and it's not a bug in one paper, it's a structural hole in the entire idea of a model grading itself against itself. Supervised training never had this problem (the labels differ across inputs, so a constant scores terribly); the instant your targets come from the model, the temptation exists. All of self-supervised audio is the art of predicting yourself without being allowed to cheat, and every landmark model is one anti-cheating scheme. The cleanest way to tour them is by a single question: **what exactly should the model predict at the masked position?** Watch the answers to that question evolve; there's a punchline at the end.

### 5.2 Answer 1: the true frame, picked out of a lineup (wav2vec 2.0)

First answer: don't *reproduce* the missing frame, *recognize* it. Show the model the true frame plus a crowd of impostors and train it to point at the right one. Now the constant solution is worthless: a constant points at every suspect equally. This is contrastive learning, and it reached speech in three steps, each fixing a weakness of the last:

- **[CPC](https://arxiv.org/abs/1807.03748)** (Contrastive Predictive Coding, 2018) introduced the game itself: encode a sequence, and from the context so far, pick the *future* latent frames out of a lineup of impostors. Not audio-specific; the paper ran it on speech, images, and text.
- **[wav2vec](https://arxiv.org/abs/1904.05862)** (Meta, 2019) was CPC rebuilt for speech: a fully convolutional network playing predict-the-future on raw waveforms, whose features knocked a solid dent in speech recognition error rates. It worked, but predicting only the future from the past limits what the model can use, and the follow-up [vq-wav2vec](https://arxiv.org/abs/1910.05453) bolted on a quantizer so the latents became discrete, BERT-friendly units.
- **[wav2vec 2.0](https://arxiv.org/abs/2006.11477)** (Meta, 2020) merged all of it into one end-to-end model and made the decisive swap: instead of predicting the future from the past, mask spans *in the middle* and predict them from context on both sides, exactly like BERT. That's the version that changed the field, and the one worth understanding in detail.

Concretely:

1. The 1-D conv front end from §2 turns the waveform into latent frames $z_t$, one per 20 ms.
2. Spans of frames get masked; a transformer reads the corrupted sequence and outputs a context vector $c_t$ at each position.
3. Each *true* latent gets quantized, snapped to entries of a small learned codebook, giving a discrete target $q_t$. (Discrete targets keep the lineup crisp; continuous ones are too easy to fudge.)
4. At each masked position, the model faces $q_t$ plus 100 impostors (quantized latents from other masked positions in the same utterance) and must say which one belongs.

![The wav2vec 2.0 pipeline: waveform to latents, masking, transformer context vector, quantized target, and the lineup](/blog/audio-embeddings/wav2vec2_lineup.png)

**Fig. 4:** *One wav2vec 2.0 training step at one masked position: the context vector $c_t$ must pick the true quantized frame $q_t$ out of a lineup of impostors from the same utterance.*

"Pick the right one out of K" is just classification, so we can score it with classification's standard loss. Quick refresher if it's rusty: a classifier ends in one raw score per candidate (logits); softmax exponentiates and normalizes them into probabilities; cross-entropy is minus the log of the probability given to the correct candidate, near zero when confidently right, huge when confidently wrong. Here the logits are similarities between $c_t$ and each candidate:

$$\mathcal{L}_t = -\log \frac{\exp(\mathrm{sim}(c_t, q_t)/\kappa)}{\sum_{\tilde{q} \in Q_t} \exp(\mathrm{sim}(c_t, \tilde{q})/\kappa)}$$

where $Q_t$ is the lineup, $\mathrm{sim}$ is cosine similarity, and $\kappa$ is a temperature (cosines live in $[-1, 1]$, too flat a range for a softmax to bite on, so we stretch them). The literature calls this **InfoNCE**, which sounds fancier than it is: cross-entropy where the classes are improvised from the lineup. Remember the plain reading, because this exact loss shows up again later with a different lineup.

Two footnotes with teeth. One: the codebook itself can collapse (every frame snapping to one entry makes the lineup trivial), so there's a diversity penalty keeping all entries in use. Anti-cheating schemes need their own anti-cheating schemes; welcome to self-supervision. Two: the impostors are other frames of the *same utterance*, so the model gets paid to distinguish the target from frames that may contain the exact same phoneme. The repulsion that defeats collapse also fights a bit of the structure you actually want. Keep that itch in mind.

None of this dampened the result, which made the whole field sit up: pretrain on 60,000 hours of unlabeled speech, then fine-tune on **ten minutes** of transcribed audio, and you get a working speech recognizer. Ten minutes. The embeddings had learned nearly everything transcription needs before seeing a single label.

### 5.3 Answer 2: a tag from a phrasebook nobody wrote (HuBERT, WavLM)

The second answer sounds like a prank when you first hear it. **[HuBERT](https://arxiv.org/abs/2106.07447)** (Hidden-unit BERT, Meta 2021) builds its prediction targets *before training, out of junk*:

1. Compute MFCCs for every frame of the corpus. (MFCCs are a handcrafted acoustic summary from the 1970s; think "crude spectrogram statistics.")
2. Run k-means with 100 clusters over them. Now every frame in the corpus carries a cluster ID, 0 to 99. These tags are bad. MFCC clusters mean little beyond "sounds vaguely alike."
3. Train exactly like BERT: mask spans, predict each masked frame's tag, plain cross-entropy over 100 classes.
4. Then the bootstrap: your trained model's internal features are now far better than MFCCs. So re-cluster the corpus using *the model's own middle-layer features* (500 clusters this time), throw the old tags away, and train again.

```python
labels = kmeans(mfcc(corpus), k=100)                # crude tags, fixed before training
for iteration in range(2):
    model = train_bert_style(corpus, labels,        # mask spans; cross-entropy on the
                             loss_on=masked_only)   #   cluster ID of each masked frame
    labels = kmeans(model.layer_features(corpus),   # re-tag the corpus with the model's
                    k=500)                          #   own, much better features
```

![The HuBERT loop: MFCC features to k-means tags to BERT-style training to better features, and back around](/blog/audio-embeddings/hubert_loop.png)

**Fig. 5:** *The HuBERT bootstrap. Junk features get clustered into tags, the tags supervise masked prediction, and the model's much better features get re-clustered into the next round's tags.*

Notice collapse never even gets a vote here: the targets are computed offline and never move during training, so there's no loop for laziness to exploit. The real question is why garbage tags teach anything at all, and the answer is my favorite sentence in this whole subject: **targets don't need to be correct, they need to be consistent.** If the same vowel sound gets tag 37 everywhere it occurs, then learning to predict "37 goes here" from context forces the model to learn everything that *predicts* that vowel: the phonetic environment, the speaker's habits, the acoustics of the room. Whether tag 37 "means" anything is irrelevant. A phrasebook nobody wrote, applied consistently, is still a curriculum. (If this feels like it shouldn't work, I sympathize. The field's best tricks all have this flavor, and the theory limps along behind the practice.)

A historical aside that I think is genuinely beautiful. Vision tried clustering-as-supervision too ([DeepCluster](https://arxiv.org/abs/1807.05520), [SwAV](https://arxiv.org/abs/2006.09882)), and there it stayed a side branch; vision's crown went to self-distillation ([BYOL](https://arxiv.org/abs/2006.07733), [DINO](https://arxiv.org/abs/2104.14294)). In speech, clustering *won*: HuBERT became the field's backbone. Why the reversal? Most likely because speech, unlike photographs, really is built from a small discrete inventory (phonemes, a few dozen per language), so cluster IDs match the data's true shape, and there is no analogous finite alphabet of image patches. When a method's structure matches the signal's structure, it sticks.

**[WavLM](https://arxiv.org/abs/2110.13900)** (Microsoft, 2021) then added one devious twist. During training, corrupt the input: overlay a second speaker, or noise, on part of the clip. **But keep the targets from the clean original.** To predict the clean tags through the interference, the model has to track *who* the main speaker is, not just what's being said. Look at what that did through the lens of §3: pure content prediction was slowly erasing the voice layer, and this one edit forced the model to keep it. WavLM promptly swept [SUPERB](https://arxiv.org/abs/2105.01051), the benchmark that probes one frozen encoder on a dozen different tasks (recognition, speaker ID, emotion, diarization), precisely because its residue kept more layers alive than anyone else's.

One unplanned side effect worth knowing: HuBERT's tags are discrete, so you can treat them as *tokens* and train a language model directly on speech, with no text anywhere in the pipeline. That's "textless NLP" ([GSLM](https://arxiv.org/abs/2102.01192)), and it seeded today's speech-native LLMs.

### 5.4 Answer 3: whatever a slightly older you would say (data2vec)

Third answer, imported from vision's winners. Keep two copies of the network. The **student** trains normally. The **teacher** is never trained: after each step its weights just drift a small fraction toward the student's, making it an exponential moving average (EMA) of the student's own past. The student, looking at the masked clip, must regress the features the teacher computed from the *unmasked* clip.

Why doesn't this collapse? Follow the gradients. They flow only through the student; the teacher takes none. So the optimizer has no lever with which to drag the *targets* toward some convenient constant. The cheap exit is bricked over, and the only way for the student to reduce its loss is to genuinely predict what a slightly older, slightly better version of itself says about the hidden audio.

![data2vec: a student sees the masked clip and regresses features produced by an EMA teacher that sees the full clip](/blog/audio-embeddings/data2vec_teacher.png)

**Fig. 6:** *data2vec. Student sees the masked clip, teacher sees the whole clip, and the student regresses the teacher's features at the masked frames. The teacher only ever drifts toward the student.*

In audio this is **[data2vec](https://arxiv.org/abs/2202.03555)** (Meta, 2022), and the paper's real point was that the recipe is modality-blind: the identical scheme trains speech, image, and text encoders, and on speech it matches or beats wav2vec 2.0 and HuBERT. (Implementation details that matter: the targets are averages over the teacher's top several layers, normalized so their variance can't quietly shrink toward zero. The collapse pressure never disappears; it just gets managed.) In speech, this answer shares the podium rather than owning it, but it's the cleanest expression of the EMA idea you'll find anywhere.

### 5.5 Answer 4: a random tattoo (BEST-RQ)

The last answer is audio's own invention, and it reads like a dare. HuBERT showed the targets only need to be consistent. **[BEST-RQ](https://arxiv.org/abs/2202.01855)** (Google, 2022) asks the obvious follow-up: then why learn them at all? Take each frame's spectral features, project them through a **frozen random matrix**, snap the result to the nearest entry of a **frozen random codebook**, and use that as the tag for masked prediction. No k-means, no iterations, no learning anywhere in the target path.

Run the checklist. Can the tags collapse? No, they never move. Can the student game them? No, they never respond. Are they consistent? Automatically: the projection is deterministic, so the same sound gets the same tag everywhere, forever. Every property that §5.3 said actually matters, obtained for free, with zero machinery. And it scales absurdly well: BEST-RQ is the pretraining under Google's [USM](https://arxiv.org/abs/2303.01037) family, trained on millions of hours.

Now step back and look at the four answers in a row, because there's a punchline. wav2vec 2.0's targets were a codebook *trained jointly with the model*. HuBERT's were *clustered offline from junk*. data2vec's were *a moving average of the past*. BEST-RQ's are *frozen random noise*. The targets got dumber at every step, and the models kept getting better. For masked prediction, **the intelligence belongs in the student, not in the targets**; the target's only job is to be a consistent mirror the student can't fog.

![Four boxes from wav2vec 2.0's learned codebook to BEST-RQ's frozen random tags, with targets getting simpler left to right](/blog/audio-embeddings/target_progression.png)

**Fig. 7:** *The arc of the target. Each generation asked less of the target and more of the student, and quality kept going up.*

### 5.6 The same game, played on pictures of sound

Everything above walked through §2's first door (waveform, conv frames, BERT-style). The second door ran the identical playbook with vision's tools. **[AudioMAE](https://arxiv.org/abs/2207.06405)** (Meta, 2022) masks 80% of the spectrogram patches and regresses the missing values through a lightweight decoder that gets thrown away after training; reconstruction targets are the input itself, so collapse is off the table by construction. **[BEATs](https://arxiv.org/abs/2212.09058)** (Microsoft, 2022) plays HuBERT on patches: predict masked patches as discrete tokens, starting from a random tokenizer (recognize the BEST-RQ move), then alternating: model distills a better tokenizer, tokenizer trains a better model. BEATs took the state of the art on AudioSet tagging without using a single label during pretraining, and its encoder is now one of the standard "ears" bolted onto audio LLMs.

At this point you can read any new audio self-supervision paper and place it in about a paragraph: which door did it walk through, and what does it predict at the mask?

### 5.7 One more family: similarity by decree

There's one more self-supervised strain, minor in audio but worth meeting because it's the purest illustration of the §3 thesis. Instead of masking, just *declare* two things similar and train the encoder to agree:

- **[TRILL](https://arxiv.org/abs/2002.12764)** (Google, 2020) declares: two segments cut from the same recording, a few seconds apart, are similar. Now ask what survives a few seconds of gap. The voice, the room, the mood. What changes? The words. So TRILL is deliberately word-deaf, built for speaker, emotion, and health signals: an anti-stenographer, by construction.
- **[COLA](https://arxiv.org/abs/2010.10915)** (2020): same declaration, scored with an InfoNCE lineup whose impostors are segments of other clips. (Told you that loss would come back.)
- **[BYOL-A](https://arxiv.org/abs/2103.06695)** (2021): two *augmented* versions of one segment (mix in background noise, warp the spectrum), matched through an EMA teacher.

The lesson is written right into the recipes: **write down what counts as "the same," and you have written down which layers of the signal your embedding keeps.** Nowhere in the field is the choice more naked.

## 6. Language finally shows up

So by around 2021, audio had strong label-free encoders. What it didn't have was any way to *talk* to them: you can't type a query at a HuBERT. Vision solved exactly this with CLIP. Audio's version arrived late (remember §4: no alt-text goldmine), and it arrived split in two, because text about audio comes in two very different kinds. A **transcript** tells you what was said. A **description** tells you what it sounded like. Different text, different model, different listener.

### 6.1 Whisper: supervise on transcripts, get the stenographer

For speech specifically, the internet does have text at staggering scale: subtitles, captioned videos, audiobooks read from known books. **[Whisper](https://arxiv.org/abs/2212.04356)** (OpenAI, 2022) is what brute force looks like here: 680,000 hours of web audio paired with transcripts, an encoder-decoder transformer trained to *generate* the transcript token by token (plus language tags, timestamps, translations, all signaled by special tokens).

Whisper is a speech recognizer; nobody trained it to make embeddings. But apply the residue rule. The decoder can only emit a word if the evidence for that word exists in the encoder's frame features, and it must emit *every* word. So the encoder's features are forced to carry essentially everything linguistic, and that residue turned out to be the strongest word-layer representation in the field. Today Whisper's encoder is the default set of ears grafted onto multimodal LLMs ([Qwen2-Audio](https://arxiv.org/abs/2407.10759) among many).

The bill is the one §4 trained you to expect. What transcription doesn't need, the features don't keep: speaker identity, the room, the emotional color, all preserved only as far as they help guess the next token, which is not far. Ask Whisper's embedding *who* is speaking and it shrugs. It's the stenographer, grown enormous, and still the stenographer.

### 6.2 CLAP: supervise on descriptions, get the sound editor

For everything that isn't speech there are no transcripts, only descriptions: "a dog barks while wind blows into the microphone." **[CLAP](https://arxiv.org/abs/2206.04769)** (Contrastive Language-Audio Pretraining, Microsoft 2022; the widely used open build is [LAION-CLAP](https://arxiv.org/abs/2211.06687)) collects (clip, caption) pairs and trains two encoders, an audio tower (spectrogram door, pooled to one clip vector) and a text tower, to land matching pairs close together in one shared space.

The loss? You already own it. It's the lineup from §5.2, with the cast changed: for each clip in a batch of $N$ pairs, the lineup is the $N$ captions, the true caption is the suspect, cross-entropy does the rest, and the whole thing runs symmetrically (captions pick their clips too). What deserves a pause is what the lineup is made of now. In §5.2 the classes were frames. Here **the classes are sentences**, improvised fresh every batch. The label vocabulary is no longer a fixed list of 527 tags; it's language.

![CLAP: an audio tower and a text tower feed a shared space; the batch similarity matrix has true pairs on the diagonal](/blog/audio-embeddings/clap_two_towers.png)

**Fig. 8:** *CLAP's training signal. Two towers, one shared space, and an $N \times N$ similarity matrix per batch: diagonal (true pairs) pushed up, everything else pushed down. Each row is a lineup whose suspects are sentences.*

That buys the party trick CLIP made famous, **zero-shot classification**: embed the sentences "a dog barking" and "a cat meowing," embed your clip, pick the closer sentence. You just built a classifier out of prose, for any label set, with zero training examples. LAION-CLAP clears 90% zero-shot accuracy on [ESC-50](https://github.com/karolpiczak/ESC-50), a standard environmental-sound benchmark, and text-to-audio search ("glass breaking", enter) becomes a dot product. Sound-effect libraries run on this today.

So why isn't CLAP audio's CLIP-sized revolution? Two reasons. First, **the data just isn't there.** Alt-text was vision's free lunch; audio's caption datasets are hand-assembled and three to four orders of magnitude smaller (LAION-Audio-630K is 630 *thousand* pairs). Audio is the modality the internet forgot to label. Second, **captions describe events.** People write "a dog barks." They do not write down the sentence being spoken, and they never describe the voice. So CLAP's residue is the sound editor's ear with a text door: our beach clip embeds as speech-plus-dog-plus-wind, and the words and the woman evaporate.

Put §6.1 and §6.2 side by side and enjoy the symmetry: Whisper keeps only the words, CLAP keeps everything *except* the words, and both are deaf to whatever text never records at all: the exact texture of the wind, the reverb that says "small tiled bathroom," whatever it is that makes a voice recognizably one person. The §5 models were already hearing all of that. They just can't be talked to. Nobody has all five ears and a mouth; hold that thought for §8.

## 7. Loose end: turning many frames into one vector

Time to redeem the technicality pocketed in §3. The masked-prediction family grades *frames*. Its native output is a sequence of local vectors, which is perfect for recognition and diarization (they consume sequences), but nothing in those objectives ever graded a single whole-clip vector. Three ways to get one, in increasing order of intent:

**1. Pool.** Average the frames, or let a small attention head weight them first ([attentive statistics pooling](https://arxiv.org/abs/1803.10963)). Cruder than it sounds; works. But there's a practical fact here that everyone eventually learns the hard way: **the layers of a speech transformer specialize.** Probing studies ([Pasad et al.](https://arxiv.org/abs/2107.04734), and SUPERB's per-task learned layer weights) consistently find speaker identity concentrated in the early layers, phonetics in the middle, word-level information late. A frozen HuBERT contains the casting director *and* the stenographer, stacked at different depths, and "which layer do you pool" is the same question as "which listener do you want." The superposition from §3 never went away. It just moved inside the network.

![Schematic curves showing speaker identity peaking in early layers, phonetic content in the middle, and word-level information late](/blog/audio-embeddings/layer_specialization.png)

**Fig. 9:** *Where the layers live inside a self-supervised speech model, schematically (after [Pasad et al., 2021](https://arxiv.org/abs/2107.04734) and SUPERB's learned layer weights). Probe a different depth, extract a different listener.*

**2. Train the clip vector on purpose.** CLAP and the §5.7 family do this natively; their objectives grade the summary directly, so the summary is the product.

**3. When you can state the similarity, state it.** Suppose the layer you want is *identity*: same voice or not, for verification or diarization. That's not a vague "similar"; it has a definition, and when you have a definition, supervision comes roaring back, sharpened into metric learning. Train on thousands of labeled speakers with an angular-margin softmax that forces every utterance of a speaker into a tight cone, cones separated by a mandatory margin. That's [ECAPA-TDNN](https://arxiv.org/abs/2005.07143) with AAM-softmax, the same [ArcFace](https://arxiv.org/abs/1801.07698) loss that runs face recognition, because same-voice and same-face are the same problem shape: open-set identity, known definition of "same." These are the embeddings inside production speaker-verification systems. Self-supervised features probe close (WavLM especially), but when you know exactly what you mean by similar, saying so beats hoping it emerges.

## 8. Putting it all together

Let's assemble everything on one page, in the order history ran it:

```
2010s   supervised classifiers          one listener per label list
        ├─ AudioSet -> VGGish/PANNs/AST      the sound editor
        ├─ speaker IDs -> x-vectors          the casting director
        └─ transcribed ASR                   the stenographer
                 │
                 │   labels too expensive; each list erases the other layers
                 ▼
2018+   the self-supervised turn        "predict the hidden part of yourself"
        ├─ CPC -> wav2vec 2.0    target = true frame in a lineup      (negatives)
        ├─ HuBERT -> WavLM       target = offline cluster tag         (consistency > correctness;
        │                                                              WavLM re-learns the voice)
        ├─ data2vec              target = EMA teacher's features      (asymmetry)
        ├─ BEST-RQ               target = frozen random tag           (intelligence in the student)
        ├─ AudioMAE / BEATs      same game on spectrogram patches
        └─ TRILL / COLA / BYOL-A "similar" declared by decree
                 │
                 ▼
2022+   language arrives late
        ├─ Whisper               generate the transcript              (all words, no voice)
        └─ CLAP                  match clip to caption                (all events, no words)
```

Two questions place every model. One: **who defines "similar"**, the signal itself, human labels, or language? Two: **which layer of the signal does the objective actually grade**: words, voice, events, music, or everything-entangled?

![A grid placing every model by who defines similar (the signal, human labels, or language) and which layer is graded](/blog/audio-embeddings/map_plane.png)

**Fig. 10:** *Every encoder in one grid. Columns: who defines "similar". Rows: which layer gets graded. Each model in this post is one cell.*

Answer both questions and the practical guide writes itself:

| You want | Reach for | Why |
|---|---|---|
| Zero-shot sound tagging, text→audio search | CLAP (LAION-CLAP) | The description door into the space |
| Speech content: ASR, spoken-content search | Whisper encoder; wav2vec 2.0 / HuBERT / WavLM + light head | Word-layer features, cheap to decode |
| Speaker verification, diarization, voice similarity | ECAPA-TDNN; or WavLM + probe | Identity is statable; state it, or probe the early layers |
| Sound-event tagging, frozen backbone | BEATs, AudioMAE | Event features learned from the signal, no caption ceiling |
| Emotion, paralinguistics, health | WavLM / data2vec + probe across layers; TRILL lineage | The "how it's said" layer lives mid-to-early in SSL stacks |
| Ears for an LLM | Whisper encoder, often + BEATs | Words half-translated for the LLM; BEATs for the rest |
| Music similarity and tagging | MERT; MuLan-style text towers | Music is its own layer with its own models |

And the thought I asked you to hold in §6 resolves the obvious way: since no single encoder hears everything, the frontier wires several listeners into one system. [SALMONN](https://arxiv.org/abs/2310.13289) feeds an LLM Whisper features and BEATs features side by side, stenographer and sound editor in parallel, each supplying exactly the layer the other's training erased.

**Other names you'll run into**, each one placed by the same two questions in a few seconds:

- **[AudioCLIP](https://arxiv.org/abs/2106.13043)** / **[Wav2CLIP](https://arxiv.org/abs/2110.11499)**: align audio into an existing image-CLIP space using video, where soundtrack and frames pair themselves for free.
- **[MuLan](https://arxiv.org/abs/2208.12415)**: CLAP's move for music at tens-of-millions scale; the text tower behind [MusicLM](https://arxiv.org/abs/2301.11325).
- **[MERT](https://arxiv.org/abs/2306.00107)**: HuBERT's recipe for music, with codec tokens and pitch-aware targets, since music's "phonemes" are notes and timbres.
- **[XLS-R](https://arxiv.org/abs/2111.09296)** / **[MMS](https://arxiv.org/abs/2305.13516)**: wav2vec 2.0 across 128 to 1,000+ languages; label-free scaling crossing language borders that labels never could.
- **[w2v-BERT](https://arxiv.org/abs/2108.06209)**: lineup loss and cluster-tag loss trained jointly; supplied AudioLM's semantic tokens.
- **[USM](https://arxiv.org/abs/2303.01037)**: BEST-RQ at Google scale, 300+ languages.
- **[PaSST](https://arxiv.org/abs/2110.05069)**: an efficient supervised spectrogram transformer; with AST and PANNs, the enduring supervised baseline.
- **[GE2E](https://arxiv.org/abs/1710.10467)**: the classic speaker-verification loss (pull utterances toward their speaker's centroid); ancestor of voice cloning's speaker encoders.
- **[SUPERB](https://arxiv.org/abs/2105.01051)** / **[HEAR](https://arxiv.org/abs/2203.03022)**: the benchmarks that standardized "one frozen encoder, many probes," and in doing so documented which models keep which layers.

When the next checkpoint drops, interrogate it with three questions. What task produced it? (The embedding is that task's residue.) If it trained on itself, what stopped the collapse? And which layer of the signal did the objective grade? Those three answers tell you exactly what it is and how it relates to everything above.

> **What I deliberately left out.** **Neural audio codecs** ([SoundStream](https://arxiv.org/abs/2107.03312), [EnCodec](https://arxiv.org/abs/2210.13438), [DAC](https://arxiv.org/abs/2306.06546)) compress audio into discrete tokens for *reconstruction*: they must keep everything needed to replay the waveform, while an embedding exists to throw the right things away. Different objective, different geometry. The generative world even names the two sides, running models like [AudioLM](https://arxiv.org/abs/2209.03143) on **semantic tokens** (a HuBERT-style encoder, discretized: the what) plus **acoustic tokens** (a codec: the how it sounds). **Voice cloning's speaker encoders**: identity embeddings tuned so a synthesizer can reproduce a voice, reconstruction-flavored cousins of §7's verification cones. **Audio-native LLMs** ([Qwen2-Audio](https://arxiv.org/abs/2407.10759), [SALMONN](https://arxiv.org/abs/2310.13289), [Moshi](https://arxiv.org/abs/2410.00037)): this post's encoders are organs inside them, but full speech-to-speech systems deserve their own writeup.

## 9. Wrap-up

Let's compress the whole thing. Sound is air pressure, sampled into a long list of floats. Chop the list into frames (learned convs) or render it as a spectrogram image; either way a transformer can now read it. What we want out is a vector where distance means similarity, but one clip superimposes words, voice, scene, and mood, so "similar" is a choice, and the choice is always made indirectly: you train a task, and the embedding is the task's residue. Labels made one narrow listener per label list and cost too much to scale, so speech dropped labels years before it was cool and learned to predict its own hidden frames, defeating collapse four different ways: lineups of negatives (wav2vec 2.0), consistent-but-meaningless cluster tags (HuBERT, with WavLM re-learning the voice through simulated cocktail parties), EMA teachers (data2vec), and frozen random tags (BEST-RQ), with the running discovery that the targets can be dumb as long as the student isn't. Language showed up late and split down the middle: Whisper transcribes and keeps only the words; CLAP matches descriptions and keeps everything but. Frames pool into clip vectors if you mind the layers (they specialize), and when the similarity you want has a definition, like "same voice," you state it with a margin loss and get the strongest identity embeddings there are. No single model hears it all, so the newest systems bolt several listeners onto one LLM. And underneath every bit of it: 160,000 floats, and a choice about what to keep.

```
supervised          ->  hears what the label list names     (one layer, by decree)
Whisper             ->  hears the words                     (and nothing else)
CLAP                ->  hears what a caption would say      (events, not words or voices)
wav2vec/HuBERT/...  ->  hears the signal itself             (every layer, entangled;
                                                             extracting one is your job)
ECAPA & kin         ->  hears who is speaking               (identity, stated and trained)
```
