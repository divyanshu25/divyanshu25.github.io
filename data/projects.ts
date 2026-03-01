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
    id: "facemask-detection",
    title: "FaceMask Detection",
    summary: "Using CNNs and Variational Autoencoders to detect people wearing masks or not.",
    description: `The rise of the COVID-19 pandemic has brought about unprecedented changes all around the world. This project aims to identify whether a person is properly wearing a mask or not using deep learning techniques.

We implemented multiple approaches including ResNet, EfficientNet, AlexNet, GoogleNet, and Variational Autoencoders. The models were trained on the FaceMask 12K dataset with 10,000 training images.

Key achievements:
- Achieved 99.6% precision with ResNet
- Implemented GradCAM for model visualization
- Compared multiple optimizers (Adam, SGD, ADADELTA)
- Used both supervised and unsupervised learning approaches`,
    tags: ["Deep Learning", "Machine Learning"],
    date: "2020-12-03",
    authors: ["Divyanshu Goyal", "Sravanthi Ashok Kumar", "Swati Ghosh", "Nikhil Badami", "Safin Salih"]
  },
  {
    id: "image-query",
    title: "Image Query",
    summary: "Using CNNs and LSTMs to query images based on a textual query.",
    description: `Image search using textual description is a powerful tool with numerous applications. This project builds a system that can query images by using their features to generate textual descriptions, breaking the dependency on manual metadata tagging.

We implemented both vanilla CNN-LSTM and attention-based architectures, trained on COCO and Flickr8k datasets. Each image in these datasets has 5 human-generated captions.

Key features:
- Vanilla CNN-LSTM architecture using ResNet50 encoder
- Attention-based CNN-LSTM using ResNet101
- BERT embeddings for improved language understanding
- REST API for image querying
- Extended to support image-based search (find similar images)
- Weighted cosine similarity for better search results`,
    tags: ["Deep Learning", "Machine Learning"],
    date: "2020-12-03",
    authors: ["Divyanshu Goyal", "Harish Krupo", "Shubhi Agarwal"],
    github: "https://github.com/divyanshu25/ImageQuery"
  },
  {
    id: "rock-outcrop",
    title: "Extracting Rock Outcrop from Antarctic Landsat Imagery",
    summary: "Using SegNet to extract rock outcrop from satellite images of Antarctica for various research purposes.",
    description: `This project uses semantic segmentation techniques to extract rock outcrop features from satellite imagery of Antarctica. The work supports various geological and environmental research purposes by automating the identification of exposed rock formations in polar regions.

We implemented SegNet architecture for pixel-wise classification of satellite imagery, enabling accurate identification of rock outcrops against ice and snow backgrounds.`,
    tags: ["Deep Learning"],
    date: "2019-11-27",
    authors: ["Divyanshu Goyal"]
  },
  {
    id: "gray-video-colorization",
    title: "Gray Scale Video Colorization",
    summary: "Using CNNs and LSTMs to colorize gray scale videos, to bring them back to life.",
    description: `This project focuses on automatic colorization of grayscale videos using deep learning. By leveraging both spatial (CNN) and temporal (LSTM) features, the model learns to predict realistic colors for grayscale video frames.

The system maintains temporal consistency across frames, ensuring smooth and natural-looking colorization throughout the video sequence.`,
    tags: ["Deep Learning"],
    date: "2019-08-27",
    authors: ["Divyanshu Goyal"]
  }
];
