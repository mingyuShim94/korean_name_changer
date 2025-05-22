import { NextRequest, NextResponse } from "next/server";
import {
  GenerateNameParams,
  generateKoreanNameWithGemini,
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

// API 키 검증
if (!process.env.GEMINI_API_KEY_FREE || !process.env.GEMINI_API_KEY_PAID) {
  console.error(
    "CRITICAL: One or more Gemini API keys are not set in environment variables."
  );
  // 프로덕션 환경에서는 여기서 애플리케이션을 중단하거나, 기능을 비활성화할 수 있습니다.
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

  let foreignName: string | undefined;
  let gender: GenderOption = "neutral"; // 기본값을 neutral로 설정
  let nameStyle: NameStyleOption = "hanja"; // 기본값을 hanja로 설정
  let isPremium: boolean = false; // 기본값을 false로 설정

  try {
    // Edge Runtime에서 안정적으로 실행되도록 요청 처리 최적화
    const body = await request.json().catch((e) => {
      console.error("요청 JSON 파싱 오류:", e);
      return {};
    });

    console.log("API 요청 본문:", JSON.stringify(body));

    foreignName = body?.name as string;
    // gender 값 유효성 검사 및 할당
    if (
      body?.gender &&
      ["masculine", "feminine", "neutral"].includes(body.gender)
    ) {
      gender = body.gender as GenderOption;
    }

    // nameStyle 값 유효성 검사 및 할당
    if (body?.nameStyle && ["hanja", "pureKorean"].includes(body.nameStyle)) {
      nameStyle = body.nameStyle as NameStyleOption;
    }

    // isPremium 값 확인
    if (typeof body?.isPremium === "boolean") {
      isPremium = body.isPremium;
    }

    if (
      !foreignName ||
      typeof foreignName !== "string" ||
      foreignName.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Name parameter is required and must be a non-empty string." },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(
      `API 요청 파라미터: name=${foreignName}, gender=${gender}, nameStyle=${nameStyle}, isPremium=${isPremium}`
    );

    // params 객체 생성
    const params: GenerateNameParams = {
      name: foreignName,
      gender,
      nameStyle,
      isPremium,
    };

    // 공통 함수를 사용하여 이름 생성
    const result = await generateKoreanNameWithGemini(params);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500, headers: corsHeaders }
      );
    }

    if (result.data) {
      return NextResponse.json(result.data, { headers: corsHeaders });
    }

    return NextResponse.json(
      { error: "No data returned from name generation service" },
      { status: 500, headers: corsHeaders }
    );
  } catch (error) {
    // error 타입을 Error 또는 unknown으로 변경
    let errorMessage =
      "An unexpected error occurred while processing your request.";
    const errorDetails = error instanceof Error ? error.message : String(error);
    const statusCode = 500; // 기본 상태 코드를 500으로 설정

    // 콘솔에 더 자세한 오류 정보 로깅
    console.error(
      `Error in POST /api/generate-name for input: '${foreignName}', gender: '${gender}', style: '${nameStyle}', isPremium: '${isPremium}':`, // 요청 값 로깅
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
