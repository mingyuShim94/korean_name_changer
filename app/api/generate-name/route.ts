import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  generateKoreanNameWithGemini,
  KoreanNameData,
} from "../../lib/geminiAPI";
import { GenderOption, NameStyleOption } from "../../lib/krNameSystemPrompts";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

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
const processedRequests = new Map<string, KoreanNameData>();

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

      if (!name || !gender || !nameStyle || !requestId) {
        return NextResponse.json(
          { error: "Required information missing in token." },
          { status: 400, headers: corsHeaders }
        );
      }

      console.log("Token validation completed:", { requestId });

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
        };

        return NextResponse.json(responseData, {
          headers: corsHeaders,
        });
      }

      // 프리미엄 요청인 경우 이용권 확인 및 사용
      if (isPremium) {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient<Database>({
          cookies: () => cookieStore,
        });

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
        const { data: credit, error: creditError } = await supabase
          .from("premium_credits")
          .select("id, user_id, payment_id, used_at, created_at")
          .eq("user_id", user.id)
          .is("used_at", null)
          .single();

        if (creditError || !credit) {
          return NextResponse.json(
            { error: "No available premium credits." },
            { status: 402, headers: corsHeaders }
          );
        }

        // 이용권 사용 처리
        const { error: updateError } = await supabase
          .from("premium_credits")
          .update({ used_at: new Date().toISOString() })
          .eq("id", credit.id);

        if (updateError) {
          console.error("Failed to update premium credit:", updateError);
          return NextResponse.json(
            { error: "Failed to process premium credit." },
            { status: 500, headers: corsHeaders }
          );
        }
      }

      console.log(
        `API request parameters: name=${name}, gender=${gender}, nameStyle=${nameStyle}, isPremium=${isPremium}`
      );

      // Generate name using common function
      const result = await generateKoreanNameWithGemini({
        name,
        gender,
        nameStyle,
        isPremium,
      });

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
