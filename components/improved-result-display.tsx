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
  Sparkles,
  Music,
  Eye,
  Brain,
  Users,
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
      <Button
        variant="outline"
        disabled
        className="mt-3 text-sm bg-blue-50 border-blue-200"
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" />
        Generating Audio...
      </Button>
    );
  }

  if (!audioUrl) {
    return (
      <Button
        variant="outline"
        disabled
        className="mt-3 text-sm bg-gray-50 border-gray-200"
      >
        <Volume2 className="mr-2 h-4 w-4 text-gray-400" />
        Audio Unavailable
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={onPlay}
      disabled={isPlaying}
      className="mt-3 text-sm bg-green-50 border-green-200 hover:bg-green-100 text-green-700 transition-all duration-200"
    >
      {isPlaying ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Playing...
        </>
      ) : (
        <>
          <Play className="mr-2 h-4 w-4" />
          🔊 Play Pronunciation
        </>
      )}
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
      <div className="flex flex-col items-center justify-center space-y-6 py-16">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-blue-500 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">
            Creating Your Korean Name
          </h3>
          <p className="text-sm text-gray-600 max-w-md">
            Our AI is carefully crafting a name that reflects your personality
            and cultural heritage...
          </p>
        </div>
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
      <div className="text-center text-red-600 bg-red-50 rounded-2xl p-8">
        <p className="text-lg font-semibold">
          Unable to load your Korean name data
        </p>
        <p className="text-sm mt-2">Please try generating a new name.</p>
      </div>
    );
  }

  // 향상된 아코디언 토글 버튼 컴포넌트
  const EnhancedAccordionToggle = ({
    isOpen,
    onClick,
    title,
    icon,
    description,
    isPremium: sectionIsPremium = false,
  }: {
    isOpen: boolean;
    onClick: () => void;
    title: string;
    icon: React.ReactNode;
    description: string;
    isPremium?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-6 rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${
        sectionIsPremium
          ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 hover:from-amber-100 hover:to-orange-100"
          : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100"
      }`}
    >
      <div className="flex items-center space-x-4">
        <div
          className={`p-3 rounded-full ${
            sectionIsPremium ? "bg-amber-100" : "bg-blue-100"
          }`}
        >
          {icon}
        </div>
        <div className="text-left">
          <h3
            className={`text-lg font-semibold ${
              sectionIsPremium ? "text-amber-800" : "text-blue-800"
            }`}
          >
            {title}
            {sectionIsPremium && (
              <span className="ml-2 text-xs bg-amber-200 text-amber-700 px-2 py-1 rounded-full">
                PREMIUM
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      <div
        className={`transition-transform duration-300 ${
          isOpen ? "rotate-180" : ""
        }`}
      >
        <ChevronDown
          className={`h-6 w-6 ${
            sectionIsPremium ? "text-amber-600" : "text-blue-600"
          }`}
        />
      </div>
    </button>
  );

  /**
   * 한국이름에서 성을 제외한 이름 부분만 추출하는 함수
   * @param koreanName - 전체 한국이름 (예: "김서연")
   * @returns 성을 제외한 이름 부분 (예: "서연")
   */
  function extractGivenName(koreanName: string): string {
    if (!koreanName || koreanName.length < 2) return koreanName;
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
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-purple-800">
                Cultural Impression
              </h4>
              <p className="text-sm text-gray-600">
                See the vibe of people named &apos;{givenName}&apos;
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleSearchClick}
          className="w-full border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700 transition-all duration-200"
        >
          <Search className="mr-2 h-4 w-4" />
          See people named &apos;{givenName}&apos;
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* 상단 배지들 - 개선된 디자인 */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {isPremium && (
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 text-sm font-semibold text-amber-800 ring-2 ring-amber-200 shadow-md">
            <Sparkles className="mr-2 h-4 w-4" />
            Premium Analysis
          </span>
        )}
        <span
          className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ring-2 shadow-md ${
            gender === "masculine"
              ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 ring-blue-200"
              : gender === "feminine"
              ? "bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 ring-pink-200"
              : "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 ring-green-200"
          }`}
        >
          {gender === "masculine" ? "♂" : gender === "feminine" ? "♀" : "⚪"}{" "}
          {gender === "masculine"
            ? "Masculine"
            : gender === "feminine"
            ? "Feminine"
            : "Neutral"}{" "}
          Name
        </span>
        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-2 text-sm font-semibold text-purple-800 ring-2 ring-purple-200 shadow-md">
          {nameStyle === "pureKorean" ? "🌸 Pure Korean" : "📜 Hanja"} Style
        </span>
      </div>

      {/* 메인 이름 카드 - 완전히 새로운 디자인 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-1">
        <div className="bg-white rounded-3xl p-8 h-full">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-block text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4">
                Your Korean Name
              </span>
              <div className="flex items-center justify-center gap-4 mb-4">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {koreanInfo.full}
                </h3>
                {isPremium && (
                  <div className="flex items-center">
                    <AudioPlayer
                      audioUrl={audioUrl}
                      loading={audioLoading}
                      isPlaying={isPlaying}
                      onPlay={handlePlay}
                    />
                  </div>
                )}
              </div>
              <p className="text-xl text-gray-600 font-medium mb-2">
                ({koreanInfo.romanized})
              </p>
            </div>

            {/* 음절 구성 카드들 */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
              {koreanInfo.syllables.map((syllable, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-2 sm:p-4 border-2 border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-indigo-700 mb-1 sm:mb-2">
                      {syllable.syllable}
                    </div>
                    <div className="text-xs sm:text-sm text-purple-600 font-medium mb-1">
                      {syllable.romanized}
                    </div>
                    {nameStyle === "hanja" && syllable.hanja && (
                      <div className="text-sm sm:text-lg text-gray-700 mb-1 sm:mb-2 font-semibold">
                        {syllable.hanja}
                      </div>
                    )}
                    <div className="text-xs text-gray-600 leading-tight">
                      {syllable.keywords.join(" • ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 의미 설명 */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
              <h4 className="text-lg font-semibold text-indigo-800 mb-3">
                Name Meaning
              </h4>
              <p className="text-gray-700 italic leading-relaxed">
                &quot;{koreanInfo.meaning}&quot;
              </p>
            </div>

            {isPremium && (
              <button
                onClick={() => setShowDetailedStructure(!showDetailedStructure)}
                className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {showDetailedStructure ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    View Detailed Analysis
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Google 이미지 검색 섹션 */}
      <GoogleImageSearch koreanName={koreanInfo.full} />

      {/* 상세 분석 패널들 (프리미엄만) */}
      {isPremium && showDetailedStructure && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Detailed Cultural Analysis
            </h2>
            <p className="text-gray-600">
              Unlock the deeper meanings and cultural significance
            </p>
          </div>

          {/* 원본 이름 분석 */}
          {isNewPremiumKoreanNameData(data) && (
            <>
              <EnhancedAccordionToggle
                isOpen={showOriginalAnalysis}
                onClick={() => setShowOriginalAnalysis(!showOriginalAnalysis)}
                title="Original Name Analysis"
                icon={<Search className="h-5 w-5 text-amber-600" />}
                description="Deep dive into your original name's etymology and meaning"
                isPremium={true}
              />
              {showOriginalAnalysis && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-amber-200 space-y-6">
                  <div className="text-center">
                    <h4 className="text-2xl font-bold text-amber-800 mb-4">
                      📖 Your Original Name: {data.original_name.full}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.original_name.components.map((component, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200"
                      >
                        <div className="font-semibold text-amber-800 text-lg mb-3">
                          {component.name}
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Meanings:
                            </span>
                            <p className="text-amber-700">
                              {component.meanings.join(", ")}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Symbols:
                            </span>
                            <p className="text-gray-600">
                              {component.symbols.join(", ")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-6 border-2 border-amber-300">
                    <h5 className="font-semibold text-amber-800 text-lg mb-3 flex items-center">
                      <Brain className="mr-2 h-5 w-5" />
                      Overall Significance
                    </h5>
                    <p className="text-gray-700 leading-relaxed">
                      {data.original_name.summary}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Life Values */}
          {isNewPremiumKoreanNameData(data) && (
            <>
              <EnhancedAccordionToggle
                isOpen={showLifeValues}
                onClick={() => setShowLifeValues(!showLifeValues)}
                title="Life Values & Destiny"
                icon={<Sparkles className="h-5 w-5 text-blue-600" />}
                description="Discover your personality traits and life path insights"
                isPremium={true}
              />
              {showLifeValues && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-200">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-blue-100 rounded-full mr-4">
                      <Sparkles className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-blue-800">
                      Your Life Values
                    </h4>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                      {data.life_values.text}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Cultural Impression */}
          {isNewPremiumKoreanNameData(data) && (
            <>
              <EnhancedAccordionToggle
                isOpen={showCulturalImpression}
                onClick={() =>
                  setShowCulturalImpression(!showCulturalImpression)
                }
                title="Cultural Impression"
                icon={<Users className="h-5 w-5 text-pink-600" />}
                description="How Korean society perceives your name"
                isPremium={true}
              />
              {showCulturalImpression && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-pink-200">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-pink-100 rounded-full mr-4">
                      <Users className="h-6 w-6 text-pink-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-pink-800">
                      Cultural Perception
                    </h4>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                      {data.cultural_impression.text}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 문화적 참고 설명 */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200 text-center">
        <div className="flex items-center justify-center mb-3">
          <Music className="h-5 w-5 text-gray-600 mr-2" />
          <span className="text-sm font-medium text-gray-700">
            Cultural Note
          </span>
        </div>
        <p className="text-gray-600 leading-relaxed">
          Korean names carry deep cultural meaning. Every syllable is carefully
          chosen to reflect values, aspirations, and harmony with nature and
          tradition. Your name connects you to thousands of years of Korean
          heritage and wisdom.
        </p>
      </div>
    </div>
  );
}
