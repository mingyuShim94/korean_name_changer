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
  const API_KEY = process.env.GOOGLE_TTS_API_KEY;

  if (!API_KEY) {
    console.error("Google Cloud API 키가 없습니다.");
    return NextResponse.json(
      { error: "Server configuration error. API key is missing." },
      { status: 500 }
    );
  }

  try {
    // 요청 데이터 파싱
    const body = await request.json();
    const { text } = body as TextToSpeechRequest;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { error: "Text parameter is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    // Google Cloud Text-to-Speech API 호출
    const googleTTSResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            text: text,
          },
          voice: {
            languageCode: "ko-KR",
            name: "ko-KR-Chirp3-HD-Callirrhoe", // HD 음성으로 변경
            ssmlGender: "FEMALE",
          },
          audioConfig: {
            audioEncoding: "MP3",
            pitch: 0,
            speakingRate: 1.0,
          },
        }),
      }
    );

    if (!googleTTSResponse.ok) {
      const errorText = await googleTTSResponse.text();
      throw new Error(
        `Google Cloud TTS API error: ${googleTTSResponse.status} - ${errorText}`
      );
    }

    // 응답 데이터 가져오기 (base64로 인코딩된 오디오)
    const responseData = await googleTTSResponse.json();

    // base64 디코딩하여 오디오 데이터로 변환
    const audioContent = responseData.audioContent;
    const audioBuffer = Buffer.from(audioContent, "base64");

    // 바이너리 데이터를 그대로 클라이언트에 전달
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000", // 1년간 캐싱 (재사용 가능)
      },
    });
  } catch (error) {
    console.error("오디오 생성 중 오류가 발생했습니다:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
