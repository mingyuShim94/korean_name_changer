"use client";

import * as React from "react";
import { Loader2, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenderOption, NameStyleOption } from "@/app/lib/krNameSystemPrompts";
import { useRouter } from "next/navigation";

// AudioPlayer 컴포넌트 수정
interface AudioPlayerProps {
  koreanName: string;
  audioUrl: string | null;
  loading: boolean;
  isPlaying: boolean;
  onPlay: () => void;
}

function AudioPlayer({
  koreanName,
  audioUrl,
  loading,
  isPlaying,
  onPlay,
}: AudioPlayerProps) {
  if (loading) {
    return (
      <Button
        variant="outline"
        disabled
        className="mt-3 w-full max-w-xs text-sm md:text-base"
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Generating Audio...
      </Button>
    );
  }

  if (!audioUrl) {
    return (
      <Button
        variant="outline"
        disabled
        className="mt-3 w-full max-w-xs text-sm md:text-base"
      >
        <Volume2 className="mr-2 h-4 w-4" />
        Listen to {koreanName} (Unavailable)
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={onPlay}
      disabled={isPlaying}
      className="mt-3 w-full max-w-xs text-sm md:text-base"
    >
      {isPlaying ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Play className="mr-2 h-4 w-4" />
      )}
      {isPlaying ? "Playing..." : `Listen to ${koreanName}`}
    </Button>
  );
}

// 새로운 인터페이스 정의 - 무료 버전
interface FreeKoreanNameData {
  original_name: string;
  original_name_analysis: {
    summary: string;
  };
  korean_name_suggestion: {
    full_name: string;
    rationale?: string;
    syllables?: {
      syllable: string;
      romanization: string;
      hanja?: string;
      meaning: string;
    }[];
  };
  korean_name_impression?: string;
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
  korean_name_impression: string;
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
  const [showOriginalAnalysis, setShowOriginalAnalysis] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [showBetaPopup, setShowBetaPopup] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [audioLoading, setAudioLoading] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

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

  // syllables 정보를 가지고 있는지 확인하는 함수
  const hasSyllables = (data: ResultData | null): boolean => {
    return (
      data !== null &&
      "korean_name_suggestion" in data &&
      "syllables" in data.korean_name_suggestion &&
      Array.isArray(data.korean_name_suggestion.syllables) &&
      data.korean_name_suggestion.syllables.length > 0
    );
  };

