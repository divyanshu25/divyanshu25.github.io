export interface SideProject {
  id: string;
  title: string;
  tagline: string;
  description: string;
  logo?: string;
  platform: string;
  tags: string[];
  links: { label: string; href: string }[];
}

export const sideProjects: SideProject[] = [
  {
    id: "carotter",
    title: "CarOtter",
    tagline: "A friendly helper for your car.",
    description:
      "Plug in a cheap Bluetooth OBD-II adapter and CarOtter shows what your engine is doing, tells you if you'll pass smog, and explains that check engine light in plain English. It can run the assistant on-device, and your car's data never leaves your phone.",
    logo: "/side-projects/carotter-logo.png",
    platform: "iOS",
    tags: [],
    links: [
      { label: "App Store", href: "https://apps.apple.com/app/carotter/id6760602904" },
      { label: "Website", href: "https://divyanshu25.github.io/CarOtterPrivacy/" },
    ],
  },
  {
    id: "brownbearai",
    title: "BrownBearAI",
    tagline: "Every photo is a memory.",
    description:
      "A photo app that helps you make room on your phone without losing what matters, turns albums into little movies set to music, and finds people and moments in your library. All of it runs on your iPhone.",
    logo: "/side-projects/brownbearai-logo.png",
    platform: "iOS",
    tags: [],
    links: [
      { label: "App Store", href: "https://apps.apple.com/app/id6796580170" },
      { label: "Website", href: "https://divyanshu25.github.io/BrownBearAIPrivacy/" },
    ],
  },
];
