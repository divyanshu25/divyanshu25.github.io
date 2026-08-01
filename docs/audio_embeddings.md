# Audio Embeddings, from First Principles

*What does a neural network hear? A ground-up tour of machine listening: wav2vec 2.0, HuBERT, WavLM, Whisper, CLAP, BEATs, and the voice encoders behind speaker verification. Assumes you understand transformers and supervised training, and nothing past that.*

---

## 1. Five listeners, one clip

Run a thought experiment. Take a five-second recording: **a woman says "the tide is coming in" on a windy beach, and a dog barks in the background.** Play it to five professionals and ask each to describe it.

- A **court stenographer** writes: *"The tide is coming in."*
- A **casting director** notes: *female voice, low register, slight rasp, mid-forties.*
- A **film sound editor** logs: *exterior, coastal, steady wind, surf bed, dog bark at 3.2s.*
- A **triage nurse** hears: *calm, unhurried, no distress.*
- A **dog trainer** hears: *single bark, alert, medium-sized dog, maybe forty feet away.*

Every one of them is right. They listened to the same air pressure and heard different things, because **hearing is selective**: the signal carries the words, the voice, the place, the mood, and the dog all at once, superimposed in one waveform, and each listener's training determines which layer they pull out.

![Five professionals hearing five different things in the same waveform](/blog/audio-embeddings/five_listeners.png)

**Fig. 1:** *Five professionals, one recording. Each hears a different layer of the same signal, and every audio embedding model is one of these listeners, built out of weights.*

Now the technical part. An audio embedding is a vector, say 768 numbers, that summarizes a piece of sound. An encoder network eats the waveform and emits the vector, and the promise is that geometry means something: "similar" clips end up nearby, "different" clips end up far apart. Once that works, a pile of applications reduce to distance computations: search (embed the library, embed the query, take nearest neighbors), classification (a linear layer on frozen vectors), speaker verification (cosine similarity against a threshold), music recommendation, deduplication, and the "ears" of every multimodal LLM.

