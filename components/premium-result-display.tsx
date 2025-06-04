"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";

// 이름 스타일 옵션
type NameStyleOption = "hanja" | "pureKorean";

/**
 * 프리미엄 한국 이름 데이터의 구조를 정의하는 인터페이스
 */
interface PremiumKoreanNameData {
  original_name: string;
  suggested_korean_name: {
    hangul: string;
    hanja?: string;
    romanization: string;
  };
  interpretation: {
    core_meaning_summary: string;
    element_analysis: Array<{
      hangul_syllable: string;
      hanja_character?: string;
      meaning_english_hint: string;
      relevance_to_name: string;
    }>;
    connection_and_rationale: string;
    synthesized_meaning_and_aspiration: string;
    poetic_interpretation_of_korean_name: string;
    virtue_and_life_direction: string;
    cultural_blessing_note: string;
    full_interpretation_text_narrative: string;
  };
}

/**
 * PremiumResultDisplay 컴포넌트가 받는 props의 타입을 정의하는 인터페이스
 */
interface PremiumResultDisplayProps {
  data: PremiumKoreanNameData | null;
  loading: boolean;
  nameStyle: NameStyleOption;
}

/**
 * 변환된 한국 이름과 관련 정보를 표시하는 프리미엄 컴포넌트
 * 더 자세한 해석 정보를 제공합니다.
 */
export function PremiumResultDisplay({
  data,
  loading,
  nameStyle,
}: PremiumResultDisplayProps) {
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [audioLoading, setAudioLoading] = React.useState(false);

  // 음성 생성 함수 (useCallback으로 감싸서 의존성 문제 해결)
  const generateNameAudio = React.useCallback(async () => {
    if (!data) return;

    try {
      setAudioLoading(true);

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

      // 한국어 이름 추출
      const koreanName = data.suggested_korean_name.hangul;

      // 텍스트 구성 (이름만)
      const textToSpeech = koreanName;

      // Google TTS API를 호출하여 음성 생성
      const audioUrl = await fetchAudioFromGoogleTTS(textToSpeech);
      setAudioUrl(audioUrl);
    } catch (error) {
      console.error("음성 생성 중 오류가 발생했습니다:", error);
      setAudioUrl(null);
    } finally {
      setAudioLoading(false);
    }
  }, [data]);

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
  // 프리미엄 버전은 더 자세한 정보를 표시합니다.
  return (
    <div className="w-full space-y-4 md:space-y-6">
      <div className="flex justify-center">
        <span className="inline-flex items-center rounded-md bg-amber-100/80 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20">
          ✨ Premium Analysis ✨
        </span>
      </div>

      <h2 className="text-center text-lg md:text-xl font-semibold text-foreground lg:text-2xl">
        Your Korean Name
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
          Korean Name
        </h3>
        <div className="flex flex-col gap-1">
          <p className="text-sm md:text-base text-foreground lg:text-lg font-medium">
            {data.suggested_korean_name.hangul}{" "}
            <span className="text-muted-foreground">
              ({data.suggested_korean_name.romanization})
            </span>
          </p>

          {data.suggested_korean_name.hanja && nameStyle === "hanja" && (
            <p className="text-sm text-muted-foreground">
              Hanja: {data.suggested_korean_name.hanja}
            </p>
          )}

          {/* 오디오 플레이어 컴포넌트 */}
          <AudioPlayer audioUrl={audioUrl} loading={audioLoading} />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
          Core Meaning Summary
        </h3>
        <p className="whitespace-pre-wrap text-sm md:text-base text-foreground lg:text-lg">
          {data.interpretation.core_meaning_summary}
        </p>
      </div>

      {data.interpretation.element_analysis &&
        data.interpretation.element_analysis.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
              Name Elements Analysis
            </h3>
            <div className="space-y-2">
              {data.interpretation.element_analysis.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-md border bg-muted/30 p-3 dark:border-neutral-700/60"
                >
                  <span className="font-semibold text-primary sm:text-base">
                    {item.hangul_syllable}
                    {item.hanja_character && nameStyle === "hanja" && (
                      <span className="text-muted-foreground ml-1">
                        ({item.hanja_character})
                      </span>
                    )}
                  </span>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    ({item.meaning_english_hint})
                  </p>
                  {/* <p className="text-sm text-muted-foreground mt-1">
                    {item.relevance_to_name}
                  </p> */}
                </div>
              ))}
            </div>
          </div>
        )}

      <div className="space-y-1">
        <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
          Connection & Rationale
        </h3>
        <p className="whitespace-pre-wrap text-sm md:text-base text-foreground lg:text-lg">
          {data.interpretation.connection_and_rationale}
        </p>
      </div>

      <div className="space-y-1">
        <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
          Meaning & Aspiration
        </h3>
        <p className="whitespace-pre-wrap text-sm md:text-base text-foreground lg:text-lg">
          {data.interpretation.synthesized_meaning_and_aspiration}
        </p>
      </div>

      <div className="space-y-1">
        <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
          Poetic Interpretation
        </h3>
        <p className="whitespace-pre-wrap text-sm md:text-base text-foreground italic">
          &ldquo;{data.interpretation.poetic_interpretation_of_korean_name}
          &rdquo;
        </p>
      </div>

      <div className="space-y-1">
        <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
          Virtues & Life Direction
        </h3>
        <p className="whitespace-pre-wrap text-sm md:text-base text-foreground lg:text-lg">
          {data.interpretation.virtue_and_life_direction}
        </p>
      </div>

      <div className="space-y-1 bg-gradient-to-r from-yellow-100/70 via-amber-50/70 to-yellow-100/70 dark:from-yellow-900/30 dark:via-amber-900/20 dark:to-yellow-900/30 p-4 rounded-md">
        <h3 className="text-xs md:text-sm font-medium text-amber-700 dark:text-amber-400">
          Cultural Blessing
        </h3>
        <p className="whitespace-pre-wrap text-sm md:text-base text-amber-800 dark:text-amber-300 lg:text-lg italic">
          {data.interpretation.cultural_blessing_note}
        </p>
      </div>

      <div className="space-y-1 border-t pt-4 mt-6">
        <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
          Complete Name Interpretation
        </h3>
        <p className="whitespace-pre-wrap text-sm md:text-base text-foreground lg:text-lg">
          {data.interpretation.full_interpretation_text_narrative}
        </p>
      </div>
    </div>
  );
}
