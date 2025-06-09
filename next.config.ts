import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Trailing slash 설정 추가 - URL 끝의 슬래시를 허용
  trailingSlash: true,
  // 환경 변수가 빌드 시점이나 런타임에서 사용될 수 있도록 설정
  env: {
    GEMINI_API_KEY_FREE: process.env.GEMINI_API_KEY_FREE || "",
  },
  // Cloudflare Pages 환경에 최적화
  // @google/genai 패키지를 Edge Runtime에서 사용하도록 설정
  serverExternalPackages: ["@google/genai"],
  // 리다이렉트 규칙 - trailing slash 처리
  redirects: async () => {
    return [
      {
        source: "/:path*/",
        has: [
          {
            type: "header",
            key: "host",
            value: "nametokorean.com",
          },
        ],
        destination: "/:path*",
        permanent: true,
      },
    ];
  },
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
          // CORS 헤더 추가 - API 라우트에 대한 접근 허용
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // 모든 도메인에서 접근 허용 (프로덕션에서는 특정 도메인으로 제한해야 함)
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, Origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
