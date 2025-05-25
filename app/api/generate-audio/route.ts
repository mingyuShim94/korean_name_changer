import { NextRequest, NextResponse } from "next/server";

// Cloudflare Pages에서는 Edge Runtime이 필수입니다
export const runtime = "edge";

// API 요청 타입
interface TextToSpeechRequest {
  text: string;
}

export async function POST(request: NextRequest) {
  console.log("오디오 생성 API 요청이 시작되었습니다 (Edge Runtime)");

  // 환경 변수에서 API 키 가져오기
  const API_KEY = process.env.ELEVENLABS_API_KEY;

  if (!API_KEY) {
    console.error("ElevenLabs API 키가 없습니다.");
    return NextResponse.json(
      { error: "Server configuration error. API key is missing." },
      { status: 500 }
    );
  }

  try {
    // 요청 데이터 파싱
    const body = await request.json();
    const { text } = body as TextToSpeechRequest;

    console.log("변환활 텍스트=", text);

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { error: "Text parameter is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    const VOICE_ID = "xi3rF0t7dg7uN2M0WUhr";
    // ElevenLabs API 직접 호출
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_flash_v2_5",
          voice_settings: {
            stability: 1,
            similarity_boost: 1,
            speaking_rate: 0.9,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API 오류: ${response.status}`);
    }

    // 오디오 데이터를 바이너리로 받아옴
    const audioData = await response.arrayBuffer();

    // Edge Runtime에서 지원하는 Response 형식으로 반환
    return new NextResponse(audioData, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000", // 1년간 캐싱
      },
    });
  } catch (error) {
    console.error("오디오 생성 중 오류가 발생했습니다:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
