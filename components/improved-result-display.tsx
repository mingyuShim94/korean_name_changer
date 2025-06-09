"use client";

import * as React from "react";
import {
  Loader2,
  Play,
  Volume2,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackButtonClick } from "@/lib/analytics";
import { GenderOption, NameStyleOption } from "@/app/lib/freeSystemPrompts";

// AudioPlayer 컴포넌트
interface AudioPlayerProps {
  audioUrl: string | null;
  loading: boolean;
  isPlaying: boolean;
  onPlay: () => void;
}

function AudioPlayer({
  audioUrl,
  loading,
  isPlaying,
  onPlay,
}: AudioPlayerProps) {
  if (loading) {
    return (
      <Button variant="outline" disabled className="mt-3 text-sm">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Generating Audio...
      </Button>
    );
  }

  if (!audioUrl) {
    return (
      <Button variant="outline" disabled className="mt-3 text-sm">
        <Volume2 className="mr-2 h-4 w-4" />
        Audio Unavailable
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={onPlay}
      disabled={isPlaying}
      className="mt-3 text-sm"
    >
      {isPlaying ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Play className="mr-2 h-4 w-4" />
      )}
      {isPlaying ? "Playing..." : "🔊"}
    </Button>
  );
}

// 새로운 간소화된 데이터 구조 (Free/Premium 기본)
interface NewKoreanNameData {
  korean_name: {
    full: string;
    romanized: string;
    syllables: {
      syllable: string;
      romanized: string;
      hanja: string;
      keywords: string[];
      explanation: string;
    }[];
    integrated_meaning: string;
  };
}

// 새로운 프리미엄 데이터 구조 (전체 기능)
interface NewPremiumKoreanNameData {
  original_name: {
    full: string;
    components: {
      name: string;
      meanings: string[];
      symbols: string[];
    }[];
    summary: string;
  };
  korean_name: {
    full: string;
    romanized: string;
    syllables: {
      syllable: string;
      romanized: string;
      hanja: string;
      keywords: string[];
      explanation: string;
    }[];
    integrated_meaning: string;
  };
  life_values: {
    text: string;
  };
  cultural_impression: {
    text: string;
  };
}

// 레거시 데이터 구조 (기존 호환성)
interface LegacyKoreanNameData {
  original_name?: string;
  original_name_analysis?: {
    summary?: string;
    letters?: {
      letter: string;
      meaning: string;
    }[];
  };
  korean_name_suggestion?: {
    full_name: string;
    rationale?: string;
    syllables: {
      syllable: string;
      romanization: string;
      hanja?: string;
      meaning: string;
    }[];
    life_values?: string;
  };
  korean_name_impression?: string;
  social_share_content?: {
    formatted: string;
    summary?: string;
  };
}

// 결과 데이터 유니온 타입
type ResultData =
  | NewKoreanNameData
  | NewPremiumKoreanNameData
  | LegacyKoreanNameData;

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
 * 개선된 이름 결과 표시 컴포넌트 - 새로운 UI/UX
 */