  // 음성 생성 함수
  const generateNameAudio = React.useCallback(async () => {
    if (!data?.korean_name_suggestion?.syllables) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);

    try {
      const koreanName = data.korean_name_suggestion.syllables
        .map((syllable) => syllable.syllable)
        .join("");

      const cachedAudioKey = `audio_${koreanName}`;
      const cachedTimestampKey = `audio_timestamp_${koreanName}`;
      const cachedAudio = localStorage.getItem(cachedAudioKey);
      const cachedTimestamp = localStorage.getItem(cachedTimestampKey);

      if (cachedAudio && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const now = Date.now();
        const cacheAge = now - timestamp;
        const cacheDuration = 24 * 60 * 60 * 1000; // 24시간

        if (cacheAge < cacheDuration) {
          // Base64 데이터를 Blob으로 변환
          const binaryData = atob(cachedAudio);
          const arrayBuffer = new ArrayBuffer(binaryData.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i);
          }
          const audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          return;
        }
      }

      setAudioLoading(true);
      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: koreanName }),
      });

      if (!response.ok) {
        setAudioUrl(null);
        throw new Error("음성 생성 실패");
      }

      const audioBlob = await response.blob();

      // Blob을 Base64로 변환하여 저장
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const base64Audio = base64data.split(",")[1]; // Remove data URL prefix
        localStorage.setItem(cachedAudioKey, base64Audio);
        localStorage.setItem(cachedTimestampKey, Date.now().toString());
      };

      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error("음성 생성 중 오류 발생:", error);
      setAudioUrl(null);
    } finally {
      setAudioLoading(false);
    }
  }, [data]);

  // 오디오 재생 함수 (일시정지 없음)
  const handlePlay = () => {
    if (!audioUrl || isPlaying) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const newAudio = new Audio(audioUrl);
    audioRef.current = newAudio;
    newAudio.play();
    setIsPlaying(true);

    newAudio.onended = () => {
      setIsPlaying(false);
    };
    newAudio.onerror = () => {
      console.error("오디오 재생 오류");
      setIsPlaying(false);
      setAudioUrl(null);
    };
  };

  // 데이터가 변경되면 음성 생성 (프리미엄 유저만)
  React.useEffect(() => {
    if (data && !loading && isPremium) {
      generateNameAudio();
    }
  }, [data, loading, isPremium, generateNameAudio]);

  // 컴포넌트가 언마운트될 때 오디오 URL 정리
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // 페이지 새로고침이나 이동 시에는 URL을 해제하지 않음
      // URL은 다음 세션에서 새로 생성됨
    };
  }, []);

  // 클립보드에 텍스트를 복사하는 함수
  const copyToClipboard = (formatted: string, summary: string) => {
    // formatted, summary와 해시태그를 합쳐서 복사할 텍스트 생성
    const textToCopy = `${formatted}\n\n${summary}\n\n#KoreanNameEmoji #mykoreanname`;

    navigator.clipboard.writeText(textToCopy).then(
      () => {
        // 복사 성공
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // 2초 후 상태 초기화
      },
      (err) => {
        console.error("클립보드 복사 실패:", err);
      }
    );
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
    const showSyllables = hasSyllables(data);

    return (
      <div className="space-y-8">
        {/* 한국어 이름 제안 (무료 티어 버전) */}
        <section className="bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
            Korean Name Suggestion
          </h2>

          <div className="mb-5">
            <h3 className="text-3xl font-bold text-gray-800 mb-3">
              {data.korean_name_suggestion.full_name}
            </h3>
          </div>

          {/* syllables 정보가 있는 경우 표시 */}
          {showSyllables && data.korean_name_suggestion.syllables && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {data.korean_name_suggestion.syllables.map(
                (item, index: number) => (
                  <div
                    key={index}
                    className="bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-4 text-center"
                  >
                    <div className="text-lg font-semibold text-indigo-800 dark:text-indigo-300">
                      {item.syllable} ({item.romanization})
                    </div>
                    {nameStyle === "hanja" && item.hanja && (
                      <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/20 px-2 py-1 rounded-md mx-auto my-1 inline-block">
                        {item.hanja}
                      </div>
                    )}
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                      {item.meaning}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* 이름의 의미 (rationale) */}
          {data.korean_name_suggestion.rationale && (
            <div className="mb-5 text-left">
              <h4 className="text-lg font-semibold text-indigo-700 mb-3 text-center">
                Name Meaning
              </h4>
              <p className="text-gray-600 whitespace-pre-wrap">
                {data.korean_name_suggestion.rationale}
              </p>
            </div>
          )}

          {/* 이름 인상 - 무료 티어에서는 표시하지 않음 */}
        </section>

        {/* 공유 가능한 요약 */}
        <section className="bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
            Shareable Summary
          </h2>

          <div className="relative bg-gray-50 p-5 rounded-lg mb-4">
            <p className="text-xl font-semibold text-gray-800 mb-2">
              {data.social_share_content.formatted}
            </p>
            <p className="text-indigo-500 text-sm mt-4">
              #KoreanNameEmoji #mykoreanname
            </p>

            <div className="flex justify-center mt-4">
              <button
                onClick={() =>
                  copyToClipboard(
                    data.social_share_content.formatted,
                    data.original_name_analysis.summary
                  )
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  copied
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border border-indigo-200"
                }`}
                aria-label="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                      <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                    </svg>
                    <span>Copy to clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* 프리미엄 업그레이드 CTA */}
        <section className="bg-white rounded-xl shadow p-6 text-center">
          <h3 className="text-xl font-semibold text-indigo-600 mb-3">
            Unlock Premium Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-indigo-50 p-3 rounded-lg text-center">
              <h4 className="font-semibold text-indigo-800">
                Detailed Original Name Analysis
              </h4>
              <p className="text-sm text-gray-600">
                In-depth breakdown of each letter/part of your original name.
              </p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg text-center">
              <h4 className="font-semibold text-indigo-800">
                Cultural Impression
              </h4>
              <p className="text-sm text-gray-600">
                How the suggested Korean name is perceived in Korean society.
              </p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg text-center">
              <h4 className="font-semibold text-indigo-800">Life Values</h4>
              <p className="text-sm text-gray-600">
                Explore the deeper meanings and virtues embodied by the name.
              </p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg text-center">
              <h4 className="font-semibold text-indigo-800">
                Audio Pronunciation
              </h4>
              <p className="text-sm text-gray-600">
                <s>Hear how your name sounds.</s> (temporarily unavailable)
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowBetaPopup(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md"
          >
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
        {/* 원본 이름 분석 - 드롭다운 형태 */}
        <section className="bg-white rounded-xl shadow overflow-hidden">
          <button
            onClick={() => setShowOriginalAnalysis(!showOriginalAnalysis)}
            className="w-full p-6 relative focus:outline-none"
          >
            <h2 className="text-2xl font-semibold text-indigo-600 text-center">
              Original Name Analysis
            </h2>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform absolute right-6 top-1/2 transform -translate-y-1/2 ${
                showOriginalAnalysis ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>

          {showOriginalAnalysis && (
            <div className="p-6 pt-0">
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
              <p className="mt-4 text-gray-600">{getCoreSummary()}</p>
            </div>
          )}
        </section>

        {/* 한국어 이름 제안 */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-4 text-center">
            Korean Name Suggestion
          </h2>

          <div className="text-center mb-5 flex flex-col items-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              {(() => {
                const koreanName =
                  data.korean_name_suggestion.full_name.split(" ")[0];
                const romanizations = data.korean_name_suggestion.syllables.map(
                  (item) => item.romanization
                );
                const fullRomanization = romanizations.join(" ");
                return `${koreanName} (${fullRomanization})`;
              })()}
            </h3>
            {isPremium && (
              <AudioPlayer
                koreanName={data.korean_name_suggestion.syllables
                  .map((s) => s.syllable)
                  .join("")}
                audioUrl={audioUrl}
                loading={audioLoading}
                isPlaying={isPlaying}
                onPlay={handlePlay}
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {data.korean_name_suggestion.syllables.map((item, index) => (
              <div
                key={index}
                className="bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-4 text-center"
              >
                <div className="text-lg font-semibold text-indigo-800 dark:text-indigo-300">
                  {item.syllable} ({item.romanization})
                </div>
                {nameStyle === "hanja" && item.hanja && (
                  <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/20 px-2 py-1 rounded-md mx-auto my-1 inline-block">
                    {item.hanja}
                  </div>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  {item.meaning}
                </div>
              </div>
            ))}
          </div>

          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {data.korean_name_suggestion.rationale}
          </p>

          <div className="mt-4 border-t pt-4">
            <h4 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
              Life Values
            </h4>
            <p className="text-gray-600 dark:text-gray-300 italic whitespace-pre-wrap">
              {data.korean_name_suggestion.life_values}
            </p>
          </div>

          <div className="mt-4 border-t pt-4">
            <h4 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
              Cultural Impression
            </h4>
            <p className="text-gray-600 dark:text-gray-300 italic whitespace-pre-wrap">
              {data.korean_name_impression}
            </p>
          </div>
        </section>

        {/* 공유 가능한 요약 */}
        <section className="bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
            Shareable Summary
          </h2>

          <div className="relative bg-gray-50 p-5 rounded-lg mb-4">
            <p className="text-xl font-semibold text-gray-800 mb-2">
              {data.social_share_content.formatted}
            </p>
            <p className="text-gray-600 italic mb-4">
              {data.social_share_content.summary}
            </p>
            <p className="text-indigo-500 text-sm">
              #KoreanNameEmoji #mykoreanname
            </p>

            <div className="flex justify-center mt-4">
              <button
                onClick={() =>
                  copyToClipboard(
                    data.social_share_content.formatted,
                    data.social_share_content.summary
                  )
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  copied
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border border-indigo-200"
                }`}
                aria-label="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                      <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                    </svg>
                    <span>Copy to clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
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

      {/* Beta Version Notice Popup */}
      {showBetaPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold text-indigo-600 mb-2">
              ✨ Special Beta Version Notice ✨
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              During this beta period, you can enjoy all premium features for
              free! Feel free to explore all the features. We look forward to
              your support for our official launch.
            </p>
            <Button
              onClick={() => {
                setShowBetaPopup(false);
                router.push("/");
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md w-full"
            >
              Confirm (Go to Home)
            </Button>
          </div>
        </div>
      )}

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
