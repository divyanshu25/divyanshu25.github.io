export interface Post {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  tags: string[];
  authors: string[];
  url?: string;
}

export const posts: Post[] = [
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
