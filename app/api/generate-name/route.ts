import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  generateKoreanNameWithGemini as generateFreeKoreanName,
  KoreanNameData,
} from "../../lib/freeGeminiAPI";
import { generateSimplifiedKoreanNameWithGemini } from "../../lib/premiumGeminiAPI";
import { GenderOption, NameStyleOption } from "../../lib/premiumSystemPrompts";
import { SimplifiedKoreanNameData } from "../../lib/premiumGeminiAPI";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

// 기존 결과 데이터를 위한 타입 (하위 호환성)
type LegacyKoreanNameResult = {
  original_name: string;
  korean_name_suggestion: {
    full_name: string;
    syllables: Array<{
      syllable: string;
      romanization: string;
      hanja: string;
      meaning: string;
    }>;
    rationale: string;
    life_values?: string;
  };
  original_name_analysis?: {
    letters?: Array<{
      letter: string;
      meaning: string;
    }>;
    summary?: string;
  };
  korean_name_impression?: string;
  social_share_content: {
    formatted: string;
    summary: string;
  };
};

// 새로운 간소화된 결과 데이터 타입
type SimplifiedKoreanNameResult = SimplifiedKoreanNameData;

// 통합 결과 타입 (세 구조 모두 지원)
type KoreanNameResult =
  | LegacyKoreanNameResult
  | SimplifiedKoreanNameResult
  | KoreanNameData;

// Edge Runtime is required for Cloudflare Pages
export const runtime = "edge";

// List of allowed domains (replace with actual domains in production)
const allowedOrigins = [
  "https://korean-name-changer.pages.dev",
  "https://nametokorean.com",
  "http://localhost:3000",
];

// Map to store processed requests (memory cache)
// For production, using Redis or external cache service is recommended
const processedRequests = new Map<string, KoreanNameResult>();

// API key validation
if (!process.env.GEMINI_API_KEY_FREE || !process.env.GEMINI_API_KEY_PAID) {
  console.error(
    "CRITICAL: One or more Gemini API keys are not set in environment variables."
  );
  // In production environment, you may disable functionality or halt the application here
}

// JWT secret key validation
if (!process.env.JWT_SECRET) {
  console.error("CRITICAL: JWT_SECRET is not set in environment variables.");
}

export async function POST(request: NextRequest) {
  console.log("API request started (Edge Runtime)");

  // Check request Origin
  const origin = request.headers.get("origin") || "";
  console.log("Request Origin:", origin);

  // Headers for CORS configuration
  const corsHeaders: HeadersInit = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };

  // Handle OPTIONS request (preflight)
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Optimize request processing for reliable execution in Edge Runtime
    const body = await request.json().catch((e) => {
      console.error("Request JSON parsing error:", e);
      return {};
    });

    console.log("API request body:", JSON.stringify(body));

    // JWT token validation
    const token = body?.token;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication token required." },
        { status: 401, headers: corsHeaders }
      );
    }

    try {
      // Decode and validate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error("JWT_SECRET environment variable is not set.");
      }

      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(jwtSecret)
      );

      // Check required fields
      const name = payload.name as string;
      const gender = payload.gender as GenderOption;
      const nameStyle = payload.nameStyle as NameStyleOption;
      const isPremium = payload.isPremium as boolean;
      const requestId = payload.requestId as string;
      // 차감 여부를 JWT 토큰에서 확인 (creditApplied 필드)
      const creditApplied = payload.creditApplied as boolean;
      // 새로운 간소화된 API 사용 여부 확인
      const useSimplifiedAPI = payload.useSimplifiedAPI as boolean;

      if (!name || !gender || !nameStyle || !requestId) {
        return NextResponse.json(
          { error: "Required information missing in token." },
          { status: 400, headers: corsHeaders }
        );
      }

      console.log("Token validation completed:", {
        requestId,
        creditApplied,
        useSimplifiedAPI,
      });

      // Check if request has already been processed (prevent duplicate requests)
      if (processedRequests.has(requestId)) {
        console.log(
          `Duplicate request detected: ${requestId}, returning cached result`
        );
        const cachedData = processedRequests.get(requestId);

        // Add token information to cached data
        const responseData = {
          ...cachedData,
          isPremium,
          gender,
          nameStyle,
          useSimplifiedAPI: useSimplifiedAPI || false,
        };

        return NextResponse.json(responseData, {
          headers: corsHeaders,
        });
      }

      // 프리미엄 요청인 경우에만 이용권 확인 및 사용
      if (isPremium) {
        // 클라이언트에서 이미 크레딧을 차감했는지 확인
        if (creditApplied) {
          console.log(
            "Credit already applied on client side, skipping credit check"
          );
        } else {
          // 크레딧이 아직 차감되지 않은 경우에만 확인 로직 실행
          try {
            // Supabase 클라이언트 생성
            const supabase = createRouteHandlerClient<Database>({ cookies });

            // 현재 사용자 확인
            const {
              data: { user },
              error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
              return NextResponse.json(
                { error: "Authentication required for premium features." },
                { status: 401, headers: corsHeaders }
              );
            }

            // 사용 가능한 프리미엄 이용권 확인
            const { data: credits, error: creditError } = await supabase
              .from("premium_credits")
              .select("*")
              .eq("user_id", user.id)
              .gt("credits_remaining", 0)
              .gte("expires_at", new Date().toISOString())
              .order("expires_at", { ascending: true })
              .limit(1);

            if (creditError) {
              return NextResponse.json(
                { error: "Failed to check premium credits." },
                { status: 500, headers: corsHeaders }
              );
            }

            if (!credits || credits.length === 0) {
              return NextResponse.json(
                { error: "No available premium credits." },
                { status: 402, headers: corsHeaders }
              );
            }

            console.warn("Premium request without credit application flag.");
            // 로그만 남기고 계속 진행 (이전 버전과의 호환성 유지)
          } catch (cookieError) {
            console.error("Cookie processing error:", cookieError);
            return NextResponse.json(
              { error: "Authentication error for premium features." },
              { status: 401, headers: corsHeaders }
            );
          }
        }
      }

      console.log(
        `API request parameters: name=${name}, gender=${gender}, nameStyle=${nameStyle}, isPremium=${isPremium}, useSimplifiedAPI=${useSimplifiedAPI}`
      );

      // Generate name using appropriate API based on flags
      let result;
      if (useSimplifiedAPI || isPremium) {
        // 새로운 간소화된 API 사용 (프리미엄 또는 간소화 API 요청)
        result = await generateSimplifiedKoreanNameWithGemini({
          name,
          gender,
          nameStyle,
        });
      } else {
        // 기존 무료 API 사용
        result = await generateFreeKoreanName({
          name,
          gender,
          nameStyle,
        });
      }

      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: 500, headers: corsHeaders }
        );
      }

      if (result.data) {
        // Cache results (1 hour)
        processedRequests.set(requestId, result.data);
        setTimeout(() => processedRequests.delete(requestId), 3600000); // Delete after 1 hour

        // Add information extracted from JWT token to the response
        const responseData = {
          ...result.data,
          isPremium,
          gender,
          nameStyle,
          useSimplifiedAPI: useSimplifiedAPI || false, // 새로운 API 사용 여부 추가
        };

        return NextResponse.json(responseData, { headers: corsHeaders });
      }

      return NextResponse.json(
        { error: "No data returned from name generation service" },
        { status: 500, headers: corsHeaders }
      );
    } catch (tokenError) {
      console.error("Token validation error:", tokenError);
      return NextResponse.json(
        { error: "Invalid or expired token." },
        { status: 401, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error("\n[에러] 이름 생성 중 오류 발생:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while processing your request.",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