But building the encoder forces the question the five listeners just dramatized: **near by whose ear?** Should our beach clip sit close to the same sentence read by a stranger in a studio (the stenographer's answer), or to the same woman saying something else (the casting director's), or to an empty windy beach (the sound editor's)? There is no correct answer. Similarity is not a property of sounds; it is a choice, and because all the layers coexist in one signal, choosing one means partially erasing the others.

Here is the mechanism by which the choice gets made, and it is the load-bearing idea of this whole post. **Nobody trains an embedding directly.** There is no "embedding loss" handed down from first principles. You train the network to do some *task*, and the embedding is whatever arrangement of the input the task left behind in the network's activations. Pick the task and you have picked the listener: a network trained to transcribe becomes the stenographer and forgets the voice; a network trained to spot dog barks becomes the trainer and forgets the words. Every model in this post is one choice of task, and the history of the field is the search for tasks whose residue keeps more of the signal.

One more thing before the history, because it shapes everything: audio is a *sequence*. An encoder over a ten-second clip does not naturally produce one vector; it produces a vector every ~20 milliseconds, hundreds of **frame-level** embeddings, and a single **clip-level** vector exists only if you make one (usually by pooling). Some tasks grade the frames, some grade the clip summary, and which one a model grades decides what it is good for. Keep this in your pocket; it comes back in §6.

The plan follows audio's actual history, which took a different road than you might expect:

1. The supervised era: hire a labeling committee, get exactly that committee's listener (§3).
2. The self-supervised turn: speech abandons labels *years before* the rest of ML made it fashionable, and invents a small zoo of ways to let the signal teach itself (§4).
3. Language arrives late: Whisper and CLAP, and why text-based supervision, the move that revolutionized vision, plays only half the game in audio (§5).
4. From frames to one vector, and the special case of voice (§6).
5. The map: every model placed, and which one to reach for (§7).

---

## 2. Sixteen thousand numbers a second

A quick word on the input, because audio models split into two lineages at the front door and the split explains a lot of what follows.

Sound arrives as a waveform: air pressure sampled 16,000 times per second. Two ways to feed it to a network:

- **Treat it like text.** Push the raw waveform through a small stack of 1-D convolutions that compress it into a sequence of latent frames, one per ~20ms, then run a transformer over the frame sequence exactly as you would over tokens. This is the speech lineage: wav2vec 2.0, HuBERT, WavLM. Their intellectual ancestor is BERT.
- **Treat it like an image.** Convert the waveform to a mel-spectrogram, a 2-D array with time on one axis, frequency on the other, and energy as brightness. It looks like a picture because it is one; cut it into patches and feed a ViT. This is the sound-event lineage: AST, AudioMAE, BEATs. Their intellectual ancestors are vision models.

![The two input pipelines: waveform to conv frames to transformer, and waveform to mel-spectrogram patches to ViT](/blog/audio-embeddings/two_front_doors.png)

**Fig. 2:** *The two front doors. The speech lineage compresses the waveform into a token-like frame sequence; the sound-event lineage renders it as a picture and borrows vision's machinery wholesale.*

Neither view is wrong. Speech has the structure of a token sequence (a smallish inventory of sounds, strung out in time, with something like a grammar), so BERT's toolbox fits. A soundscape has the structure of a texture (energy patterns spread over time and frequency), so vision's toolbox fits. Audio is both at once, which is why the field kept two toolboxes.

---

## 3. The supervised era: one listener per label list

The first decade of deep audio worked the way all of deep learning did: collect labels, train a classifier, and afterwards discover that the classifier's penultimate layer is a serviceable embedding, because arranging inputs so that a linear layer can separate the classes *is* an arrangement, and it transfers.

Audio ran this recipe once per listener:

- **The sound editor.** [AudioSet](https://research.google.com/audioset/) (Google, 2017): 2 million YouTube clips tagged with 527 event classes ("dog bark", "acoustic guitar", "sirens"). Classifiers trained on it ([VGGish](https://arxiv.org/abs/1609.09430), later [PANNs](https://arxiv.org/abs/1912.10211) and the transformer [AST](https://arxiv.org/abs/2104.01778)) yield general sound-event embeddings.
- **The casting director.** Train a network to classify which of several thousand known speakers is talking ([x-vectors](https://www.danielpovey.com/files/2018_icassp_xvectors.pdf), 2018); the penultimate layer becomes a **voice embedding**, where two clips of the same person land together regardless of what they say.
- **The stenographer.** Classic supervised speech recognition, trained on transcribed speech, whose internal features encode the words.

Three separate models, three separate listeners, and no way to merge them, because each objective *rewards* erasing the other layers: invariance to the speaker makes event classification easier, invariance to the words makes speaker classification easier. The label list does not just cap how much the embedding knows. **It picks one layer of the signal and pays the network to destroy the rest.**

And the cap is expensive. AudioSet took a team at Google years, and its tags are still noisy. Transcription is worse: an hour of speech costs many hours of human annotation, and there are thousands of languages with almost no transcribed audio at all. Meanwhile the world's supply of *unlabeled* audio (podcasts, radio, video, voice notes) is effectively infinite.

That cost asymmetry is why audio's history forked from vision's. Vision, sitting on billions of images with free alt-text, escaped its label ceiling through language (CLIP, 2021). Audio had no such gift waiting; nobody captions sound at internet scale. So speech research went the other way, early and hard: **get rid of the labels entirely.**

---

## 4. The self-supervised turn

### 4.1 The bet: the signal can teach itself

By 2018, speech groups were betting on an old intuition: sound is redundant across time, and redundancy is a teacher. The concrete trick is the one BERT was built on. **Hide part of the sequence and predict it from the rest.**

Mask a few hundred milliseconds from the middle of our beach clip and ask the model to fill in what belongs there. To do it well, the model must exploit every structure the signal has. The masked frames were *her* voice, so her timbre must be encoded to predict them. The wind was blowing through the gap, so the ambience must be tracked. The sentence so far is "the tide is", so "coming" is likelier than "purple": phonotactics, vocabulary, even a shadow of syntax. Nothing here needed a label, and, crucially, nothing here needed a *name*. The texture of wind and the rasp of a voice have no words attached, and masking teaches them anyway. The residue of fill-in-the-blank is a listener with, potentially, all five ears at once.

That is the promise. Between the promise and a working model stands one deceptively silly problem, and every method in this section is defined by how it dodges it.

### 4.2 The trap

Try the naive implementation: the encoder embeds the visible audio, the same encoder embeds the hidden audio, and the loss says "make the prediction match the target." Now ask what the *easiest* way to satisfy that loss is. Notice that the loss only rewards the prediction being right. Nothing anywhere rewards telling one sound apart from another. So the laziest solution wins, and wins perfectly: **ignore the input and output the same constant vector, always.** The prediction always matches the target, because both are the constant. Loss zero, on every clip on Earth, forever, and the encoder has learned nothing.

This failure mode is called **collapse**, and it is not a bug in one method; it is a structural hole in the whole idea of a model grading itself against itself. Supervised training never faced it (labels differ across inputs, so a constant scores terribly). The moment the targets come from the model, the temptation appears. Self-supervised learning is, at bottom, the art of wanting to predict yourself without being allowed to cheat, and each landmark speech model is one anti-cheating scheme. The cleanest way to tour them is by the question: **what, exactly, should the model predict at the masked position?** The field's answers got steadily stranger, and each one teaches something.

![Left: an embedding space with meaningful clusters. Right: every clip collapsed onto a single point](/blog/audio-embeddings/collapse.png)

**Fig. 3:** *Collapse. Nothing in "predict yourself" rewards telling clips apart, so the constant output satisfies the loss perfectly and the space implodes to a point.*

### 4.3 Target #1: the real frame, in a police lineup (wav2vec 2.0)

The first answer: don't ask the model to *reproduce* the missing frame, ask it to *recognize* it. Show a lineup containing the true frame and a crowd of impostors, and train the model to point at the right one. Guessing a constant is now useless, because a constant fingers every suspect equally. This is the contrastive idea, pioneered for audio prediction by [CPC](https://arxiv.org/abs/1807.03748) (2018), carried into speech by [wav2vec](https://arxiv.org/abs/1904.05862) (2019), and matured into **[wav2vec 2.0](https://arxiv.org/abs/2006.11477)** (Meta, 2020):

1. The convolutional front end maps the waveform to latent frames $z_t$, one per 20ms.
2. Spans of frames are masked; a transformer over the corrupted sequence produces context vectors $c_t$.
3. Each *true* latent is quantized, snapped to entries of a small learned codebook, giving a discrete target $q_t$. (Continuous targets are too easy to nudge; discrete ones make the lineup crisp.)
4. At each masked position: out of $q_t$ plus 100 impostors (quantized latents drawn from other masked positions in the same utterance), which one belongs here?

![The wav2vec 2.0 pipeline: waveform to latents, masking, transformer context vector, quantized target, and the lineup](/blog/audio-embeddings/wav2vec2_lineup.png)

**Fig. 4:** *One wav2vec 2.0 training step, at one masked position. The transformer's context vector $c_t$ must pick the true quantized frame $q_t$ out of a lineup of impostors drawn from the same utterance.*

"Point at the right one out of $K$" is just classification, so the loss is classification's loss. A quick refresher in case it is rusty: a classifier ends in one raw score per candidate (**logits**); the **softmax** exponentiates and normalizes them into probabilities; **cross-entropy** is $-\log$ of the probability given to the correct candidate, near zero when the model is confidently right and huge when it is confidently wrong. Here the logits are similarities between the context vector and each candidate:

$$\mathcal{L}_t = -\log \frac{\exp(\mathrm{sim}(c_t, q_t)/\kappa)}{\sum_{\tilde{q} \in Q_t} \exp(\mathrm{sim}(c_t, \tilde{q})/\kappa)}$$

where $Q_t$ is the lineup, $\mathrm{sim}$ is cosine similarity, and $\kappa$ is a temperature that stretches cosine values (stuck in $[-1,1]$, too flat for a softmax) into a range worth exponentiating. The literature calls this **InfoNCE**, and it is worth remembering the plain reading: *cross-entropy over an improvised set of classes, where the classes are the lineup*. We will meet it twice more, with different lineups.

Two footnotes with teeth. The codebook can collapse on its own (every frame snapping to one entry makes the lineup trivial), so a diversity penalty keeps all entries in use; anti-cheating schemes need their own anti-cheating schemes. And the lineup has a built-in injustice: the impostors are other frames of the *same utterance*, so the model is paid to distinguish the target from frames that may contain the very same phoneme. The repulsion that defeats collapse also fights a little of the structure you want.

None of that dulled the result. Pretrain on 60,000 hours of unlabeled speech, fine-tune on **ten minutes** of transcribed audio, and you get a working speech recognizer. Ten minutes. The embeddings had learned most of what transcription requires before seeing a single label, and the speech community's bet was paid in full.

### 4.4 Target #2: a tag from a phrasebook nobody wrote (HuBERT, WavLM)

The second answer sounds like a prank. **[HuBERT](https://arxiv.org/abs/2106.07447)** (Hidden-unit BERT, Meta 2021) builds its targets *before training, out of junk*:

1. Compute MFCCs (a 1970s handcrafted acoustic summary) for every frame in the corpus.
2. Run k-means with 100 clusters. Every frame now carries a cluster ID. These pseudo-labels are crude: MFCC clusters mean little beyond "sounds vaguely alike."
3. Train like BERT: mask spans, predict each masked frame's cluster ID with cross-entropy.
4. The trained model's internal features are now far better than MFCCs, so re-cluster the corpus *using the model's own middle-layer features* (500 clusters this time), discard the old tags, and train again.

```python
labels = kmeans(mfcc(corpus), k=100)                # crude tags, fixed before training
for iteration in range(2):
    model = train_bert_style(corpus, labels,        # mask spans; cross-entropy on the
                             loss_on=masked_only)   #   cluster ID of each masked frame
    labels = kmeans(model.layer_features(corpus),   # re-tag the corpus with the model's
                    k=500)                          #   own, much better features
```

![The HuBERT loop: MFCC features to k-means tags to BERT-style training to better features, and back around](/blog/audio-embeddings/hubert_loop.png)

**Fig. 5:** *The HuBERT bootstrap. Crude features are clustered into tags, the tags supervise masked prediction, and the resulting model's far better features are re-clustered into the next round's tags.*

Collapse never gets a vote: the targets are computed offline and never move, so there is no loop for laziness to exploit. The real question is why garbage tags teach anything, and the answer is the deepest sentence in this post: **targets do not need to be correct; they need to be consistent.** If the same vowel gets tag 37 everywhere it occurs, then learning to say "37 goes here" from context forces the model to learn everything that *predicts* that vowel: the phonetic environment, the speaker's habits, the room. Whether tag 37 "means" anything is irrelevant. A phrasebook nobody wrote, applied consistently, is still a curriculum.

It is worth pausing on how odd this is historically. Computer vision tried clustering-as-supervision too ([DeepCluster](https://arxiv.org/abs/1807.05520), [SwAV](https://arxiv.org/abs/2006.09882)) and it stayed a side branch there; vision's crown went to self-distillation ([BYOL](https://arxiv.org/abs/2006.07733), [DINO](https://arxiv.org/abs/2104.14294)). In speech, clustering *won*, and HuBERT became the field's backbone. The likely reason is beautiful: speech, unlike photographs, really is built from a small discrete inventory (phonemes, a few dozen per language), so cluster IDs fit the data's true shape. There is no finite alphabet of image patches. When a method's structure matches the signal's structure, it sticks.

**[WavLM](https://arxiv.org/abs/2110.13900)** (Microsoft, 2021) then made one devious edit that ties back to our five listeners. During training, corrupt the input: overlay a second utterance or noise on part of the clip, **but keep the targets computed from the clean original**. Now the model must hold onto the main speaker through interference, which means tracking *who* is talking, not just what is being said. That single edit stops the objective from erasing the voice layer, and WavLM swept [SUPERB](https://arxiv.org/abs/2105.01051), the benchmark that probes one frozen encoder across a dozen tasks (recognition, speaker verification, emotion, diarization), precisely because its features kept more layers alive than anyone else's. Supervision by cocktail party.

One unplanned bonus: HuBERT's cluster IDs are discrete, so you can treat them as *tokens* and run a language model directly on speech, no text anywhere. That is "textless NLP" ([GSLM](https://arxiv.org/abs/2102.01192)), and it is the seed of today's speech-native LLMs.

### 4.5 Target #3: what an older me would have said (data2vec)

The third answer imports vision's champion. Keep two copies of the network. The **student** trains normally. The **teacher** never trains; after each step its weights drift a small fraction toward the student's, making it a slow exponential moving average (EMA) of the student's past. The student, viewing the masked clip, must regress the features the teacher computed from the *unmasked* clip. Collapse's fast lane is closed by the asymmetry: the teacher takes no gradients, so the optimizer has no handle with which to drag the *targets* toward a convenient constant. The student can only win by genuinely predicting a slightly-older, slightly-wiser self.

In audio this is **[data2vec](https://arxiv.org/abs/2202.03555)** (Meta, 2022), whose stated point was that the recipe is modality-blind: the identical scheme trains speech, image, and text encoders, and on speech it matches or beats wav2vec 2.0 and HuBERT. (The targets are averages of the teacher's top layers, normalized so their variance cannot quietly shrink; the collapse pressure never vanishes, it just gets managed.) In speech it shares the podium rather than owning it, but it is the cleanest expression of the EMA idea you will find.

![data2vec: a student sees the masked clip and regresses features produced by an EMA teacher that sees the full clip](/blog/audio-embeddings/data2vec_teacher.png)

**Fig. 6:** *data2vec. The student views the masked clip, the teacher views the whole clip, and the student regresses the teacher's features at the masked frames. The teacher is never trained; it only drifts toward the student.*

### 4.6 Target #4: a random tattoo (BEST-RQ)

The last answer is audio's own, and it reads like a dare. HuBERT showed targets need only be consistent. **[BEST-RQ](https://arxiv.org/abs/2202.01855)** (Google, 2022) asks: then why learn them at all? Project each frame's spectral features through a **frozen random matrix**, snap the result to the nearest entry of a **frozen random codebook**, and use that as the tag for masked prediction. No k-means, no iterations, no learning anywhere in the target path. The tags cannot collapse (they never move), cannot be gamed (they never respond to the student), and are automatically consistent (the projection is deterministic, so the same sound gets the same tag everywhere). Every property that mattered, none of the machinery. It scales absurdly well; BEST-RQ pretraining sits under Google's USM family, trained on millions of hours.

Line up the four targets and a moral falls out: learned codebook, clustered pseudo-labels, EMA teacher, frozen randomness. The targets got *dumber* at every step while the models got better. For masked prediction, **the intelligence belongs in the student, not in the targets**; the target's only job is to be a consistent mirror the student cannot fog.

![Four boxes from wav2vec 2.0's learned codebook to BEST-RQ's frozen random tags, with targets getting simpler left to right](/blog/audio-embeddings/target_progression.png)

**Fig. 7:** *The arc of the target. Each generation asked less of the target and more of the student, and quality kept going up.*

### 4.7 The same game on pictures of sound

The spectrogram lineage from §2 ran the identical playbook with vision's tools. **[AudioMAE](https://arxiv.org/abs/2207.06405)** (Meta, 2022) masks 80% of spectrogram patches and regresses the missing values through a throwaway decoder; reconstruction targets are the input itself, so collapse is off the table by construction. **[BEATs](https://arxiv.org/abs/2212.09058)** (Microsoft, 2022) plays HuBERT on patches: predict masked patches as discrete tokens, starting from a random tokenizer (a BEST-RQ move) and then alternating, model distilling a better tokenizer, tokenizer teaching a better model. BEATs took the state of the art on AudioSet tagging, becoming the strongest "sound editor" ear available, and did it without a single label during pretraining.

### 4.8 The quiet family: similarity by decree

One more self-supervised strain, minor in audio but philosophically the purest illustration of this post's thesis. Instead of masking, *declare* two things similar and train the encoder to agree. The declarations on offer:

- **[TRILL](https://arxiv.org/abs/2002.12764)** (Google, 2020): two segments cut from the same recording, seconds apart, are a positive pair. *Similar = nearby in time.* What survives a few seconds of gap? The voice, the room, the mood. What changes? The words. TRILL is therefore a deliberately word-deaf listener, built for speaker, emotion, and health signals: a stenographer's exact negative.
- **[COLA](https://arxiv.org/abs/2010.10915)** (2020): same declaration, enforced with an InfoNCE lineup (second reappearance) whose impostors are segments of other clips.
- **[BYOL-A](https://arxiv.org/abs/2103.06695)** (2021): two *augmented* versions of one segment (background mixing, spectral warping), matched via an EMA teacher.

The lesson is stated right in the recipes: **write down what counts as "the same" and you have written down, literally, which layers of the signal your embedding will keep.** Nowhere in the field is the similarity-is-a-choice point so explicit.

---

## 5. Language arrives late

Vision's great leap was language supervision; in audio that same move showed up years *after* the self-supervised wave, and in two separate costumes, because audio's relationship with text is split. Text about audio comes in two kinds: **transcripts** (what was said) and **descriptions** (what it sounded like). Each kind built a different model, and each buys a different listener.

### 5.1 Whisper: the stenographer, industrialized

For speech, the internet holds text at staggering scale: subtitles, captioned videos, audiobooks read from known books. A transcript is a peculiar kind of annotation. It says nothing about the beach, the dog, or the voice, but it records the word layer *exhaustively*, every word in order.

**[Whisper](https://arxiv.org/abs/2212.04356)** (OpenAI, 2022) supervises on that at brute scale: 680,000 hours of web audio paired with transcripts, an encoder-decoder transformer trained to *generate* the transcript (plus language tags, timestamps, and translations, signaled by special tokens). It was built as a speech recognizer, not an embedding model. But apply the residue rule from §1: generation is a fill-in-every-word exam, and the decoder can only produce a word whose evidence exists in the encoder's frame features, so those features are forced to carry essentially everything linguistic. The residue is the strongest word-layer representation in the field, and Whisper's encoder has quietly become the standard "ears" grafted onto multimodal LLMs ([Qwen2-Audio](https://arxiv.org/abs/2407.10759) among many).

The bill is the one §3 taught you to expect. What transcription does not need, the features need not keep: speaker identity, room, and affect survive only as much as they help guess the next token, which is little. Whisper is the stenographer grown enormous, and still the stenographer.

### 5.2 CLAP: the describing door

For everything that is not speech, there are no transcripts, only descriptions: "a dog barks while wind blows into the microphone." **[CLAP](https://arxiv.org/abs/2206.04769)** (Contrastive Language-Audio Pretraining, Microsoft 2022; the widely used open build is [LAION-CLAP](https://arxiv.org/abs/2211.06687)) pairs clips with captions and trains two towers, an audio encoder (spectrogram lineage, pooled to one clip vector) and a text encoder, into one shared space where matching pairs sit close.

The loss you already own: it is the lineup game, third appearance. For each clip in a batch of $N$ pairs, the lineup is the $N$ captions, the true caption is the suspect, and cross-entropy does the rest (run symmetrically, captions picking their clips too). The profound part is what the lineup is made of. In §4.3 the classes were frames; here **the classes are sentences**, improvised fresh every batch, which means the label vocabulary is no longer a fixed list but language itself.

![CLAP: an audio tower and a text tower feed a shared space; the batch similarity matrix has true pairs on the diagonal](/blog/audio-embeddings/clap_two_towers.png)

**Fig. 8:** *CLAP's training signal. Two towers, one shared space, and an $N \times N$ similarity matrix per batch: the diagonal (true pairs) is pushed up, everything else down. Each row is a lineup whose suspects are sentences.* That buys the trick CLIP made famous: **zero-shot classification**. Embed the sentences "a dog barking" and "a cat meowing", embed the clip, pick the closer sentence, and you have built a classifier out of prose, for any label set, with zero training examples. LAION-CLAP clears 90% zero-shot on [ESC-50](https://github.com/karolpiczak/ESC-50), a standard environmental-sound benchmark, and text-to-audio search ("glass breaking", enter) becomes a dot product. Sound-effect libraries run on this today.

Two limits keep CLAP from being audio's CLIP-sized revolution. First, **the data does not exist.** Alt-text was vision's free lunch, billions of captioned images nobody had to pay for; audio has no equivalent, and the assembled caption datasets (LAION-Audio-630K and kin) are three to four orders of magnitude smaller. Audio is the modality the internet forgot to label. Second, **captions describe events.** People write "a dog barks", not the sentence being spoken, and never the identity of the voice. So CLAP's space is the sound editor's ear with a text door: our beach clip embeds as speech-plus-dog-plus-wind, and the words and the woman evaporate. Whisper and CLAP are complementary halves of language supervision: one keeps only the words, the other everything *except* the words, and both are deaf to whatever text never records at all. Which is exactly the gap §4's label-free listeners were built to fill, and they were already there when language showed up.

---

## 6. From many frames to one vector, and the special case of voice

Now redeem the pocket-note from §1. The masked-prediction family grades *frames*; its native product is a sequence, perfect for recognition and diarization, which consume sequences. None of its objectives ever grades a single clip-level summary. Three ways to get one, in increasing order of intent:

**Pool.** Average the frames, or let a small attention head weight them first ([attentive statistics pooling](https://arxiv.org/abs/1803.10963)). Cruder than it sounds, and it works, with one practical fact every practitioner eventually learns: **the layers of a speech transformer specialize.** Probing work ([Pasad et al.](https://arxiv.org/abs/2107.04734)) and SUPERB's per-task learned layer weights agree: speaker identity concentrates early, phonetics in the middle, word-ish information late. A frozen HuBERT contains the casting director *and* the stenographer, stacked at different depths, and "which layer do you pool" is the same choice as "which listener do you want." The superposition never went away; it just moved inside the network.

![Schematic curves showing speaker identity peaking in early layers, phonetic content in the middle, and word-level information late](/blog/audio-embeddings/layer_specialization.png)

**Fig. 9:** *Where the layers live inside a self-supervised speech model. Schematic of the trends reported by [Pasad et al., 2021](https://arxiv.org/abs/2107.04734) and by SUPERB's learned layer weights: probe a different depth and you extract a different listener.*

**Train the clip vector on purpose.** CLAP and the §4.8 family do this natively; their objectives grade the summary, so the summary is the product.

**Say exactly what you mean.** When the layer you want is *identity*, the strongest results come from going back to supervision, but sharpened into metric learning. Train on thousands of labeled speakers with an angular-margin softmax that forces every utterance of a speaker inside a tight cone, cones separated by a mandatory margin ([ECAPA-TDNN](https://arxiv.org/abs/2005.07143) with AAM-softmax, the same [ArcFace](https://arxiv.org/abs/1801.07698) loss behind face recognition, because same-voice and same-face are the same problem: open-set identity with a known definition of "same"). These are the embeddings inside real speaker-verification and diarization systems. Self-supervised features probe close (WavLM especially), but when you can *state* your similarity, stating it beats hoping it emerges.

---

## 7. The map

The whole tour on one page, in the order history ran it:

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

Two coordinates place every model. One: **can you reach the space through text?** (Whisper and CLAP yes, each through its own kind of text; the self-supervised family no, but its features are truer to the signal.) Two: **which layer does the objective actually grade**: words, voice, events, music, or all-of-it-entangled?

![A grid placing every model by who defines similar (the signal, human labels, or language) and which layer is graded](/blog/audio-embeddings/map_plane.png)

**Fig. 10:** *The map. Columns: who defines "similar". Rows: which layer of the signal the objective grades. Every encoder in this post is one cell.*

Read off the coordinates and the practical guide writes itself:

| You want | Reach for | Why |
|---|---|---|
| Zero-shot sound tagging, text→audio search | CLAP (LAION-CLAP) | The description door into the space |
| Speech content: ASR, spoken-content search | Whisper encoder; wav2vec 2.0 / HuBERT / WavLM + light head | Word-layer features, cheap to decode |
| Speaker verification, diarization, voice similarity | ECAPA-TDNN; or WavLM + probe | Identity is statable; state it, or probe the early layers |
| Sound-event tagging, frozen backbone | BEATs, AudioMAE | Event features learned from the signal, no caption ceiling |
| Emotion, paralinguistics, health | WavLM / data2vec + probe across layers; TRILL lineage | The "how it's said" layer lives mid-to-early in SSL stacks |
| Ears for an LLM | Whisper encoder, often + BEATs | Words half-translated for the LLM; BEATs for the rest |
| Music similarity and tagging | MERT; MuLan-style text towers | Music is its own layer with its own models |

And the frontier is doing what the map predicts. No single encoder hears everything, so systems started wiring listeners together: [SALMONN](https://arxiv.org/abs/2310.13289) feeds an LLM Whisper features and BEATs features side by side, stenographer and sound editor in parallel, because each supplies precisely the layer the other's training erased.

**A field guide to other names you'll meet**, each placeable above:

- **[AudioCLIP](https://arxiv.org/abs/2106.13043)** / **[Wav2CLIP](https://arxiv.org/abs/2110.11499)**: align audio into an existing image-CLIP space using video, where soundtrack and frames pair themselves for free.
- **[MuLan](https://arxiv.org/abs/2208.12415)**: CLAP's move for music at tens-of-millions scale; the text tower behind [MusicLM](https://arxiv.org/abs/2301.11325).
- **[MERT](https://arxiv.org/abs/2306.00107)**: HuBERT's recipe for music, with codec tokens and pitch-aware targets, since music's "phonemes" are notes and timbres.
- **[XLS-R](https://arxiv.org/abs/2111.09296)** / **[MMS](https://arxiv.org/abs/2305.13516)**: wav2vec 2.0 across 128 to 1,000+ languages; the multilingual workhorses, and proof that label-free scaling crosses language borders that labels never could.
- **[w2v-BERT](https://arxiv.org/abs/2108.06209)**: lineup loss and cluster-tag loss trained jointly; supplier of AudioLM's semantic tokens.
- **[USM](https://arxiv.org/abs/2303.01037)**: BEST-RQ at Google scale, 300+ languages.
- **[PaSST](https://arxiv.org/abs/2110.05069)**: an efficient supervised spectrogram transformer; with AST and PANNs, the enduring supervised baseline.
- **[GE2E](https://arxiv.org/abs/1710.10467)**: the classic speaker-verification loss (pull utterances toward their speaker's centroid); ancestor of voice-cloning's speaker encoders.
- **[SUPERB](https://arxiv.org/abs/2105.01051)** / **[HEAR](https://arxiv.org/abs/2203.03022)**: the benchmarks that standardized "one frozen encoder, many probes," and in doing so documented which models keep which layers.

Interrogate any new checkpoint with three questions. What task produced it (the residue rule)? What stopped the collapse, if it trained on itself? And which layer of the signal did the objective grade? The answers are its coordinates.

> **Borders of the map.** Three territories deliberately left out. **Neural audio codecs** ([SoundStream](https://arxiv.org/abs/2107.03312), [EnCodec](https://arxiv.org/abs/2210.13438), [DAC](https://arxiv.org/abs/2306.06546)) compress audio into discrete tokens for *reconstruction*: they must keep everything needed to replay the waveform, while an embedding exists to throw the right things away. Different objective, different geometry; the generative world even names the two sides, running models like [AudioLM](https://arxiv.org/abs/2209.03143) on **semantic tokens** (a HuBERT-style encoder discretized, the *what*) plus **acoustic tokens** (a codec, the *how it sounds*). **Voice cloning's speaker encoders**: identity embeddings tuned so a synthesizer can reproduce the voice, reconstruction-flavored cousins of §6's verification cones. **Audio-native LLMs** ([Qwen2-Audio](https://arxiv.org/abs/2407.10759), [SALMONN](https://arxiv.org/abs/2310.13289), [Moshi](https://arxiv.org/abs/2410.00037)): this post's encoders are organs inside them, but full speech-to-speech systems deserve their own writeup.

---

## 8. Coda

A waveform is five recordings in one: a sentence, a voice, a place, a mood, and a dog, superimposed. An embedding cannot keep them all at full fidelity, and nobody trains an embedding anyway; you train a task, and the vector is the residue, so choosing the task chooses which listener you build. The supervised era hired one listener per label list and paid each to be deaf to the rest. Speech, facing the most expensive labels in ML, walked away from labels years early and learned to predict its own hidden frames, inventing along the way a taxonomy of anti-cheating schemes: lineups of negatives (wav2vec 2.0), consistent-but-meaningless cluster tags (HuBERT, then WavLM re-learning the voice through simulated cocktail parties), EMA teachers (data2vec), and frozen random tags (BEST-RQ), with the running discovery that targets can be dumb so long as the student is not. Language supervision arrived late and split: Whisper transcribes and keeps only the words; CLAP matches descriptions and keeps everything but. The frames-versus-clip gap gets closed by pooling (mind the layers, they specialize), by clip-level objectives, or, for voice, by stating the similarity outright with a margin loss. And since no single ear hears it all, the newest systems bolt several listeners onto one language model and let it do what the field could not: attend to every layer at once.

```
supervised          ->  hears what the label list names     (one layer, by decree)
Whisper             ->  hears the words                     (and nothing else)
CLAP                ->  hears what a caption would say      (events, not words or voices)
wav2vec/HuBERT/...  ->  hears the signal itself             (every layer, entangled;
                                                             extracting one is your job)
ECAPA & kin         ->  hears who is speaking               (identity, stated and trained)
```
