"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";

// 이름 스타일 옵션 추가
type NameStyleOption = "hanja" | "pureKorean";

/**
 * API로부터 받을 것으로 예상되는 한국 이름 데이터의 구조를 정의하는 인터페이스입니다.
 * (Gemini API 응답 형식 기반)
 */
interface KoreanNameData {
  original_name: string;
  korean_name: string; // 예: "이아름 (李아름, Lee Ah-reum)"
  connection_explanation: string;
  hanja_breakdown: Array<{
    character: string; // 예: "李"
    meaning: string; // 예: "Symbolic meaning of the character and its relevance to the name."
  }>;
  poetic_interpretation: string;
}

/**
 * NameResultDisplay 컴포넌트가 받는 props의 타입을 정의하는 인터페이스입니다.
 * @param data - 표시할 한국 이름 데이터 또는 null.
 * @param loading - 데이터 로딩 상태 (true: 로딩 중, false: 로딩 완료).
 * @param nameStyle - 선택된 이름 스타일 (한자 또는 순우리말).
 */
interface NameResultDisplayProps {
  data: KoreanNameData | null;
  loading: boolean;
  nameStyle: NameStyleOption;
}

/**
 * 변환된 한국 이름과 관련 정보를 표시하는 컴포넌트입니다.
 * 로딩 상태 및 데이터 유무에 따라 다른 UI를 렌더링합니다.
 */
export function NameResultDisplay({
  data,
  loading,
  nameStyle,
}: NameResultDisplayProps) {
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [audioLoading, setAudioLoading] = React.useState(false);

  // 한국어 이름을 추출 (괄호 부분 제외)
  const extractKoreanName = (koreanNameText: string): string => {
    // "이아름 (李아름, Lee Ah-reum)" 형식에서 "이아름" 부분만 추출
    const match = koreanNameText.match(/^([^\(]+)/);
    return match ? match[1].trim() : koreanNameText;
  };

  // Google TTS API를 호출하여 음성 생성
  const fetchAudioFromGoogleTTS = async (text: string): Promise<string> => {
    const response = await fetch("/api/generate-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error("음성 생성 실패");
    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  };

  // 음성 생성 함수 (useCallback으로 감싸서 의존성 문제 해결)
  const generateNameAudio = React.useCallback(async () => {
    if (!data) return;

    try {
      setAudioLoading(true);

      // 한국어 이름만 추출 (괄호나 영문 표기 없이)
      const koreanNameOnly = extractKoreanName(data.korean_name);

      // 텍스트 구성 (이름 + 간략한 설명)
      const textToSpeech = `${koreanNameOnly}`;

      // Google TTS API를 호출하여 음성 생성
      const audioUrl = await fetchAudioFromGoogleTTS(textToSpeech);
      setAudioUrl(audioUrl);
    } catch (error) {
      console.error("음성 생성 중 오류가 발생했습니다:", error);
      setAudioUrl(null);
    } finally {
      setAudioLoading(false);
    }
  }, [data, extractKoreanName, fetchAudioFromGoogleTTS]);

  // 데이터가 변경되면 음성 생성
  React.useEffect(() => {
    if (data && !loading) {
      generateNameAudio();
    }
  }, [data, loading, generateNameAudio]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-6 md:py-8">
        <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
        <p className="text-xs md:text-sm text-muted-foreground">
          Generating your Korean name...
        </p>
      </div>
    );
  }

  if (!data) {
    return null; // 데이터가 없으면 아무것도 표시하지 않음 (초기 상태 또는 오류 시)
  }

  // 데이터가 성공적으로 로드되면 결과를 표시합니다.
  return (
    <div className="w-full space-y-4 md:space-y-6">
      <h2 className="text-center text-lg md:text-xl font-semibold text-foreground lg:text-2xl">
        ✨ Generated Korean Name ✨
      </h2>

      <div className="space-y-1">
        <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
          Original Name
        </h3>
        <p className="text-sm md:text-base text-foreground lg:text-lg">
          {data.original_name}
        </p>
      </div>

      <div className="space-y-1">
        <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
          {nameStyle === "hanja"
            ? "Korean Name (Hangeul, Hanja, Romanized)"
            : "Korean Name (Hangeul, Romanized)"}
        </h3>
        <p className="text-sm md:text-base text-foreground lg:text-lg">
          {data.korean_name}
        </p>

        {/* 오디오 플레이어 컴포넌트 */}
        <AudioPlayer audioUrl={audioUrl} loading={audioLoading} />
      </div>

      <div className="space-y-1">
        <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
          Meaning and Connection in the Name
        </h3>
        <p className="whitespace-pre-wrap text-sm md:text-base text-foreground lg:text-lg">
          {data.connection_explanation}
        </p>
      </div>

      {data.hanja_breakdown && data.hanja_breakdown.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
            {nameStyle === "hanja"
              ? "Hanja Breakdown"
              : "Pure Korean Word Meaning"}
          </h3>
          <div className="space-y-2">
            {data.hanja_breakdown.map((item, index) => (
              <div
                key={index}
                className="rounded-md border bg-muted/30 p-3 dark:border-neutral-700/60"
              >
                <p className="font-semibold text-primary sm:text-base">
                  {item.character}
                </p>
                <p className="text-sm text-foreground/90 sm:text-base">
                  {item.meaning}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.poetic_interpretation && (
        <div className="space-y-1">
          <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
            Poetic Interpretation
          </h3>
          <p className="whitespace-pre-wrap text-sm md:text-base text-foreground lg:text-lg">
            {data.poetic_interpretation}
          </p>
        </div>
      )}
    </div>
  );
}
