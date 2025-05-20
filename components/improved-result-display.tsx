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
import { GenderOption, NameStyleOption } from "@/app/lib/krNameSystemPrompts";

// 새로운 인터페이스 정의 - 무료 버전
interface FreeKoreanNameData {
  original_name: string;
  original_name_analysis: {
    summary: string;
  };
  korean_name_suggestion: {
    full_name: string;
    syllables: {
      syllable: string;
      hanja: string;
      meaning: string;
    }[];
    rationale: string;
  };
}

// 새로운 인터페이스 정의 - 프리미엄 버전
interface PremiumKoreanNameData {
  original_name: string;
  original_name_analysis: {
    letters: {
      letter: string;
      meaning: string;
    }[];
    summary: string;
  };
  korean_name_suggestion: {
    full_name: string;
    syllables: {
      syllable: string;
      hanja: string;
      meaning: string;
    }[];
    rationale: string;
    life_values: string;
  };
  social_share_content: {
    formatted: string;
    summary: string;
  };
}

// 결과 데이터 유니온 타입
type ResultData = FreeKoreanNameData | PremiumKoreanNameData;

/**
 * 통합 결과 표시 컴포넌트 Props
 */
interface ImprovedResultDisplayProps {
  data: ResultData | null;
  loading: boolean;
  nameStyle: NameStyleOption;
  isPremium: boolean;
  gender?: GenderOption;
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
  gender = "neutral",
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
    data: ResultData | null
  ): data is PremiumKoreanNameData => {
    return (
      data !== null &&
      "social_share_content" in data &&
      "life_values" in data.korean_name_suggestion
    );
  };

  // Free 데이터 타입 확인 함수
  // const isBasicData = (data: ResultData | null): data is FreeKoreanNameData => {
  //   return (
  //     data !== null &&
  //     !("social_share_content" in data) &&
  //     !("life_values" in data.korean_name_suggestion)
  //   );
  // };

  // 데이터가 변경되면 음성 생성
  React.useEffect(() => {
    if (data && !loading) {
      generateNameAudio();
    }
  }, [data, loading]);

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

      // 한국어 이름 추출 (새 데이터 구조에 맞게 변경)
      const koreanName = data.korean_name_suggestion.full_name.split(" ")[0]; // 성과 이름만 추출 (괄호 없이)

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
  const getCoreSummary = (): string => {
    return data.original_name_analysis.summary;
  };

  // 기본 이름 정보 렌더링
  const renderNameBasics = () => {
    // 성과 이름 분리
    const fullName = data.korean_name_suggestion.full_name;
    const hanjaMatch = fullName.match(/\(([^)]+)\)/);
    const hanja = hanjaMatch ? hanjaMatch[1] : undefined;

    // 로마자 표기 (새 데이터 구조에는 없으므로 이름 자체를 사용)
    const nameParts = fullName.split(" ");
    const romanization =
      nameParts.length > 1
        ? `${nameParts[0]} ${nameParts[1]}`
        : fullName.replace(/\s*\([^)]*\)\s*/, ""); // 괄호 제거

    return (
      <>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl md:text-3xl font-bold">
              {fullName.replace(/\s*\([^)]*\)\s*/, "")} {/* 괄호 제거 */}
            </h2>
            <span className="text-sm text-muted-foreground italic">
              ({romanization})
            </span>
          </div>
          {hanja && nameStyle === "hanja" && (
            <p className="text-sm text-muted-foreground">Hanja: {hanja}</p>
          )}
          <AudioPlayer audioUrl={audioUrl} loading={audioLoading} />
        </div>
      </>
    );
  };

  // 이름 요소 분석 렌더링
  const renderNameElements = () => {
    // 이름 요소 데이터 가져오기
    const syllables = data.korean_name_suggestion.syllables;

    return (
      <div className="flex flex-col gap-6">
        {syllables.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-3 rounded-md border shadow-sm bg-muted/30 p-5 dark:border-neutral-700/60"
          >
            <Badge
              variant="outline"
              className="text-primary text-base px-3 py-1"
            >
              {item.syllable}
              {item.hanja && nameStyle === "hanja" && ` (${item.hanja})`}
            </Badge>
            <div className="space-y-2 w-full">
              <div className="bg-background/60 rounded-md p-2 w-full">
                <p className="text-sm sm:text-base font-medium text-center">
                  <span className="text-primary">Meaning:</span> {item.meaning}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 성별에 따른 스타일 적용
  const getGenderColorClass = () => {
    switch (gender) {
      case "masculine":
        return "from-blue-100/70 via-sky-50/70 to-blue-100/70 dark:from-blue-900/30 dark:via-sky-900/20 dark:to-blue-900/30";
      case "feminine":
        return "from-pink-100/70 via-rose-50/70 to-pink-100/70 dark:from-pink-900/30 dark:via-rose-900/20 dark:to-pink-900/30";
      default:
        return "from-green-100/70 via-emerald-50/70 to-green-100/70 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-green-900/30";
    }
  };

  // 메인 컨텐츠 렌더링
  return (
    <div className="w-full space-y-6">
      {/* 상단 배지 */}
      <div className="flex justify-center gap-2">
        {isPremium && (
          <span className="inline-flex items-center rounded-md bg-amber-100/80 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20">
            ✨ Premium Analysis ✨
          </span>
        )}
        <span
          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
            gender === "masculine"
              ? "bg-blue-100/80 text-blue-800 ring-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20"
              : gender === "feminine"
              ? "bg-pink-100/80 text-pink-800 ring-pink-500/30 dark:bg-pink-500/10 dark:text-pink-400 dark:ring-pink-500/20"
              : "bg-green-100/80 text-green-800 ring-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
          }`}
        >
          {gender === "masculine"
            ? "Masculine"
            : gender === "feminine"
            ? "Feminine"
            : "Neutral"}{" "}
          Name
        </span>
        <span className="inline-flex items-center rounded-md bg-purple-100/80 px-2 py-1 text-xs font-medium text-purple-800 ring-1 ring-inset ring-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20">
          {nameStyle === "pureKorean" ? "Pure Korean" : "Hanja"} Style
        </span>
      </div>

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
      <div
        className={`bg-gradient-to-r ${getGenderColorClass()} p-4 rounded-lg text-center border border-primary/10`}
      >
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
          <div className="space-y-3">
            <div className="flex justify-center items-center">
              <h3 className="text-base md:text-lg font-semibold text-primary mb-2">
                {nameStyle === "hanja"
                  ? "Name Elements Analysis"
                  : "Name Meaning Analysis"}
              </h3>
            </div>
            <div className="bg-muted/20 p-4 rounded-md border">
              {renderNameElements()}
            </div>
          </div>

          {/* 이름의 의미와 근거 (모든 사용자) */}
          <div className="space-y-1 text-center">
            <h3 className="text-base font-semibold text-muted-foreground mb-2">
              Name Meaning
            </h3>
            <div className="bg-muted/20 p-3 rounded-md border">
              <p className="whitespace-pre-wrap text-sm md:text-base">
                {data.korean_name_suggestion.rationale}
              </p>
            </div>
          </div>

          {/* 삶의 가치 (프리미엄만) */}
          {isPremiumData(data) && (
            <div className="space-y-1 text-center">
              <h3 className="text-base font-semibold text-muted-foreground mb-2">
                Life Values
              </h3>
              <div className="bg-muted/20 p-3 rounded-md border">
                <p className="whitespace-pre-wrap text-sm md:text-base">
                  {data.korean_name_suggestion.life_values}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 상세 뷰 - 모든 정보 (프리미엄 전용) */}
      {viewMode === "detailed" && isPremiumData(data) && (
        <div className="space-y-4">
          {/* 아코디언으로 구성된 상세 내용 */}
          <Accordion type="single" collapsible className="w-full">
            {/* 이름 요소 */}
            <AccordionItem value="elements">
              <AccordionTrigger>Name Elements Analysis</AccordionTrigger>
              <AccordionContent>
                <div className="mt-2 bg-muted/20 p-4 rounded-md border">
                  {renderNameElements()}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 원본 이름 분석 */}
            <AccordionItem value="original">
              <AccordionTrigger>Original Name Analysis</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {data.original_name_analysis.letters.map((item, index) => (
                    <div
                      key={index}
                      className="bg-muted/10 p-3 rounded-md border"
                    >
                      <p className="font-semibold">{item.letter}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.meaning}
                      </p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 이름의 의미와 근거 */}
            <AccordionItem value="rationale">
              <AccordionTrigger>Name Meaning & Rationale</AccordionTrigger>
              <AccordionContent>
                <p className="whitespace-pre-wrap text-sm md:text-base">
                  {data.korean_name_suggestion.rationale}
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 삶의 가치 */}
            <AccordionItem value="life-values">
              <AccordionTrigger>Life Values</AccordionTrigger>
              <AccordionContent>
                <p className="whitespace-pre-wrap text-sm md:text-base">
                  {data.korean_name_suggestion.life_values}
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 소셜 공유 내용 */}
            <AccordionItem value="social">
              <AccordionTrigger>Social Share Content</AccordionTrigger>
              <AccordionContent>
                <div className="text-center">
                  <p className="text-2xl mb-3">
                    {data.social_share_content.formatted}
                  </p>
                  <p className="whitespace-pre-wrap text-sm md:text-base">
                    {data.social_share_content.summary}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
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
