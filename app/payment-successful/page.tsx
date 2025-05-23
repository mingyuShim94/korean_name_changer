"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";

export default function PaymentSuccessfulPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [redirecting, setRedirecting] = React.useState(false);
  const requestSentRef = React.useRef(false); // useRef를 사용하여 요청 상태 추적

  React.useEffect(() => {
    // 이미 요청을 보냈으면 중복 실행 방지
    if (requestSentRef.current) return;

    // JWT 토큰 확인
    const token = searchParams.get("token");

    if (!token) {
      setError("유효하지 않은 접근입니다. 인증 토큰이 필요합니다.");
      setIsProcessing(false);
      return;
    }

    // 요청 상태 표시
    requestSentRef.current = true;
    console.log("API 요청 시작 - 중복 방지 플래그 설정");

    // API 호출
    fetch("/api/generate-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || `API 요청 실패 (${res.status})`);
          });
        }
        return res.json();
      })
      .then((data) => {
        setRedirecting(true);

        // 응답 데이터에서 필요한 정보 추출
        const type = data.isPremium ? "premium" : "free";
        const gender = data.gender || "neutral";
        const nameStyle = data.nameStyle || "hanja";

        // 결과 페이지로 리다이렉션
        router.push(
          `/result?data=${encodeURIComponent(
            JSON.stringify(data)
          )}&nameStyle=${nameStyle}&type=${type}&gender=${gender}`
        );
      })
      .catch((err) => {
        console.error("API 호출 오류:", err);
        setError(err.message || "이름 생성 중 오류가 발생했습니다.");
        setIsProcessing(false);
        // 오류 발생 시 재시도 가능하도록 플래그 초기화
        requestSentRef.current = false;
      });
  }, [searchParams, router]); // hasProcessed 의존성 제거

  if (isProcessing || redirecting) {
    // 로딩 메시지 표시
    return <FullScreenLoader message="한국어 이름 생성 중..." />;
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-red-500">
          <h1 className="text-2xl font-bold">오류가 발생했습니다</h1>
          <p>{error}</p>
          <button
            onClick={() => {
              // 홈으로 돌아갈 때 플래그 초기화
              requestSentRef.current = false;
              router.push("/");
            }}
            className="mt-4 p-2 bg-blue-500 text-white rounded"
          >
            처음으로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  // This should never be shown now, but keeping as a fallback
  return <FullScreenLoader message="결과 페이지로 이동 중..." />;
}
