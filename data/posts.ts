export interface Post {
  id: string;
  title: string;
  summary: string;
  content: string;
  contentFile?: string; // path relative to project root, loaded at build time
  heroImage?: string;
  date: string;
  tags: string[];
  authors: string[];
  url?: string;
}

export const posts: Post[] = [
  {
    id: "audio-embeddings-from-first-principles",
    title: "Audio Embeddings, from First Principles",
    summary: "Play one clip to five professionals and they hear five different things: the words, the voice, the place, the mood, the dog. An audio embedding model is a mechanical listener, and its training task decides which of those layers it keeps. A ground-up tour of machine listening, from the supervised era through the self-supervised turn (wav2vec 2.0, HuBERT, WavLM, BEATs) to language's late arrival (Whisper, CLAP), ending with a practical map of which encoder to reach for and when.",
    content: "",
    contentFile: "docs/audio_embeddings.md",
    heroImage: "/blog/audio-embeddings/hero.png",
    date: "2026-08-01",
    tags: ["Audio", "Speech", "Embeddings", "CLAP", "Whisper", "HuBERT", "Self-Supervised Learning", "Deep Learning"],
    authors: ["Divyanshu Goyal"]
  },
  {
    id: "image-embeddings-from-first-principles",
    title: "Image Embeddings, from First Principles",
    summary: "Every image embedding model is an answer to one question: who gets to define what \"similar\" means? Labels, language, or the image itself. A from-scratch walk through CLIP, SigLIP, DINO and their descendants that organizes them all into one family tree, and ends with a practical map of which encoder to reach for and when.",
    content: "",
    contentFile: "docs/image_embeddings.md",
    heroImage: "/blog/image-embeddings/hero.png",
    date: "2026-07-29",
    tags: ["Computer Vision", "Embeddings", "CLIP", "SigLIP", "DINOv2", "Self-Supervised Learning", "Deep Learning"],
    authors: ["Divyanshu Goyal"]
  },
  {
    id: "rl-from-first-principles",
    title: "Reinforcement Learning, from First Principles",
    summary: "A ground-up derivation of how RL works for LLMs: starting from why SFT hits a ceiling, through the policy gradient theorem, the log-derivative trick, REINFORCE, baselines, GRPO and beyond...",
    content: "",
    contentFile: "docs/rl_basics.md",
    heroImage: "/blog/rl/hero.png",
    date: "2026-06-14",
    tags: ["Reinforcement Learning", "LLMs", "GRPO", "Policy Gradient", "Deep Learning"],
    authors: ["Divyanshu Goyal"]
  },
  {
    id: "scaling-transformers",
    title: "A Lazy Engineer's Guide to Scaling Transformers",
    summary: "How to compress transformer configuration into a single integer:depth. By deriving architecture dimensions (n_layer, n_embed, n_head), batch size, learning rate, weight decay, and training horizon from one number, scaling sweeps across multiple model sizes become trivial and error-free.",
    url: "https://medium.com/@divyanshugoyal/a-lazy-engineers-guide-to-scaling-transformers-104e404e2f91",
    content: `Published on [Medium](https://medium.com/@divyanshugoyal/a-lazy-engineers-guide-to-scaling-transformers-104e404e2f91)

[Read the full article on Medium →](https://medium.com/@divyanshugoyal/a-lazy-engineers-guide-to-scaling-transformers-104e404e2f91)`,
    date: "2026-03-06",
    tags: ["Transformers", "Scaling", "LLMs", "Training", "Deep Learning", "Scaling Laws"],
    authors: ["Divyanshu Goyal"]
  },
  {
    id: "llm-training-optimizations",
    title: "Going Fast: Every Optimization That Made LLM Training Fly",
    summary: "Six concrete optimizations (TF32, BF16 mixed precision, torch.compile, Flash Attention, parallel DataLoaders, and pinned memory transfers) that collectively drove a significant jump in Model Flop Utilization (MFU) while training VibeNanoChat, a GPT-2 scale LLM. Each technique is explained with real code and the hardware-level reasoning behind it.",
    url: "https://medium.com/@divyanshugoyal/going-fast-every-optimization-that-made-llm-training-fly-f465f3cf3588",
    content: `Published on [Medium](https://medium.com/@divyanshugoyal/going-fast-every-optimization-that-made-llm-training-fly-f465f3cf3588)

[Read the full article on Medium →](https://medium.com/@divyanshugoyal/going-fast-every-optimization-that-made-llm-training-fly-f465f3cf3588)`,
    date: "2026-03-05",
    tags: ["LLM", "Machine Learning", "Performance Optimization", "Deep Learning", "Training"],
    authors: ["Divyanshu Goyal"]
  },
  {
    id: "ml-services",
    title: "Engineering High-Throughput, Low-Latency Machine Learning Services",
    summary: "A deep dive into building Adobe's User Response Prediction Service that processes 3,500 requests per second with sub-5ms latency. Covers code optimization, garbage collection tuning, event generation, and performance benchmarking techniques for high-performance ML services.",
    url: "https://medium.com/adobetech/engineering-high-throughput-low-latency-machine-learning-services-7d45edac0271",
    content: `Published on [Adobe Tech Blog](https://medium.com/adobetech/engineering-high-throughput-low-latency-machine-learning-services-7d45edac0271)

## The Challenge

Adobe's User Response Prediction Service is a flexible AI-based service that predicts business outcomes based on a variety of user signals. The underlying Prediction Engine service must process about 3,500 requests per second with a round-trip time below 5 milliseconds (99th percentile). This translates to an in-app processing time of only 1 or 2 milliseconds.

## Key Constraints

When building this service we had the following constraints that needed to be carefully tracked:

1. Required API throughput and latency
2. Algorithm's time and space complexity
3. Maximum model size and maximum number of models
4. API contract (payload size, content type, and protocol)
5. Infrastructure used (host size, capacity, and network bandwidth)
6. Event generation for logging, monitoring, feedback, and model operationalization

## Design Choices

We performed extensive benchmarking for various webservers and data transfer protocols. This helped us determine the optimal tools required for the task and finalize the API contracts. We designed a J2EE application using REST APIs over HTTP with JSON payloads for data transfer, deployed on Tomcat.

## Code Optimization and Benchmarking

We took the following steps to benchmark and optimize our code:

### 1. Code Profiling
We collected profile data using samplers like perf (Linux) and DTrace (Mac OS X), and visualized them using flame graphs. We used CPU Flame Graphs to visualize the CPU cost paid for each method call in the app.

### 2. Micro-benchmarking
We used JMH for micro-benchmarking as it took care of things like JVM warmup and code optimization paths. This proved to be a much better way for comparing the impact of small code changes.

### 3. Load Test and Simulation
Apache JMeter helped us simulate the traffic load patterns we were expecting. This helped us conclude average round-time latency, 99th percentile latency, and various other statistics.

### 4. Metrics
For visualizing both system and application metrics we used New Relic. Its integration with our app had almost negligible impact on garbage collection (GC) and network.

## Event Generation

We generate lots of events for logging, feedback, and model evaluation. Processing all these events inline would have put back-pressure on our main task of prediction calculation. We needed a queue with these features:

1. **Lock free**: to provide fast message-sharing capability between threads
2. **Scalable**: to handle back pressure due to slow consumption or failures
3. **Reusable**: to prevent GC overhead

We found all the desired features in the form of a ring buffer in the disruptor library, inspired by the principle of mechanical sympathy. The implementation helped us overcome concurrency hazards like false sharing and had a great positive impact on our app's performance.

## Garbage Collection Tuning

Our service is CPU, network, and memory intensive which leads to garbage collection concerns. We addressed these by:

1. **Being thrifty with object creation**: Objects reused as Threadlocals
2. **Finalizing max limits in API contract**: Better idea of objects to support in worst case
3. **Having GC-free implementations**: Event generation and processing completely GC free
4. **Fine tuning GC parameters**: Increased Young Generation size to reduce GC pauses
5. **Using memory profiling tools**: Tools like JMap for calculating exact counts and sizes

## Conclusion

After defining our constraints upfront and tuning our code accordingly, we can now serve prediction requests at **3500 queries/second/node with app side latencies of 0.3–0.6 ms (99th percentile)**!

[Read the full article on Medium →](https://medium.com/adobetech/engineering-high-throughput-low-latency-machine-learning-services-7d45edac0271)`,
    date: "2019-05-28",
    tags: ["Machine Learning", "System Architecture", "Performance Optimization", "Java", "Microservices"],
    authors: ["Shirsh Bansal", "Divyanshu Goyal"]
  }
];
