import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

// Edge Runtime 설정
export const runtime = "edge";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookieStore,
    });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 요청 URL의 origin을 사용하여 리디렉션 URL 생성
  const origin = requestUrl.origin;
  console.log("Auth callback redirecting to origin:", origin);

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/", origin));
}
