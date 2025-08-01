import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isLoggedIn = !!session;
  const path = request.nextUrl.pathname;

  // 루트 경로에 접근했을 때 로그인 상태에 따라 리다이렉션
  if (path === "/") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/generate", request.url));
    }
  }

  // generate 페이지에 접근했을 때 로그인 상태 확인
  if (path === "/generate" && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return res;
}

// 미들웨어가 실행될 경로 지정
export const config = {
  matcher: ["/", "/generate"],
};
