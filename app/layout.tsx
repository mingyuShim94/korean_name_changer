import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

// Cloudflare Pages를 위한 Edge Runtime 설정
export const runtime = "edge";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Korean Name Changer",
  description:
    "Korean Name Changer is a poetic naming web service that meaningfully reinterprets foreign names into Korean-style names. This service aims to help users with foreign names explore a new identity by connecting the meaning and sentiment of their names with the beauty of Korean culture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="flex flex-col h-full">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