export function ImprovedResultDisplay({
  data,
  loading,
  nameStyle,
  isPremium,
  gender = "neutral",
}: ImprovedResultDisplayProps) {
  const [showOriginalAnalysis, setShowOriginalAnalysis] = React.useState(false);
  const [showDetailedStructure, setShowDetailedStructure] =
    React.useState(false);
  const [showLifeValues, setShowLifeValues] = React.useState(false);
  const [showCulturalImpression, setShowCulturalImpression] =
    React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [audioLoading, setAudioLoading] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // 데이터 타입 확인 함수들
  const isNewKoreanNameData = (
    data: ResultData | null
  ): data is NewKoreanNameData => {
    return (
      data !== null &&
      "korean_name" in data &&
      !("original_name" in data) &&
      !("life_values" in data)
    );
  };

  const isNewPremiumKoreanNameData = (
    data: ResultData | null
  ): data is NewPremiumKoreanNameData => {
    return (
      data !== null &&
      "korean_name" in data &&
      "original_name" in data &&
      "life_values" in data
    );
  };

  const isLegacyKoreanNameData = (
    data: ResultData | null
  ): data is LegacyKoreanNameData => {
    return data !== null && "korean_name_suggestion" in data;
  };

  // 통합 데이터 추출 함수
  const getKoreanNameInfo = () => {
    if (!data) return null;

    if (isNewKoreanNameData(data) || isNewPremiumKoreanNameData(data)) {
      return {
        full: data.korean_name.full,
        romanized: data.korean_name.romanized,
        syllables: data.korean_name.syllables,
        meaning: data.korean_name.integrated_meaning,
      };
    }

    if (isLegacyKoreanNameData(data) && data.korean_name_suggestion) {
      return {
        full: data.korean_name_suggestion.full_name,
        romanized: data.korean_name_suggestion.syllables
          .map((s) => s.romanization)
          .join(" "),
        syllables: data.korean_name_suggestion.syllables.map((s) => ({
          syllable: s.syllable,
          romanized: s.romanization,
          hanja: s.hanja || "",
          keywords: [s.meaning],
          explanation: s.meaning,
        })),
        meaning: data.korean_name_suggestion.rationale || "",
      };
    }

    return null;
  };

  // 음성 생성 함수
  const generateNameAudio = React.useCallback(async () => {
    const koreanInfo = getKoreanNameInfo();
    if (!koreanInfo) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);

    try {
      const koreanName = koreanInfo.full;
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
        const base64Audio = base64data.split(",")[1];
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

  // 오디오 재생 함수
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
    };
  }, []);

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

  const koreanInfo = getKoreanNameInfo();
  if (!koreanInfo) {
    return (
      <div className="text-center text-red-600">
        <p>데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 아코디언 토글 버튼 컴포넌트
  const AccordionToggle = ({
    isOpen,
    onClick,
    title,
  }: {
    isOpen: boolean;
    onClick: () => void;
    title: string;
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors rounded-xl shadow border-l-4 border-indigo-400"
    >
      <h3 className="text-lg font-semibold text-indigo-600">{title}</h3>
      {isOpen ? (
        <ChevronUp className="h-5 w-5 text-gray-500" />
      ) : (
        <ChevronDown className="h-5 w-5 text-gray-500" />
      )}
    </button>
  );

  /**
   * 한국이름에서 성을 제외한 이름 부분만 추출하는 함수
   * @param koreanName - 전체 한국이름 (예: "김서연")
   * @returns 성을 제외한 이름 부분 (예: "서연")
   */
  function extractGivenName(koreanName: string): string {
    if (!koreanName || koreanName.length < 2) return koreanName;

    // 한국어 이름에서 첫 번째 글자는 성(family name), 나머지는 이름(given name)
    return koreanName.slice(1);
  }

  /**
   * 한국이름의 Google 이미지 검색 URL을 생성하는 함수
   * @param koreanName - 전체 한국이름
   * @returns Google 이미지 검색 URL
   */
  function createGoogleImageSearchUrl(koreanName: string): string {
    const givenName = extractGivenName(koreanName);
    const searchQuery = encodeURIComponent(`${givenName}`);
    return `https://www.google.com/search?q=${searchQuery}&tbm=isch`;
  }

  // Google 이미지 검색 버튼 컴포넌트
  interface GoogleImageSearchProps {
    koreanName: string;
  }

  function GoogleImageSearch({ koreanName }: GoogleImageSearchProps) {
    const givenName = extractGivenName(koreanName);
    const searchUrl = createGoogleImageSearchUrl(koreanName);

    const handleSearchClick = () => {
      trackButtonClick("google_image_search", `korean_name_${givenName}`);
      window.open(searchUrl, "_blank", "noopener,noreferrer");
    };

    return (
      <div className="bg-white/80 rounded-xl p-4 border border-blue-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-semibold text-blue-700 mb-1">
              📷 See Cultural Impression
            </h4>
            <p className="text-xs text-gray-600">
              Discover the vibe of &apos;{givenName}&apos; by seeing real people
              who have this name
            </p>
          </div>
          <Search className="h-5 w-5 text-blue-500" />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSearchClick}
          className="w-full text-sm border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          See people named &apos;{givenName}&apos;
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* 상단 배지 */}
      <div className="flex justify-center gap-2 mb-4">
        {isPremium && (
          <span className="inline-flex items-center rounded-md bg-amber-100/80 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-500/30">
            ✨ Premium Analysis ✨
          </span>
        )}
        <span
          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
            gender === "masculine"
              ? "bg-blue-100/80 text-blue-800 ring-blue-500/30"
              : gender === "feminine"
              ? "bg-pink-100/80 text-pink-800 ring-pink-500/30"
              : "bg-green-100/80 text-green-800 ring-green-500/30"
          }`}
        >
          {gender === "masculine"
            ? "Masculine"
            : gender === "feminine"
            ? "Feminine"
            : "Neutral"}{" "}
          Name
        </span>
        <span className="inline-flex items-center rounded-md bg-purple-100/80 px-2 py-1 text-xs font-medium text-purple-800 ring-1 ring-inset ring-purple-500/30">
          {nameStyle === "pureKorean" ? "Pure Korean" : "Hanja"} Style
        </span>
      </div>

      {/* 요약 카드: 한국식 이름 제안 */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-4 sm:p-6 border border-indigo-100">
        <div className="text-center">
          <h2 className="text-sm font-medium text-indigo-600 mb-2">
            Korean Name Suggestion
          </h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
              👤 {koreanInfo.full} ({koreanInfo.romanized})
            </h3>
            {isPremium && (
              <AudioPlayer
                audioUrl={audioUrl}
                loading={audioLoading}
                isPlaying={isPlaying}
                onPlay={handlePlay}
              />
            )}
          </div>

          {/* 음절 구성 요약 */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-4">
            {koreanInfo.syllables.map((syllable, index) => (
              <div
                key={index}
                className="bg-white/70 rounded-lg p-2 sm:p-3 text-center border border-indigo-200"
              >
                <div className="text-base sm:text-lg font-semibold text-indigo-800">
                  [{syllable.syllable}] {syllable.romanized}
                </div>
                {nameStyle === "hanja" && syllable.hanja && (
                  <div className="text-xs sm:text-sm font-medium text-indigo-600 mt-1">
                    {syllable.hanja}
                  </div>
                )}
                <div className="text-xs text-gray-600 mt-1">
                  → {syllable.keywords.join(", ")}
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-600 italic">
            &quot;{koreanInfo.meaning}&quot;
          </p>

          {isPremium && (
            <button
              onClick={() => setShowDetailedStructure(!showDetailedStructure)}
              className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center w-full"
            >
              {showDetailedStructure ? "▲ View Details" : "▼ View Details"}
            </button>
          )}
        </div>
      </section>

      {/* Google 이미지 검색 섹션 */}
      <GoogleImageSearch koreanName={koreanInfo.full} />

      {/* 상세 구성 패널 (아코디언) */}
      {showDetailedStructure && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
            Detailed Analysis Panel
          </h2>

          {/* 원본 이름 분석 (프리미엄만) */}
          {isNewPremiumKoreanNameData(data) && (
            <>
              <AccordionToggle
                isOpen={showOriginalAnalysis}
                onClick={() => setShowOriginalAnalysis(!showOriginalAnalysis)}
                title="▾ Original Name Analysis"
              />
              {showOriginalAnalysis && (
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-400">
                  <div className="text-center mb-4">
                    <h4 className="text-2xl font-bold text-gray-800 mb-2">
                      🔹 **Original Name:** {data.original_name.full}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {data.original_name.components.map((component, index) => (
                      <div key={index} className="bg-indigo-50 rounded-lg p-4">
                        <div className="font-semibold text-indigo-800 mb-2">
                          - **{component.name}:**{" "}
                          {component.meanings.join(", ")}
                        </div>
                        <div className="text-sm text-gray-600">
                          → **Symbols:** {component.symbols.join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-700 mb-2">
                      📘 **Overall Name Meaning:**
                    </h5>
                    <p className="text-gray-600">
                      {data.original_name.summary}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 이름 구성 의미 (프리미엄만) */}
          {isNewPremiumKoreanNameData(data) && (
            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-400">
              <h4 className="text-lg font-semibold text-indigo-600 mb-4">
                ▾ Name Structure Meaning
              </h4>
              <div className="space-y-4">
                {data.korean_name.syllables.map((syllable, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-indigo-200 pl-4"
                  >
                    <h5 className="font-semibold text-indigo-800 mb-2">
                      【{syllable.syllable}】{syllable.romanized} (
                      {syllable.hanja})
                    </h5>
                    <p className="text-gray-600 mb-2">{syllable.explanation}</p>
                    <div className="text-sm text-indigo-600">
                      Keywords: {syllable.keywords.join(" · ")}
                    </div>
                  </div>
                ))}
                <div className="bg-indigo-50 rounded-lg p-4 mt-4">
                  <p className="text-gray-700">
                    → Overall, &apos;{data.korean_name.full}&apos; symbolizes{" "}
                    <strong>
                      &quot;{data.korean_name.integrated_meaning}&quot;
                    </strong>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Life Values (프리미엄만) */}
          {isNewPremiumKoreanNameData(data) && (
            <>
              <AccordionToggle
                isOpen={showLifeValues}
                onClick={() => setShowLifeValues(!showLifeValues)}
                title="▾ Life Values"
              />
              {showLifeValues && (
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-400">
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {data.life_values.text}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Cultural Impression (프리미엄만) */}
          {isNewPremiumKoreanNameData(data) && (
            <>
              <AccordionToggle
                isOpen={showCulturalImpression}
                onClick={() =>
                  setShowCulturalImpression(!showCulturalImpression)
                }
                title="▾ Cultural Impression"
              />
              {showCulturalImpression && (
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-400">
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {data.cultural_impression.text}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 문화적 참고 설명 */}
      <div className="mt-6 pt-4 pb-5 border-t text-sm text-gray-500">
        <p className="text-center">
          Korean names carry deep cultural meaning. Every syllable is carefully
          chosen to reflect values, aspirations, and harmony with nature and
          tradition.
        </p>
      </div>
    </div>
  );
}
