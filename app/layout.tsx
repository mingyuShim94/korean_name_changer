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
  "@type": "WebApplication",
  name: "NameToKorean",
  description:
    "Convert your name to a beautiful Korean name with cultural meaning",
  applicationCategory: "UtilityApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export const metadata: Metadata = {
  title: "NameToKorean - Convert Your Name to a Korean Name",
  description:
    "Transform your name into a meaningful Korean name. Choose masculine, feminine, or neutral styles in Hanja or pure Korean format.",
  keywords:
    "korean name, name translator, hanja name, pure korean name, name converter, korean culture",
  authors: [
    {
      name: "NameToKorean Team",
    },
  ],
  openGraph: {
    title: "NameToKorean - Get Your Korean Name",
    description:
      "Transform your name into a meaningful Korean name. Choose masculine, feminine, or neutral styles in Hanja or pure Korean format.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "NameToKorean",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NameToKorean - Get Your Korean Name",
    description:
      "Transform your name into a beautiful Korean name with deep cultural meaning.",
    images: [`${BASE_URL}/og-image.png`],
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
          <main className="flex-grow container mx-auto py-6 px-0 md:py-10 md:px-6 max-w-4xl">
            {children}
          </main>
          <Footer />
        </SupabaseProvider>
      </body>
    </html>
  );
}
