"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { Button } from "@/components/ui/button";
import { GenderOption, NameStyleOption } from "@/app/lib/krNameSystemPrompts";

// 새로운 인터페이스 정의 - 무료 버전
interface FreeKoreanNameData {
  original_name: string;
  original_name_analysis: {
    summary: string;
  };
  korean_name_suggestion: {
    full_name: string;
    rationale?: string;
  };
  social_share_content: {
    formatted: string;
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
      romanization: string;
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

  // 데이터가 변경되면 음성 생성 (프리미엄 유저만)
  React.useEffect(() => {
    if (data && !loading && isPremium) {
      generateNameAudio();
    }
  }, [data, loading, isPremium]);

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
    if (!data || !isPremium) return;

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

  // 무료 티어 결과 화면 렌더링
  const renderFreeResult = () => {
    return (
      <div className="space-y-8">
        {/* 한국어 이름 제안 (무료 티어 간소화 버전) */}
        <section className="bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
            Korean Name Suggestion
          </h2>

          <div className="mb-5">
            <h3 className="text-3xl font-bold text-gray-800 mb-3">
              {data.korean_name_suggestion.full_name}
            </h3>
          </div>

          {/* 이름의 의미 (rationale) */}
          {data.korean_name_suggestion.rationale && (
            <div className="mb-5">
              <h4 className="text-lg font-semibold text-indigo-700 mb-3">
                Name Meaning
              </h4>
              <p className="text-gray-600 whitespace-pre-wrap">
                {data.korean_name_suggestion.rationale}
              </p>
            </div>
          )}

          {/* 공유 형식 */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-lg font-semibold text-indigo-700 mb-3">
              Share Your Korean Name
            </h4>
            <p className="text-xl font-semibold text-gray-800 mb-2">
              {data.social_share_content.formatted}
            </p>
          </div>
        </section>

        {/* 프리미엄 업그레이드 CTA */}
        <section className="bg-white rounded-xl shadow p-6 text-center">
          <h3 className="text-xl font-semibold text-indigo-600 mb-3">
            Unlock Premium Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-indigo-50 p-3 rounded-lg text-center">
              <h4 className="font-semibold text-indigo-800">
                Detailed Analysis
              </h4>
              <p className="text-sm text-gray-600">
                Understand every syllable meaning
              </p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg text-center">
              <h4 className="font-semibold text-indigo-800">
                Audio Pronunciation
              </h4>
              <p className="text-sm text-gray-600">Hear how your name sounds</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg text-center">
              <h4 className="font-semibold text-indigo-800">Life Values</h4>
              <p className="text-sm text-gray-600">
                Learn cultural significance
              </p>
            </div>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md">
            Upgrade to Premium
          </Button>
        </section>
      </div>
    );
  };

  // 프리미엄 티어 결과 화면 렌더링
  const renderPremiumResult = () => {
    if (!isPremiumData(data)) return null;

    return (
      <div className="space-y-8">
        {/* 원본 이름 분석 */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-4 text-center">
            Original Name Analysis
          </h2>
          <div className="text-center mb-5">
            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              {data.original_name}
            </h3>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {data.original_name_analysis.letters.map((item, index) => (
              <div
                key={index}
                className="bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-4 text-center"
              >
                <div className="text-lg font-semibold text-indigo-800 dark:text-indigo-300">
                  {item.letter}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  {item.meaning}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-gray-600 italic">{getCoreSummary()}</p>
        </section>

        {/* 한국어 이름 제안 */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-4 text-center">
            Korean Name Suggestion
          </h2>

          <div className="text-center mb-5 flex flex-col items-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              {data.korean_name_suggestion.full_name}
            </h3>
            {isPremium && (
              <AudioPlayer audioUrl={audioUrl} loading={audioLoading} />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {data.korean_name_suggestion.syllables.map((item, index) => (
              <div
                key={index}
                className="bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-4 text-center"
              >
                <div className="text-lg font-semibold text-indigo-800 dark:text-indigo-300">
                  {item.syllable}{" "}
                  {item.hanja && nameStyle === "hanja" && `(${item.hanja})`}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {item.romanization}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  {item.meaning}
                </div>
              </div>
            ))}
          </div>

          <p className="text-gray-600 dark:text-gray-300">
            {data.korean_name_suggestion.rationale}
          </p>

          <div className="mt-4 border-t pt-4">
            <h4 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
              Life Values
            </h4>
            <p className="text-gray-600 dark:text-gray-300 italic">
              {data.korean_name_suggestion.life_values}
            </p>
          </div>
        </section>

        {/* 공유 가능한 요약 */}
        <section className="bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
            Shareable Summary
          </h2>
          <p className="text-xl font-semibold text-gray-800 mb-2">
            {data.social_share_content.formatted}
          </p>
          <p className="text-gray-600 italic">
            {data.social_share_content.summary}
          </p>
        </section>
      </div>
    );
  };

  // 메인 컨텐츠 렌더링
  return (
    <div className="w-full">
      {/* 상단 배지 */}
      <div className="flex justify-center gap-2 mb-6">
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
      {/* <div className="text-center mb-6 bg-white rounded-xl shadow p-4">
        <p className="text-sm text-muted-foreground mb-1">
          Name Translation for
        </p>
        <p className="text-xl font-semibold text-gray-800">
          {data.original_name}
        </p>
      </div> */}

      {/* 무료 또는 프리미엄 결과 */}
      {isPremium ? renderPremiumResult() : renderFreeResult()}

      {/* 문화적 참고 설명 */}
      <div className="mt-6 pt-4 pb-5 border-t text-sm text-gray-500 dark:text-gray-400">
        <p>
          Korean names often carry deep cultural meaning. Every syllable is
          carefully chosen to reflect values, aspirations, and harmony with
          nature and tradition.
        </p>
      </div>
    </div>
  );
}
