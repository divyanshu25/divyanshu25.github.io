import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Divyanshu Goyal - Applied Scientist & ML Researcher",
  description: "Applied Scientist at Adobe specializing in Large Language Models, Vision-Language Models, and multimodal reasoning systems. Author of 5 patents and peer-reviewed research.",
  keywords: ["Machine Learning", "Large Language Models", "Vision-Language Models", "RLHF", "AI Research", "Adobe"],
  authors: [{ name: "Divyanshu Goyal" }],
  openGraph: {
    title: "Divyanshu Goyal - Applied Scientist & ML Researcher",
    description: "Applied Scientist at Adobe specializing in Large Language Models, Vision-Language Models, and multimodal reasoning systems.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
