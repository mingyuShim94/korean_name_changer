"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { NameInputForm } from "@/components/name-input-form";
import { Card, CardContent } from "@/components/ui/card";
import { createNameGenerationToken } from "../actions"; // JWT 토큰 생성 액션 추가
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackButtonClick, trackPageView } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { useSupabase } from "../providers";
import {
  checkPremiumCredit,
  getTotalPremiumCredits,
  applyPremiumCredit,
} from "@/lib/premium";
import { PaymentPendingDialog } from "@/components/ui/payment-pending-dialog";

// 성별 느낌 옵션 정의 수정
type GenderOption = "masculine" | "feminine" | "neutral";
// 이름 스타일 옵션 정의 추가
type NameStyleOption = "hanja" | "pureKorean";

export default function GeneratePage() {
  const router = useRouter();
  const { user, loading } = useSupabase();
  const [error, setError] = React.useState<string | null>(null);
  const [selectedGender, setSelectedGender] =
    React.useState<GenderOption>("masculine");
  const [selectedNameStyle, setSelectedNameStyle] =
    React.useState<NameStyleOption>("hanja");
  const [activeTab, setActiveTab] = React.useState<"free" | "premium">("free");
  const [inputName, setInputName] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);
  const [hasPremiumCredit, setHasPremiumCredit] = React.useState(false);
  const [premiumCredits, setPremiumCredits] = React.useState(0);
  const [isClient, setIsClient] = React.useState(false);

  // 클라이언트 사이드 렌더링 확인
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // 페이지 로드 시 페이지 조회 이벤트 추적
  React.useEffect(() => {
    if (isClient) {
      trackPageView("/generate", "Generate Page - Korean Name Generator");
    }
  }, [isClient]);

  // 로그인 상태 확인 및 리다이렉션
  React.useEffect(() => {
    if (isClient && !loading && !user) {
      // 로그인되지 않은 사용자는 로그인 페이지로 리다이렉션
      router.push("/auth");
    }
  }, [isClient, loading, user, router]);

  // 프리미엄 크레딧 상태 체크
  React.useEffect(() => {
    const checkCredit = async () => {
      if (isClient && user) {
        try {
          const credit = await checkPremiumCredit();
          setHasPremiumCredit(!!credit);

          // 총 크레딧 수 확인
          const totalCredits = await getTotalPremiumCredits();
          setPremiumCredits(totalCredits);
        } catch (error) {
          console.error("크레딧 확인 중 오류 발생:", error);
        }
      } else {
        // 사용자가 로그인하지 않은 경우 프리미엄 상태 초기화
        setHasPremiumCredit(false);
        setPremiumCredits(0);
      }
    };
    checkCredit();
  }, [isClient, user]);

  // 로그아웃 이벤트 리스너 추가
  React.useEffect(() => {
    if (!isClient) return;

    // 로그아웃 이벤트 핸들러
    const handleLogout = () => {
      // 프리미엄 상태 초기화
      setHasPremiumCredit(false);
      setPremiumCredits(0);
      // 필요시 탭 상태도 free로 변경
      setActiveTab("free");
      // 로그인 페이지로 리다이렉션
      router.push("/");
    };

    // 이벤트 리스너 등록
    window.addEventListener("user-logout", handleLogout);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("user-logout", handleLogout);
    };
  }, [isClient, router]);

  const handleTabChange = (value: string) => {
    if (!isClient) return; // 클라이언트 사이드에서만 실행

    trackButtonClick("tab_switch", value);
    setActiveTab(value as "free" | "premium");
  };

  const handleFreeNameSubmit = async (
    name: string,
    gender: GenderOption,
    nameStyle: NameStyleOption
  ) => {
    if (!isClient) return; // 클라이언트 사이드에서만 실행

    // Google Analytics 이벤트 추적
    trackButtonClick("generate_korean_name", `free_${gender}_${nameStyle}`);

    setError(null);
    console.log(
      "Submitting FREE: Name:",
      name,
      "Gender:",
      gender,
      "Style:",
      nameStyle
    );

    try {
      setIsLoading(true);

      // JWT 토큰 생성
      const { token } = await createNameGenerationToken({
        name,
        gender,
        nameStyle,
        isPremium: false,
      });

      // 토큰과 함께 리다이렉션
      router.push(`/payment-successful?token=${token}`);
    } catch (error) {
      console.error("Error generating name:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while generating the name."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePremiumNameSubmit = async (
    name: string,
    gender: GenderOption,
    nameStyle: NameStyleOption
  ) => {
    if (!isClient) return; // 클라이언트 사이드에서만 실행

    // Google Analytics 이벤트 추적
    trackButtonClick("generate_korean_name", `premium_${gender}_${nameStyle}`);

    try {
      setIsLoading(true);

      // 프리미엄 크레딧 확인
      const credit = await checkPremiumCredit();

      if (!credit || credit.credits_remaining <= 0) {
        setError(
          "사용 가능한 프리미엄 크레딧이 없습니다. 먼저 프리미엄 이용권을 구매해주세요."
        );
        return;
      }

      // 먼저 토큰 생성 (크레딧 차감 전)
      const { token } = await createNameGenerationToken({
        name,
        gender,
        nameStyle,
        isPremium: true,
        creditApplied: true, // 차감 예정임을 표시
      });

      // 토큰 생성 성공 후 크레딧 차감
      try {
        const result = await applyPremiumCredit(credit.id);
        console.log("크레딧 차감 결과:", result);
      } catch (creditError) {
        console.error("크레딧 차감 중 오류 발생:", creditError);
        throw creditError;
      }

      // 크레딧 정보 업데이트
      const totalCredits = await getTotalPremiumCredits();
      console.log("업데이트된 총 크레딧:", totalCredits);
      setPremiumCredits(totalCredits);

      // 토큰과 함께 리다이렉션
      router.push(`/payment-successful?token=${token}`);
    } catch (error) {
      console.error("Error handling premium name generation:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while processing your request."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseClick = () => {
    if (!isClient) return; // 클라이언트 사이드에서만 실행

    // 로그인 확인 (이미 로그인된 사용자만 이 페이지에 접근 가능)

    // URL에 사용자 정보와 식별 정보를 custom_fields로 추가
    // 브라우저 API는 클라이언트 사이드에서만 실행해야 함
    let requestId = "";
    let timestamp = 0;

    // 브라우저 API 사용은 클라이언트 사이드에서만 실행
    requestId = crypto.randomUUID(); // 요청 고유 ID 생성
    timestamp = Date.now(); // 현재 시간

    const customFields = encodeURIComponent(
      JSON.stringify({
        userId: user?.id, // 사용자 ID 추가
        email: user?.email, // 사용자 이메일 추가
        timestamp: timestamp,
        requestId: requestId,
      })
    );

    const productId = "oauri";
    // Gumroad URL 생성 및 새 창에서 열기
    const gumroadUrl = `https://gumroad.com/l/${productId}?wanted=true&custom_fields=${customFields}`;

    // 결제 대기 팝업 표시
    setShowPaymentDialog(true);

    // Gumroad 결제 페이지 열기
    window.open(gumroadUrl.toString(), "_blank");
  };

  const handlePaymentComplete = async () => {
    if (!isClient) return; // 클라이언트 사이드에서만 실행

    setShowPaymentDialog(false);
    // 결제가 완료되면 새로고침하여 프리미엄 이용권을 다시 확인
    router.refresh();
  };

  // 스켈레톤 UI 렌더링
  if (!isClient || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-40 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 경우 (이미 useEffect에서 리다이렉션 처리됨)
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-8 max-w-5xl mx-auto px-4 pb-16">
      {/* 서비스 헤더 - 간결하고 기능 중심 */}
      <div className="text-center space-y-4 w-full">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-primary">
            Service Ready
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          Generate Your Korean Name
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
          Follow the steps below to create your personalized Korean name
        </p>
      </div>

      {/* 메인 서비스 영역 */}
      <div className="grid lg:grid-cols-3 gap-8 w-full">
        {/* 왼쪽: 프로세스 안내 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/95 dark:bg-gray-900/95 rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
              📋 How it works
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Enter your name
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Type your first and last name
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Choose options
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select gender feel & name style
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Get your result
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive your Korean name instantly
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 프리미엄 혜택 카드 */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">✨</span>
              <h3 className="font-bold text-lg text-amber-800 dark:text-amber-200">
                Premium Benefits
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
              <li className="flex items-center gap-2">
                <span className="text-amber-600">✓</span>
                <span>Deep cultural analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-600">✓</span>
                <span>Audio pronunciation guide</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-600">✓</span>
                <span>Life values interpretation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-600">✓</span>
                <span>Cultural impression analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-600">✓</span>
                <span>Enhanced shareable content</span>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-amber-200/50">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                💰 Only $1.90 for 5 credits
              </p>
            </div>
          </div>
        </div>

        {/* 오른쪽: 메인 폼 영역 */}
        <div className="lg:col-span-2">
          <Card className="shadow-2xl rounded-3xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            <CardContent className="p-8 space-y-8">
              {/* 개선된 탭 디자인 */}
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl p-2">
                  <TabsTrigger
                    value="free"
                    className="rounded-xl font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Free</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="premium"
                    className="rounded-xl font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <span>✨</span>
                      <span>Premium</span>
                      {hasPremiumCredit && premiumCredits > 0 && (
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                          {premiumCredits}
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="free" className="pt-8 space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200/50">
                    <h4 className="font-bold text-lg mb-2 text-blue-800 dark:text-blue-200">
                      🆓 Free Korean Name Generation
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                      Get your Korean name with basic cultural meanings, Hanja
                      characters, and pronunciation guide.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">✓</span>
                        <span>Korean name generation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">✓</span>
                        <span>Basic cultural meanings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">✓</span>
                        <span>Hanja characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">✓</span>
                        <span>Pronunciation guide</span>
                      </div>
                    </div>
                  </div>

                  <NameInputForm
                    onSubmit={(name) =>
                      handleFreeNameSubmit(
                        name,
                        selectedGender,
                        selectedNameStyle
                      )
                    }
                    isLoading={isLoading}
                    selectedGender={selectedGender}
                    onGenderChange={(gender) => setSelectedGender(gender)}
                    selectedNameStyle={selectedNameStyle}
                    onNameStyleChange={(style) => setSelectedNameStyle(style)}
                    isPremium={false}
                    inputName={inputName}
                    onNameChange={setInputName}
                  />
                </TabsContent>

                <TabsContent value="premium" className="pt-8 space-y-6">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200/50">
                    <h4 className="font-bold text-xl mb-3 text-amber-800 dark:text-amber-200">
                      ✨ Premium Korean Name Generation
                    </h4>
                    <p className="text-amber-700 dark:text-amber-300 mb-4 leading-relaxed">
                      Unlock the full potential with deep cultural analysis,
                      audio pronunciation, life values interpretation, and much
                      more detailed insights.
                    </p>

                    {!hasPremiumCredit ? (
                      <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            Premium Access Required
                          </span>
                          <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            $1.90
                          </span>
                        </div>
                        <Button
                          onClick={handlePurchaseClick}
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                          🚀 Get Premium Access (5 Credits)
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-4 border border-green-200/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="font-semibold text-green-800 dark:text-green-200">
                            Premium Active
                          </span>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          You have {premiumCredits} premium credits remaining
                        </p>
                      </div>
                    )}
                  </div>

                  <NameInputForm
                    onSubmit={(name) =>
                      handlePremiumNameSubmit(
                        name,
                        selectedGender,
                        selectedNameStyle
                      )
                    }
                    isLoading={isLoading}
                    selectedGender={selectedGender}
                    onGenderChange={(gender) => setSelectedGender(gender)}
                    selectedNameStyle={selectedNameStyle}
                    onNameStyleChange={(style) => setSelectedNameStyle(style)}
                    isPremium={true}
                    inputName={inputName}
                    onNameChange={setInputName}
                    hasPremiumCredit={hasPremiumCredit}
                  />
                </TabsContent>
              </Tabs>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">⚠️</span>
                    <div>
                      <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                        Something went wrong
                      </h3>
                      <p className="text-red-700 dark:text-red-300 text-sm">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showPaymentDialog && (
        <PaymentPendingDialog
          onPaymentComplete={handlePaymentComplete}
          onClose={() => setShowPaymentDialog(false)}
        />
      )}
    </div>
  );
}
