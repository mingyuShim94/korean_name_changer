import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  generateKoreanNameWithGemini,
  KoreanNameData,
} from "../../lib/geminiAPI";
import { GenderOption, NameStyleOption } from "../../lib/krNameSystemPrompts";

// Cloudflare Pages에서는 Edge Runtime이 필수입니다
export const runtime = "edge";

// 허용할 도메인 목록 (프로덕션 환경에서는 실제 도메인으로 교체)
const allowedOrigins = [
  "https://korean-name-changer.pages.dev",
  "https://mykoreanname.me",
  "http://localhost:3000",
];

// 처리된 요청을 저장하는 맵 (메모리 캐시)
// 실제 프로덕션에서는 Redis나 외부 캐시 서비스 사용 권장
const processedRequests = new Map<string, KoreanNameData>();

// API 키 검증
if (!process.env.GEMINI_API_KEY_FREE || !process.env.GEMINI_API_KEY_PAID) {
  console.error(
    "CRITICAL: One or more Gemini API keys are not set in environment variables."
  );
  // 프로덕션 환경에서는 여기서 애플리케이션을 중단하거나, 기능을 비활성화할 수 있습니다.
}

// JWT 비밀키 검증
if (!process.env.JWT_SECRET) {
  console.error("CRITICAL: JWT_SECRET is not set in environment variables.");
}

export async function POST(request: NextRequest) {
  console.log("API 요청이 시작되었습니다 (Edge Runtime)");

  // 요청 Origin 확인
  const origin = request.headers.get("origin") || "";
  console.log("요청 Origin:", origin);

  // CORS 설정을 위한 헤더
  const corsHeaders: HeadersInit = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };

  // OPTIONS 요청에 대한 처리 (preflight)
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Edge Runtime에서 안정적으로 실행되도록 요청 처리 최적화
    const body = await request.json().catch((e) => {
      console.error("요청 JSON 파싱 오류:", e);
      return {};
    });

    console.log("API 요청 본문:", JSON.stringify(body));

    // JWT 토큰 검증
    const token = body?.token;
    if (!token) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다." },
        { status: 401, headers: corsHeaders }
      );
    }

    try {
      // JWT 토큰 해독 및 검증
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");
      }

      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(jwtSecret)
      );

      // 필수 필드 확인
      const name = payload.name as string;
      const gender = payload.gender as GenderOption;
      const nameStyle = payload.nameStyle as NameStyleOption;
      const isPremium = payload.isPremium as boolean;
      const requestId = payload.requestId as string;

      if (!name || !gender || !nameStyle || !requestId) {
        return NextResponse.json(
          { error: "토큰에 필요한 정보가 누락되었습니다." },
          { status: 400, headers: corsHeaders }
        );
      }

      console.log("토큰 검증 완료:", { requestId });

      // 이미 처리된 요청인지 확인 (중복 요청 방지)
      if (processedRequests.has(requestId)) {
        console.log(`중복 요청 감지: ${requestId}, 캐시된 결과 반환`);
        const cachedData = processedRequests.get(requestId);

        // 캐시된 데이터에 토큰 정보 추가
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

      console.log(
        `API 요청 파라미터: name=${name}, gender=${gender}, nameStyle=${nameStyle}, isPremium=${isPremium}`
      );

      // 공통 함수를 사용하여 이름 생성
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
        // 결과 캐싱 (1시간)
        processedRequests.set(requestId, result.data);
        setTimeout(() => processedRequests.delete(requestId), 3600000); // 1시간 후 삭제

        // JWT 토큰에서 추출한 정보를 응답에 추가
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
      console.error("토큰 검증 오류:", tokenError);
      return NextResponse.json(
        { error: "유효하지 않거나 만료된 토큰입니다." },
        { status: 401, headers: corsHeaders }
      );
    }
  } catch (error) {
    // error 타입을 Error 또는 unknown으로 변경
    let errorMessage =
      "An unexpected error occurred while processing your request.";
    const errorDetails = error instanceof Error ? error.message : String(error);
    const statusCode = 500; // 기본 상태 코드를 500으로 설정

    // 콘솔에 더 자세한 오류 정보 로깅
    console.error(
      `Error in POST /api/generate-name:`,
      errorDetails,
      error instanceof Error ? error.stack : "No stack trace available", // 에러 스택 로깅
      error // 전체 에러 객체 로깅
    );

    if (error instanceof Error) {
      if (error.message?.includes("API_RESPONSE_EMPTY")) {
        errorMessage = "Gemini API returned an empty response.";
      } else if (error.message?.includes("API_RESPONSE_MALFORMED")) {
        errorMessage = "Received malformed data from Gemini API.";
      } else if (error.name === "SyntaxError") {
        // JSON.parse 오류
        errorMessage =
          "Failed to parse response from Gemini API. Response was not valid JSON.";
      }
    }

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: statusCode, headers: corsHeaders }
    );
  }
}
