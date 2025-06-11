"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { trackButtonClick, trackPageView } from "@/lib/analytics";
import { useSupabase } from "../providers";
import { PaymentPendingDialog } from "@/components/ui/payment-pending-dialog";

export default function PricingPage() {
  const router = useRouter();
  const { user } = useSupabase();
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  // 클라이언트 사이드 렌더링 확인
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Track page view on component mount
  React.useEffect(() => {
    if (isClient) {
      trackPageView("/pricing", "Pricing Page");
    }
  }, [isClient]);

  const handleButtonClick = (tier: string) => {
    if (!isClient) return;

    trackButtonClick(`select_${tier}_tier`, "from_pricing_page");

    if (tier === "free") {
      router.push("/");
    } else if (tier === "premium") {
      // 로그인 확인
      if (!user) {
        // 로그인되지 않은 사용자는 로그인 페이지로 리다이렉션
        router.push("/auth");
        return;
      }
      // 로그인된 사용자는 결제 진행
      handlePurchaseClick();
    }
  };

  const handlePurchaseClick = () => {
    if (!isClient || !user) return;

    // 결제 분석 이벤트 추적
    trackButtonClick("purchase_premium", "from_pricing_page");

    // URL에 사용자 정보와 식별 정보를 custom_fields로 추가
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
    if (!isClient) return;

    setShowPaymentDialog(false);
    // 결제가 완료되면 generate 페이지로 이동
    router.push("/generate");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 히어로 섹션 */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full border border-blue-200/50">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Simple & Transparent Pricing
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent">
            Choose Your Korean
            <br />
            Name Journey
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Start for free and unlock premium features for deeper cultural
            insights and enhanced experience
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>No subscription required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Pay once, use 5 times</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Instant access</span>
            </div>
          </div>
        </div>

        {/* 가격 카드 섹션 */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Free 플랜 */}
          <Card className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8 pt-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Free Forever
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Free Tier
                </h2>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    $0
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Perfect for getting started
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  What&apos;s included:
                </h3>
                <ul className="space-y-3">
                  {[
                    "Korean name generation",
                    "Basic cultural meanings",
                    "Hanja characters & keywords",
                    "Syllable analysis",
                    "Pronunciation guide",
                    "Unlimited usage",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-xs">
                          ✓
                        </span>
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handleButtonClick("free")}
                variant="outline"
                className="w-full py-6 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          {/* Premium 플랜 */}
          <Card className="relative overflow-hidden border-2 border-amber-300 dark:border-amber-600 shadow-2xl shadow-amber-200/50 dark:shadow-amber-900/50 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 dark:from-gray-900 dark:via-amber-900/10 dark:to-orange-900/10 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
            <CardHeader className="text-center pb-8 pt-12">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Premium Access
                  </span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Premium
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl text-gray-500 dark:text-gray-400 line-through">
                      $9.50
                    </span>
                    <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      $1.90
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <span className="text-green-600 dark:text-green-400 text-xs font-bold">
                      80% OFF
                    </span>
                    <span className="text-green-600 dark:text-green-400 text-xs">
                      Launch Special
                    </span>
                  </div>
                  <p className="text-amber-700 dark:text-amber-300">
                    5 premium generations
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Everything in Free, plus:
                </h3>
                <ul className="space-y-3">
                  {[
                    "Deep cultural analysis",
                    "Audio pronunciation guide",
                    "Original name breakdown",
                    "Life values interpretation",
                    "Cultural impression analysis",
                    "Enhanced shareable content",
                    "Symbolic associations",
                    "Priority support",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="w-5 h-5 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                        <span className="text-amber-600 dark:text-amber-400 text-xs">
                          ✓
                        </span>
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200/50">
                <div className="text-center space-y-2">
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                    💝 Only $0.38 per generation
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Regular price: $1.90 per generation
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handleButtonClick("premium")}
                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🚀 Get Premium Access
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 가치 제안 섹션 */}
        <div className="text-center space-y-12 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Why Choose Premium?
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Deeper Insights
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Uncover the rich cultural meanings and life values embedded in
                your Korean name
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <span className="text-white text-2xl">🔊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Audio Pronunciation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Learn the perfect pronunciation with native speaker audio guides
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <span className="text-white text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Enhanced Content
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get beautifully formatted, shareable content perfect for social
                media
              </p>
            </div>
          </div>
        </div>

        {/* 상세 기능 비교 */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Detailed Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                    Feature
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">
                    Free
                  </th>
                  <th className="text-center py-4 px-6 font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  ["Korean Name Generation", "✅", "✅"],
                  ["Syllable Analysis", "✅", "✅"],
                  ["Hanja Characters & Keywords", "✅", "✅"],
                  ["Basic Pronunciation Guide", "✅", "✅"],
                  ["Integrated Name Meaning", "✅", "✅"],
                  ["Original Name Analysis", "❌", "✅"],
                  ["Audio Pronunciation", "❌", "✅"],
                  ["Deep Cultural Analysis", "❌", "✅"],
                  ["Life Values Interpretation", "❌", "✅"],
                  ["Cultural Impression Analysis", "❌", "✅"],
                  ["Enhanced Shareable Content", "❌", "✅"],
                  ["Symbolic Associations", "❌", "✅"],
                  ["Priority Support", "❌", "✅"],
                ].map(([feature, free, premium], index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      {feature}
                    </td>
                    <td className="text-center py-4 px-6 text-xl">
                      {free === "✅" ? (
                        <span className="text-green-500">✅</span>
                      ) : (
                        <span className="text-gray-400">❌</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-6 text-xl">
                      {premium === "✅" ? (
                        <span className="text-amber-500">✅</span>
                      ) : (
                        <span className="text-gray-400">❌</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="text-center space-y-8 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-amber-900/20 rounded-3xl p-12 border border-amber-200/50">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Ready to Discover Your Korean Name?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of users who&apos;ve found their perfect Korean
            identity
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-lg mx-auto">
            <Button
              onClick={() => handleButtonClick("free")}
              variant="outline"
              className="flex-1 py-6 text-lg font-semibold border-2 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Start Free
            </Button>
            <Button
              onClick={() => handleButtonClick("premium")}
              className="flex-1 py-6 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Get Premium - $1.90
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-green-500">🔒</span>
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">⚡</span>
              <span>Instant access</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">💯</span>
              <span>No subscription</span>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 대기 팝업 */}
      {showPaymentDialog && (
        <PaymentPendingDialog
          onPaymentComplete={handlePaymentComplete}
          onClose={() => setShowPaymentDialog(false)}
        />
      )}
    </main>
  );
}
