import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 환경 변수가 빌드 시점이나 런타임에서 사용될 수 있도록 설정
  env: {
    GEMINI_API_KEY_FREE: process.env.GEMINI_API_KEY_FREE || "",
  },
  // Cloudflare Pages 환경에 최적화
  // @google/genai 패키지를 Edge Runtime에서 사용하도록 설정
  serverExternalPackages: ["@google/genai"],
  // 보안 헤더 설정
  headers: async () => {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
