"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

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
 */
interface NameResultDisplayProps {
  data: KoreanNameData | null;
  loading: boolean;
}

/**
 * 변환된 한국 이름과 관련 정보를 표시하는 컴포넌트입니다.
 * 로딩 상태 및 데이터 유무에 따라 다른 UI를 렌더링합니다.
 */
export function NameResultDisplay({ data, loading }: NameResultDisplayProps) {
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
          Korean Name (Hangeul, Hanja, Romanized)
        </h3>
        <p className="text-sm md:text-base text-foreground lg:text-lg">
          {data.korean_name}
        </p>
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
        <div className="space-y-2">
          <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
            Hanja Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {data.hanja_breakdown.map((item, index) => (
              <div
                key={index}
                className="rounded-md border bg-muted/30 p-2 md:p-3 text-center"
              >
                <p className="text-xl md:text-2xl mb-1 md:mb-2 font-semibold text-primary">
                  {item.character}
                </p>
                <p className="text-xs md:text-sm text-foreground/90">
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
            Poetic Beauty
          </h3>
          <p className="whitespace-pre-wrap text-sm md:text-base text-foreground lg:text-lg">
            {data.poetic_interpretation}
          </p>
        </div>
      )}
    </div>
  );
}
