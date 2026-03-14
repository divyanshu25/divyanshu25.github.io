export const profile = {
  name: "Divyanshu Goyal",
  title: "Applied Scientist at Adobe",
  institution: "Georgia Tech",
  degree: "M.S. in Computer Science",
  specialization: "Machine Learning",
  bio: "Applied Scientist at Adobe specializing in cutting-edge machine learning solutions. I hold an M.S. in Computer Science from Georgia Tech with a focus on Machine Learning. Passionate about training Large Language Models and Vision-Language Models, I thrive on solving real-world challenges that drive meaningful impact.",
  
  education: [
    {
      degree: "M.S. in Computer Science",
      institution: "Georgia Institute of Technology",
      specialization: "Machine Learning"
    },
    {
      degree: "B.E. in Computer Science",
      institution: "Birla Institute of Technology and Sciences, Pilani"
    },
    {
      degree: "M.Sc. in Mathematics",
      institution: "Birla Institute of Technology and Sciences, Pilani"
    }
  ],
  
  skills: {
    languages: ["Python", "C++", "JavaScript"],
    tools: ["PyTorch", "Hugging Face", "DeepSpeed", "CUDA", "Weights & Biases", "LangChain", "Docker"]
  },
  
  expertise: [
    "Large Language Models (LLMs)",
    "Vision-Language Models (VLMs)",
    "Model Fine-tuning & RLHF",
    "Distributed Training",
    "Multimodal Reasoning",
    "Cultural AI & Localization"
  ],
  
  social: {
    github: "https://github.com/divyanshu25",
    linkedin: "https://www.linkedin.com/in/divyanshu2594/",
    email: "divyanshu.g25@gmail.com",
    scholar: "https://scholar.google.com/citations?user=5MJm4JsAAAAJ"
  },

  publications: [
    {
      title: "Curiosity-Driven LLM-as-a-judge for Personalized Creative Judgment",
      authors: "Vanya Bannihatti Kumar, Divyanshu Goyal, Akhil Eppa, Neel Bhandari",
      venue: "arXiv preprint",
      year: "2025",
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
      authors: "Mayank Anand, Jose Mathew, Divyanshu Goyal",
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
      venue: "US Patent Application",
      year: "2026",
      abstract: "Proposes a structured approach to constrained machine translation by grounding model outputs in entity-specific translation documents. Guidelines are extracted and categorized into language-agnostic translation facets, and facet-specific adherence scores are computed to quantify how well translations align with prescribed linguistic and stylistic constraints.",
      link: "https://patents.google.com/patent/US20260050753A1/en",
      tags: ["Machine Learning", "NLP", "Language Translation", "Localization"]
    }
  ],

  // Blog data lives in data/posts.ts to avoid duplication
};
