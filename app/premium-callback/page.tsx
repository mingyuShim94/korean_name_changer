"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { generateKoreanNameAction } from "../actions";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";

export default function PremiumCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] =
    useState<string>("결제 정보 확인 중...");

  useEffect(() => {
    const handleCallback = async () => {
      // Gumroad의 결제 성공 파라미터 확인
      const purchaseId = searchParams.get("purchase_id");
      const gumroadSuccess = !!purchaseId;

      if (!gumroadSuccess) {
        setError("결제가 완료되지 않았습니다. 다시 시도해주세요.");
        // 3초 후 메인 페이지로 리다이렉트
        setTimeout(() => {
          router.push("/");
        }, 3000);
        return;
      }

      try {
        // localStorage에서 이름 정보 가져오기
        const name = localStorage.getItem("premium_name");
        const gender = localStorage.getItem("premium_gender") as
          | "masculine"
          | "feminine"
          | "neutral";
        const nameStyle = localStorage.getItem("premium_nameStyle") as
          | "hanja"
          | "pureKorean";

        if (!name || !gender || !nameStyle) {
          setError(
            "필요한 정보가 누락되었습니다. 메인 페이지에서 다시 시도해주세요."
          );
          // 3초 후 메인 페이지로 리다이렉트
          setTimeout(() => {
            router.push("/");
          }, 3000);
          return;
        }

        setProcessingStatus(
          "결제가 확인되었습니다. 프리미엄 이름을 생성하는 중..."
        );

        // 프리미엄 이름 생성 요청
        const result = await generateKoreanNameAction({
          name,
          gender,
          nameStyle,
          isPremium: true,
        });

        if (result.error) {
          setError(result.error);
          console.error("Server Action Error:", result.error);
          // 3초 후 메인 페이지로 리다이렉트
          setTimeout(() => {
            router.push("/");
          }, 3000);
        } else if (result.data) {
          // localStorage 정리
          localStorage.removeItem("premium_name");
          localStorage.removeItem("premium_gender");
          localStorage.removeItem("premium_nameStyle");

          // 결과 페이지로 리다이렉트
          router.push(
            `/result?data=${encodeURIComponent(
              JSON.stringify(result.data)
            )}&nameStyle=${nameStyle}&type=premium&gender=${gender}&purchase_id=${purchaseId}`
          );
        }
      } catch (err) {
        setError((err as Error).message);
        // 3초 후 메인 페이지로 리다이렉트
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div
            className="bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">오류: </strong>
            <span className="block sm:inline">{error}</span>
            <p className="mt-2 text-sm">3초 후 메인 페이지로 이동합니다...</p>
          </div>
        </div>
      </div>
    );
  }

  return <FullScreenLoader message={processingStatus} />;
}
