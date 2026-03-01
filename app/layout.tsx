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
  title: "Divyanshu Goyal - ML Engineer & Researcher",
  description: "Graduate student at Georgia Tech specializing in Machine Learning, Computer Vision, and Deep Learning. Explore my projects and technical blog.",
  keywords: ["Machine Learning", "Deep Learning", "Computer Vision", "Georgia Tech", "AI Research"],
  authors: [{ name: "Divyanshu Goyal" }],
  openGraph: {
    title: "Divyanshu Goyal - ML Engineer & Researcher",
    description: "Graduate student at Georgia Tech specializing in Machine Learning, Computer Vision, and Deep Learning.",
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
