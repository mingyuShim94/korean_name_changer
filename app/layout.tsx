import type { Metadata, Viewport } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import SupabaseProvider from "./providers";

// Cloudflare Pages를 위한 Edge Runtime 설정
export const runtime = "edge";

// const inter = Inter({ subsets: ["latin"] });

// BASE_URL 설정
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// viewport 설정을 별도로 내보내기
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// JSON-LD 스키마 데이터
const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "NameToKorean - Free Korean Name Generator",
  description:
    "Free AI-powered Korean name generator that transforms your name into beautiful Korean with cultural meanings, Hanja characters and pronunciation guide",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web Browser",
  url: BASE_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "Free Korean name generation",
    "Cultural meaning explanations",
    "Hanja character meanings",
    "Pronunciation guide",
    "AI-powered translations",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1247",
    bestRating: "5",
  },
};

export const metadata: Metadata = {
  title: "Free Korean Name Generator - Get Your Korean Name in Seconds",
  description:
    "✨ Instantly transform your name into a beautiful Korean name with cultural meaning. Free AI-powered generator with Hanja meanings & pronunciation guide.",
  keywords:
    "korean name generator, my korean name, korean name translator, what is my korean name, korean name meaning, hanja name, free korean name, korean culture",
  authors: [
    {
      name: "NameToKorean Team",
    },
  ],
  openGraph: {
    title: "🇰🇷 Free Korean Name Generator - Discover Your Korean Identity",
    description:
      "✨ Get your Korean name instantly! AI-powered generator with cultural meanings, Hanja characters & pronunciation. Used by 10,000+ people worldwide.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Korean Name Generator - Transform your name into Korean",
      },
    ],
    type: "website",
    siteName: "NameToKorean",
  },
  twitter: {
    card: "summary_large_image",
    title: "🇰🇷 What's Your Korean Name? Find Out in Seconds!",
    description:
      "✨ Free AI Korean name generator with meanings & pronunciation. Transform your name into beautiful Korean with cultural significance!",
    images: [`${BASE_URL}/og-image.png`],
    creator: "@nametokorean",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  // Next.js 메타데이터 API로 JSON-LD 추가
  other: {
    "custom-schema": JSON.stringify(jsonLd),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col h-full">
        <GoogleAnalytics />
        <SupabaseProvider>
          <Header />
          <main className="flex-grow container mx-auto py-3 px-1 md:py-10 md:px-6 max-w-4xl">
            {children}
          </main>
          <Footer />
        </SupabaseProvider>
      </body>
    </html>
  );
}
