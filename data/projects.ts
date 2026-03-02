export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  date: string;
  authors: string[];
  link?: string;
  github?: string;
}

export const projects: Project[] = [
  {
    id: "mq-model-training",
    title: "Marketing Quality Vision Language Model",
    summary: "Built a complete MLOps system for training vision-language models to assess marketing content quality, featuring novel observable injection and Photoshop edit evaluation capabilities.",
    description: "Training **vision-language models** to solve the complex problem of evaluating **marketing image quality** at scale. Designed and implemented a novel **observable injection technique** that fundamentally changes how VLMs reason about image quality by augmenting prompts with quantitative metrics (sharpness, color balance, exposure, lighting distribution). This approach bridges the gap between learned representations and interpretable measurements, enabling the model to ground its assessments in concrete image properties. Tackled the challenging problem of **Photoshop edit evaluation**, training the model to understand subtle quality differences across multiple dimensions. Developed **MQCore**, a comprehensive evaluation score inspired by DCLM CORE, to rigorously benchmark model performance on marketing quality tasks. Built the complete **training pipeline** including multi-GPU distributed training with LoRA, synthetic conversation generation for diverse training data, and evaluation frameworks combining both DCLM CORE and custom MQCore benchmarks.",
    tags: ["Vision-Language Models", "MLOps", "Model Training", "Computer Vision", "PyTorch"],
    date: "2026-03-01",
    authors: ["Divyanshu Goyal"]
  },
  {
    id: "adobe-genstudio",
    title: "Adobe GenStudio for Performance Marketing",
    summary: "Created the first demo and pitched to Adobe leadership, leading to the launch of a generative AI-first platform that revolutionizes marketing content creation at scale.",
    description: "Led the development of the **foundational prototype** and presented to Adobe executive leadership, driving the strategic decision to launch GenStudio in October 2024. This **generative AI-first platform** addresses a critical market need where content demand is expected to grow **5x by 2026**, enabling marketing teams to create on-brand campaign content at scale. Built with **Adobe Firefly** for image generation and enterprise LLMs for copy generation, the platform integrates with major advertising platforms (Google Campaign Manager 360, Meta, Microsoft Advertising, Snap, TikTok) and provides **AI-powered brand validation**. Now serving enterprise marketing teams across major brands.",
    tags: ["Generative AI", "Product Development", "LLMs", "Marketing AI"],
    date: "2024-10-14",
    authors: ["Divyanshu Goyal"],
    link: "https://business.adobe.com/products/genstudio-for-performance-marketing.html?s_iid=7015Y000003t3H0QAI&s_cid=701Ke0000004qe8IAA&sdid=Z9X3FC66&mv=search&edtamo=true&s_kwcid=AL!3085!3!757296738213!e!!g!!adobe%20genstudio%20for%20performance%20marketing!22662564427!180434505803&ef_id=Cj0KCQiA5I_NBhDVARIsAOrqIsaQjaOfkeOCI6VJ5UlvmFuPPieIaTF6ZtEGIGFpSI4EVRdd8j8IHOsaAvZoEALw_wcB:G:s&gad_source=1&gad_campaignid=22662564427&gbraid=0AAAAADOODJSoHtia3tEqV_C7w286Mwj_m&gclid=Cj0KCQiA5I_NBhDVARIsAOrqIsaQjaOfkeOCI6VJ5UlvmFuPPieIaTF6ZtEGIGFpSI4EVRdd8j8IHOsaAvZoEALw_wcB"
  }
];
