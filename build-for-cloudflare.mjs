import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Cloudflare Pages 배포를 위한 빌드 스크립트
console.log("🚀 Cloudflare Pages 빌드 시작");

try {
  // 1. Next.js 앱 빌드
  console.log("⚙️ Next.js 빌드 중...");
  execSync("npm run build", { stdio: "inherit" });

  // 2. Next on Pages로 변환
  console.log("⚙️ Cloudflare Pages 형식으로 변환 중...");
  execSync("npx @cloudflare/next-on-pages", { stdio: "inherit" });

  // 3. .nojekyll 파일 생성 (GitHub Pages 배포 시 필요)
  const outputDir = path.join(process.cwd(), ".vercel/output/static");
  fs.writeFileSync(path.join(outputDir, ".nojekyll"), "");

  console.log(
    "✅ 빌드 완료! .vercel/output/static 폴더에 배포 파일이 생성되었습니다."
  );
  console.log(
    "📦 Cloudflare Pages에 배포하려면: npx wrangler pages deploy .vercel/output/static"
  );
} catch (error) {
  console.error("❌ 빌드 실패:", error);
  process.exit(1);
}
