export const profile = {
  name: "Divyanshu Goyal",
  title: "Applied Scientist at Adobe",
  institution: "Georgia Tech",
  degree: "M.S. in Computer Science",
  specialization: "Machine Learning",
  bio: "AI researcher and engineering leader with 8+ years at Adobe, specializing in agentic AI and multimodal LLMs. I led the technical strategy that took Adobe GenStudio for Performance Marketing from 0 to 1, driving multi-million-dollar adoption across the Fortune 500. Today I am tech lead for a 7-person team building VLMs, judge models, and retouchers. My work includes 6 patents and publications at CVPR, ICML, and AAAI workshops.",
  
  education: [
    {
      degree: "M.S. in Computer Science",
      institution: "Georgia Institute of Technology",
      specialization: "Machine Learning"
    },
    {
      degree: "B.E. in Computer Science",
      institution: "Birla Institute of Technology and Science, Pilani"
    },
    {
      degree: "M.Sc. in Mathematics",
      institution: "Birla Institute of Technology and Science, Pilani"
    }
  ],
  
  skills: {
    languages: ["Python"],
    tools: ["PyTorch", "Hugging Face Transformers/PEFT", "LoRA", "Weights & Biases"]
  },
  
  expertise: [
    "Vision-Language Models (VLMs)",
    "SFT & RL Fine-Tuning (GRPO)",
    "Reward Design",
    "Evaluation & Benchmark Design",
    "Human Preference Studies",
    "LLM Pretraining & Scaling Laws",
    "Distributed Training"
  ],
  
  social: {
    github: "https://github.com/divyanshu25",
    linkedin: "https://www.linkedin.com/in/divyanshu2594/",
    email: "divyanshu.g25@gmail.com",
    scholar: "https://scholar.google.com/citations?user=5MJm4JsAAAAJ"
  },

  publications: [
    {
      title: "ATune: Unsupervised Photo Retouching Through Image-Editor Controls",
      authors: "Divyanshu Goyal*, Gabriel Ruiz*, Amir Meisami (*equal contribution)",
      venue: "arXiv preprint (under review)",
      year: "2026",
      link: "https://arxiv.org/abs/2611.16236",
      abstract: "ATune is a 54M-parameter model that learns photo retouching from 10M unedited photographs, with no expert edits, and retouches by setting the sliders of off-the-shelf editors (RawTherapee and darktable). In a human study with 157 raters and 3,524 judgments, its edits beat GPT-6 Astra using the same editor (54.3% of decisive votes, 95% CI 50.3–58.3) and matched Claude Opus 5. On FiveK, PPR10K, and SPAQ, at least 8 of 9 published image-quality judges prefer it to GPT-6 Astra.",
      tags: ["Computer Vision", "Photo Retouching", "Unsupervised Learning", "Human Evaluation"]
    },
    {
      title: "DistortBench: Benchmarking Vision Language Models on Image Distortion Identification",
      authors: "Divyanshu Goyal, Akhil Eppa, Vanya Bannihatti Kumar",
      venue: "CVPR FGVC13 & ICML 2026 Workshops",
      year: "2026",
      abstract: "DistortBench is a diagnostic benchmark evaluating how well vision-language models can identify image distortions. The benchmark comprises 13,500 multiple-choice questions spanning 27 distortion types across six perceptual categories and five severity levels. Despite strong performance on high-level vision tasks, the top-performing VLM achieved only 61.9% accuracy, below the human baseline of 65.7%, revealing that low-level perceptual understanding remains a major weakness of current models.",
      link: "https://arxiv.org/abs/2604.19966",
      poster: "/posters/distortbench-cvpr-poster.pdf",
      thumbnail: "/posters/distortbench-poster-thumb.png",
      tags: ["Vision-Language Models", "Computer Vision", "Benchmarking", "Image Quality"]
    },
    {
      title: "JudgeBreak: Is Taste Hidden in the Layers? Stress-Testing Reward Models and LLM Judges with Representation-Based Subjective Evaluation",
      authors: "Vanya Bannihatti Kumar, Anish Narang, Mayank Anand, Akhil Eppa, Divyanshu Goyal",
      venue: "ICML Human-AI Co-Creativity Workshop",
      year: "2026",
      abstract: "JudgeBreak is a benchmark of 95 evaluation settings spanning creative writing, summarization, safety, 10 languages, and 33 writing genres. It compares reward models and LLM judges against linear probes trained on LLM hidden states. On Qwen3-32B, probes with cross-validated layer selection reach 78.1% mean pairwise accuracy, compared with 70.1% for the best reward model or zero-shot GPT-5.4 judge. On expert-annotated creative writing, reward models score below chance while probes are far more accurate. When annotators disagree, all methods plateau near chance.",
      link: "https://openreview.net/forum?id=5mnXwdpIRH",
      tags: ["LLMs", "Reward Models", "Evaluation", "Interpretability"]
    },
    {
      title: "Curiosity-Driven LLM-as-a-judge for Personalized Creative Judgment",
      authors: "Vanya Bannihatti Kumar, Divyanshu Goyal, Akhil Eppa, Neel Bhandari",
      venue: "AAAI Creative AI for Live Interactive Performances Workshop (Oral)",
      year: "2026",
      abstract: "Modern large language models (LLMs) excel at objective tasks such as evaluating mathematical reasoning and factual accuracy, yet they falter when faced with the nuanced, subjective nature of assessing creativity. In this work, we propose a novel curiosity-driven LLM-as-a-judge for evaluating creative writing, which is personalized to each individual's creative judgments.",
      link: "https://arxiv.org/abs/2510.05135",
      tags: ["LLMs", "Creative AI", "Pluralistic Alignment", "Evaluation"]
    },
    {
      title: "Systems and Methods to Provide Parameter-Efficient Fine-Tuned Models",
      authors: "Yuanyou Wang, Naveen Vangala, Mayank Anand, Kunal Kumar Jain, Jose Mathew, Eapen Jose, Divyanshu Goyal, Asmita Chihnara, Arif Abdullah, Anand Dantu",
      venue: "US Patent Application",
      year: "2025",
      abstract: "Systems and techniques to efficiently serve fine-tuned models by dynamically loading parameter-efficient layers into pre-loaded base models. This approach drastically minimizes network data transfer costs, container startup time, and provides a highly efficient, scalable system for serving specialized machine learning models in production environments.",
      link: "https://patents.google.com/patent/US20250217193A1/en",
      tags: ["Machine Learning", "Model Serving", "Fine-tuning", "System Architecture"]
    },
    {
      title: "Brand-Aligned Marketing Content Generation Using Structured Brand Data and Generative Models",
      authors: "Divyanshu Goyal, Mayank Anand, Jose Mathew",
      venue: "US Patent Application",
      year: "2025",
      abstract: "Systems and methods employ generative models to transform unstructured brand information into structured brand data and generate brand-aligned marketing content. The system uses natural language processing and machine learning to extract brand DNA elements, generate confidence scores for structured components, and create marketing content that accurately reflects an entity's brand identity across various channels.",
      link: "https://patents.google.com/patent/US20250117829A1/en",
      tags: ["Generative AI", "Marketing", "NLP", "Brand Management"]
    },
    {
      title: "Cultural Adaptation of Images Using Generative Artificial Intelligence",
      authors: "Akhil Eppa, Mayank Anand, Divyanshu Goyal",
      venue: "US Patent Application",
      year: "2026",
      abstract: "Explores cross-cultural visual adaptation via a multi-stage generative pipeline. A vision-language model grounds source images as text, which is then conditioned on region-specific cultural guidelines to produce a culturalized description. A text-to-image model renders the final output, enabling systematic and scalable cultural localization of visual content.",
      link: "https://patents.google.com/patent/US20260051084A1/en",
      tags: ["Generative AI", "Computer Vision", "Cultural Adaptation", "Image Generation"]
    },
    {
      title: "Guiding Language Translation with Translation Documents Using Machine Learning",
      authors: "Divyanshu Goyal, Akhil Eppa, Mayank Anand",
      venue: "US Patent (Granted)",
      year: "2026",
      abstract: "Proposes a structured approach to constrained machine translation by grounding model outputs in entity-specific translation documents. Guidelines are extracted and categorized into language-agnostic translation facets, and facet-specific adherence scores are computed to quantify how well translations align with prescribed linguistic and stylistic constraints.",
      link: "https://patents.google.com/patent/US20260050753A1/en",
      tags: ["Machine Learning", "NLP", "Language Translation", "Localization"]
    },
    {
      title: "Video-to-Video Culturalization Using Generative AI",
      authors: "Akhil Eppa, Divyanshu Goyal",
      venue: "US Patent Application (Filed)",
      year: "2026",
      abstract: "Filed with the USPTO; details will follow publication.",
      tags: ["Generative AI", "Video", "Cultural Adaptation"]
    },
    {
      title: "Learning to Be Surprised: A Curiosity-Driven Framework for Creative Judgment",
      authors: "Divyanshu Goyal, Vanya Bannihatti Kumar, Akhil Eppa, Neel Bhandari",
      venue: "US Patent Application (Filed)",
      year: "2026",
      abstract: "Filed with the USPTO. Covers the method of the AAAI 2026 workshop paper Curiosity-Driven LLM-as-a-judge for Personalized Creative Judgment.",
      tags: ["LLMs", "Creative AI", "Evaluation"]
    }
  ],

  // Blog data lives in data/posts.ts to avoid duplication
};
