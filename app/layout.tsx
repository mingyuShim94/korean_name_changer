import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";

// Cloudflare Pages를 위한 Edge Runtime 설정
export const runtime = "edge";

// const inter = Inter({ subsets: ["latin"] });

// BASE_URL 설정
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "MyKoreanName - Convert Your Name to a Korean Name",
  description:
    "Convert your name to a beautiful Korean name with MyKoreanName. Choose between masculine, feminine, or neutral styles, and pick either Hanja (Chinese character) or pure Korean name formats. Currently free during beta test. Discover a new cultural identity with a meaningful Korean name interpretation.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  keywords:
    "korean name, name translator, hanja name, pure korean name, name converter, korean culture",
  authors: [
    {
      name: "MyKoreanName Team",
    },
  ],
  openGraph: {
    title: "MyKoreanName - Get Your Korean Name",
    description:
      "Transform your name into a beautiful Korean name with deep cultural meaning. Free service available in Hanja or Pure Korean style.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "MyKoreanName",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="flex flex-col h-full">
        <GoogleAnalytics />
        <Header />
        <main className="flex-grow container mx-auto py-6 px-4 md:py-10 md:px-6 max-w-4xl">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
