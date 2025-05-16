"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

// 이름 스타일 옵션
type NameStyleOption = "hanja" | "pureKorean";

/**
 * 일반 한국 이름 데이터 인터페이스
 */
interface KoreanNameData {
  original_name: string;
  korean_name: string;
  connection_explanation: string;
  hanja_breakdown: Array<{
    character: string;
    meaning: string;
  }>;
  poetic_interpretation: string;
  virtue_and_life_direction: string;
}

/**
 * 프리미엄 한국 이름 데이터 인터페이스
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
 * 통합 결과 표시 컴포넌트 Props
 */
interface ImprovedResultDisplayProps {
  data: KoreanNameData | PremiumKoreanNameData | null;
  loading: boolean;
  nameStyle: NameStyleOption;
  isPremium: boolean;
}

/**
 * 개선된 이름 결과 표시 컴포넌트
 * 개선 전략 문서의 권장사항을 적용했습니다:
 * 1. 핵심 의미 우선 전달
 * 2. 한자 표기는 선택적 보조
 * 3. 문화적 맥락 짧게 언급
 * 4. 표현은 쉽고 보편적으로
 * 5. 감성적 요소 가미
 * 6. 구조적 글쓰기
 * 7. 여러 버전 준비 (간략/상세)
 */
export function ImprovedResultDisplay({
  data,
  loading,
  nameStyle,
  isPremium,
}: ImprovedResultDisplayProps) {
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [audioLoading, setAudioLoading] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"concise" | "detailed">(
    "concise"
  );

  // 프리미엄이 아닌 경우 항상 "concise" 뷰 모드로 강제 설정
  React.useEffect(() => {
    if (!isPremium) {
      setViewMode("concise");
    }
  }, [isPremium]);

  // 데이터 타입 확인 함수
  const isPremiumData = (
    data: KoreanNameData | PremiumKoreanNameData | null
  ): data is PremiumKoreanNameData => {
    return data !== null && "suggested_korean_name" in data;
  };

  // 데이터가 변경되면 음성 생성
  React.useEffect(() => {
    if (data && !loading) {
      generateNameAudio();
    }
  }, [data, loading]);

  // 한국어 이름을 추출 (괄호 부분 제외)
  const extractKoreanName = (koreanNameText: string): string => {
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

  // 음성 생성 함수
  const generateNameAudio = async () => {
    if (!data) return;

    try {
      setAudioLoading(true);

      // 한국어 이름 추출
      let koreanName = "";
      if (isPremiumData(data)) {
        koreanName = data.suggested_korean_name.hangul;
      } else {
        koreanName = extractKoreanName(data.korean_name);
      }

      // 음성 생성
      const audioUrl = await fetchAudioFromGoogleTTS(koreanName);
      setAudioUrl(audioUrl);
    } catch (error) {
      console.error("음성 생성 중 오류가 발생했습니다:", error);
      setAudioUrl(null);
    } finally {
      setAudioLoading(false);
    }
  };

  // 로딩 중 UI
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

  // 데이터가 없는 경우
  if (!data) {
    return null;
  }

  // 핵심 요약 데이터 추출
  const getCoreSummary = () => {
    if (isPremiumData(data)) {
      return data.interpretation.core_meaning_summary;
    } else {
      return data.connection_explanation.split(".")[0] + ".";
    }
  };

  // 기본 이름 정보 렌더링
  const renderNameBasics = () => {
    if (isPremiumData(data)) {
      return (
        <>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl md:text-3xl font-bold">
                {data.suggested_korean_name.hangul}
              </h2>
              <span className="text-sm text-muted-foreground italic">
                ({data.suggested_korean_name.romanization})
              </span>
            </div>
            {data.suggested_korean_name.hanja && nameStyle === "hanja" && (
              <p className="text-sm text-muted-foreground">
                한자: {data.suggested_korean_name.hanja}
              </p>
            )}
            <AudioPlayer audioUrl={audioUrl} loading={audioLoading} />
          </div>
        </>
      );
    } else {
      const koreanName = extractKoreanName(data.korean_name);
      // 괄호 안의 한자와 로마자 추출
      const match = data.korean_name.match(/\(([^)]+)\)/);
      const extraInfo = match ? match[1] : "";

      return (
        <>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl md:text-3xl font-bold">{koreanName}</h2>
              {extraInfo && (
                <span className="text-sm text-muted-foreground italic">
                  ({extraInfo})
                </span>
              )}
            </div>
            <AudioPlayer audioUrl={audioUrl} loading={audioLoading} />
          </div>
        </>
      );
    }
  };

  // 이름 요소 분석 렌더링
  const renderNameElements = () => {
    if (isPremiumData(data)) {
      return (
        <div className="flex flex-wrap gap-3 justify-center">
          {data.interpretation.element_analysis.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1 rounded-md border bg-muted/30 p-3 dark:border-neutral-700/60"
            >
              <Badge variant="outline" className="text-primary">
                {item.hangul_syllable}
                {item.hanja_character &&
                  nameStyle === "hanja" &&
                  ` (${item.hanja_character})`}
              </Badge>
              <p className="text-sm sm:text-base text-muted-foreground">
                {item.meaning_english_hint}
              </p>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.hanja_breakdown.map((item, index) => (
            <div
              key={index}
              className="rounded-md border bg-muted/30 p-3 dark:border-neutral-700/60"
            >
              <Badge variant="outline" className="text-primary mb-1">
                {item.character}
              </Badge>
              <p className="text-sm sm:text-base">{item.meaning}</p>
            </div>
          ))}
        </div>
      );
    }
  };

  // 메인 컨텐츠 렌더링
  return (
    <div className="w-full space-y-6">
      {/* 상단 배지 */}
      {isPremium && (
        <div className="flex justify-center">
          <span className="inline-flex items-center rounded-md bg-amber-100/80 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20">
            ✨ Premium Analysis ✨
          </span>
        </div>
      )}

      {/* 원래 이름 */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-1">
          Name Translation for
        </p>
        <p className="text-lg md:text-xl font-medium">{data.original_name}</p>
      </div>

      {/* 구분선 */}
      <div className="border-t my-4"></div>

      {/* 한국 이름 (핵심부분) */}
      <div className="flex flex-col items-center">
        <p className="text-sm text-muted-foreground mb-2">Your Korean Name</p>
        {renderNameBasics()}
      </div>

      {/* 핵심 의미 요약 (강조된 박스) */}
      <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 text-center">
        <p className="text-md md:text-lg">{getCoreSummary()}</p>
      </div>

      {/* 뷰 모드 전환 버튼 - 프리미엄 사용자만 표시 */}
      {isPremium && (
        <div className="flex justify-center gap-3">
          <Button
            variant={viewMode === "concise" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("concise")}
          >
            Simple View
          </Button>
          <Button
            variant={viewMode === "detailed" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("detailed")}
          >
            Detailed View
          </Button>
        </div>
      )}

      {/* 간결한 뷰 - 기본 정보 */}
      {viewMode === "concise" && (
        <div className="space-y-4">
          {/* 이름 요소 분석 */}
          <div className="space-y-2">
            <div className="flex justify-center items-center">
              <h3 className="text-base font-semibold text-muted-foreground mb-2">
                {nameStyle === "hanja"
                  ? "Name Elements Analysis"
                  : "Name Meaning Analysis"}
              </h3>
            </div>
            <div className="bg-muted/20 p-3 rounded-md border">
              {renderNameElements()}
            </div>
          </div>

          {/* 문화적 연결 */}
          <div className="space-y-1 text-center">
            <h3 className="text-base font-semibold text-muted-foreground mb-2">
              Connection to Original Name
            </h3>
            <div className="bg-muted/20 p-3 rounded-md border">
              <p className="whitespace-pre-wrap text-sm md:text-base">
                {isPremiumData(data)
                  ? data.interpretation.connection_and_rationale
                  : data.connection_explanation}
              </p>
            </div>
          </div>

          {/* 시적 해석 */}
          <div className="space-y-1 text-center">
            <h3 className="text-base font-semibold text-muted-foreground mb-2">
              Poetic Interpretation
            </h3>
            <div className="bg-muted/20 p-3 rounded-md border">
              <p className="whitespace-pre-wrap text-sm md:text-base italic">
                {isPremiumData(data)
                  ? `"${data.interpretation.poetic_interpretation_of_korean_name}"`
                  : data.poetic_interpretation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 상세 뷰 - 모든 정보 */}
      {viewMode === "detailed" && (
        <div className="space-y-4">
          {/* 아코디언으로 구성된 상세 내용 */}
          <Accordion type="single" collapsible className="w-full">
            {/* 이름 요소 */}
            <AccordionItem value="elements">
              <AccordionTrigger>Name Elements Analysis</AccordionTrigger>
              <AccordionContent>{renderNameElements()}</AccordionContent>
            </AccordionItem>

            {/* 이름 연결성 */}
            <AccordionItem value="connection">
              <AccordionTrigger>Connection to Original Name</AccordionTrigger>
              <AccordionContent>
                <p className="whitespace-pre-wrap text-sm md:text-base">
                  {isPremiumData(data)
                    ? data.interpretation.connection_and_rationale
                    : data.connection_explanation}
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 뜻과 바람 */}
            <AccordionItem value="meaning">
              <AccordionTrigger>Meaning & Aspiration</AccordionTrigger>
              <AccordionContent>
                <p className="whitespace-pre-wrap text-sm md:text-base">
                  {isPremiumData(data)
                    ? data.interpretation.synthesized_meaning_and_aspiration
                    : data.connection_explanation.split(".").slice(1).join(".")}
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 시적 해석 */}
            <AccordionItem value="poetic">
              <AccordionTrigger>Poetic Interpretation</AccordionTrigger>
              <AccordionContent>
                <p className="whitespace-pre-wrap text-sm md:text-base italic">
                  {isPremiumData(data)
                    ? `"${data.interpretation.poetic_interpretation_of_korean_name}"`
                    : data.poetic_interpretation}
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 덕목과 삶의 방향 */}
            <AccordionItem value="virtues">
              <AccordionTrigger>Virtues & Life Direction</AccordionTrigger>
              <AccordionContent>
                <p className="whitespace-pre-wrap text-sm md:text-base">
                  {isPremiumData(data)
                    ? data.interpretation.virtue_and_life_direction
                    : data.virtue_and_life_direction}
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 프리미엄 전용 - 문화적 축복 */}
            {isPremiumData(data) && (
              <AccordionItem value="blessing">
                <AccordionTrigger>Cultural Blessing</AccordionTrigger>
                <AccordionContent>
                  <div className="bg-gradient-to-r from-yellow-100/70 via-amber-50/70 to-yellow-100/70 dark:from-yellow-900/30 dark:via-amber-900/20 dark:to-yellow-900/30 p-4 rounded-md">
                    <p className="whitespace-pre-wrap text-sm md:text-base text-amber-800 dark:text-amber-300 italic">
                      {data.interpretation.cultural_blessing_note}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* 프리미엄 전용 - 전체 설명 */}
            {isPremiumData(data) && (
              <AccordionItem value="full">
                <AccordionTrigger>
                  Complete Name Interpretation
                </AccordionTrigger>
                <AccordionContent>
                  <p className="whitespace-pre-wrap text-sm md:text-base">
                    {data.interpretation.full_interpretation_text_narrative}
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      )}

      {/* 문화적 참고 설명 */}
      <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
        <p>
          Korean names often carry deep cultural meaning. Every syllable is
          carefully chosen to reflect values, aspirations, and harmony with
          nature and tradition.
        </p>
      </div>
    </div>
  );
}
