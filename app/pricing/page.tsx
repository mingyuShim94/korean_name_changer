"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { trackButtonClick, trackPageView } from "@/lib/analytics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

export default function PricingPage() {
  const router = useRouter();
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Track page view on component mount
  React.useEffect(() => {
    trackPageView("/pricing", "Pricing Page");
  }, []);

  const handleButtonClick = (tier: string) => {
    trackButtonClick(`select_${tier}_tier`, "from_pricing_page");
    router.push(`/?tier=${tier}`);
  };

  const handlePlayAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/example_korean_name.mp3");
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-muted/40">
      <div className="max-w-5xl w-full mx-auto space-y-12">
        {/* 헤더 섹션 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover your perfect Korean name with our thoughtfully designed
            plans
          </p>
        </div>

        {/* 기능 비교표 */}
        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-6 text-center">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 font-medium">
                    Free ($0)
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    Premium ($1.90)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 px-4">Korean Name Generation</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Basic Syllable Meanings</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Name Rationale</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Simple Shareable Format</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Original Name Analysis</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Detailed Hanja Meanings</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Life Values Interpretation</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Cultural Impression</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Audio Pronunciation</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Enhanced Shareable Content</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Credits Included</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">5 times</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">
            Ready to Begin Your Korean Name Journey?
          </h2>
          <div className="flex justify-center gap-4">
            <Button onClick={() => handleButtonClick("free")} variant="outline">
              Try Free Tier
            </Button>
            <Button onClick={() => handleButtonClick("premium")}>
              Get Premium ($1.90 for 5 Credits)
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Start with free tier and upgrade to premium anytime
          </p>
        </div>

        {/* 예시 결과 섹션 */}
        <section className="w-full max-w-4xl mx-auto border-t pt-12">
          <h2 className="text-3xl font-bold text-center mb-4">
            See the Difference in Action
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Compare our free and premium tiers with this real example
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 무료 티어 예시 */}
            <Card className="shadow-md">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/20">
                <CardTitle className="flex items-center gap-2">
                  <span>Free Tier Example</span>
                  <span className="text-sm bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                    Free
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* 상단 배지 */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-flex items-center rounded-md bg-green-100/80 px-2 py-1 text-xs font-medium text-green-800 ring-1 ring-inset ring-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                      Neutral Name
                    </span>
                    <span className="inline-flex items-center rounded-md bg-purple-100/80 px-2 py-1 text-xs font-medium text-purple-800 ring-1 ring-inset ring-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20">
                      Hanja Style
                    </span>
                  </div>

                  {/* 이름 정보 */}
                  <div className="border-b pb-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      Name Translation for
                    </p>
                    <p className="font-semibold">Emily Watson</p>
                    <h3 className="text-2xl font-bold text-primary mt-2">
                      김예린
                    </h3>
                    <p className="text-sm text-muted-foreground">Kim Ye-rin</p>
                  </div>

                  {/* 이름 의미 */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold mb-2">
                        Syllable Meanings:
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-50 dark:bg-slate-800/20 p-3 rounded-lg text-center">
                          <div className="font-semibold">김 (Kim)</div>
                          <div className="text-sm text-muted-foreground">
                            Gold, tradition
                          </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/20 p-3 rounded-lg text-center">
                          <div className="font-semibold">예 (Ye)</div>
                          <div className="text-sm text-muted-foreground">
                            Art, skill
                          </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/20 p-3 rounded-lg text-center">
                          <div className="font-semibold">린 (Rin)</div>
                          <div className="text-sm text-muted-foreground">
                            Clear, pure
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 이름 선택 이유 */}
                    <div>
                      <h4 className="text-lg font-semibold mb-2">
                        Name Rationale:
                      </h4>
                      <p className="text-sm">
                        The surname &ldquo;김&rdquo; (Kim) was chosen to reflect
                        the traditional strength in Watson. The given name
                        &ldquo;예린&rdquo; (Ye-rin) captures Emily&apos;s
                        essence, combining artistic grace with pure clarity.
                      </p>
                    </div>
                  </div>

                  {/* 공유 콘텐츠 */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-lg font-semibold mb-2">
                      Shareable Content:
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-800/20 p-3 rounded-lg">
                      <p className="font-medium">
                        Emily Watson : 김예린 🌟💖💧
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 dark:bg-slate-800/20">
                <Button
                  onClick={() => handleButtonClick("free")}
                  className="w-full"
                >
                  Try Free Tier
                </Button>
              </CardFooter>
            </Card>

            {/* 프리미엄 티어 예시 */}
            <Card className="border-2 border-primary shadow-md">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <span>Premium Tier Example</span>
                  <span className="text-sm bg-primary/20 px-2 py-1 rounded">
                    Premium
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* 상단 배지 */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-flex items-center rounded-md bg-amber-100/80 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20">
                      ✨ Premium Analysis ✨
                    </span>
                    <span className="inline-flex items-center rounded-md bg-green-100/80 px-2 py-1 text-xs font-medium text-green-800 ring-1 ring-inset ring-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                      Neutral Name
                    </span>
                    <span className="inline-flex items-center rounded-md bg-purple-100/80 px-2 py-1 text-xs font-medium text-purple-800 ring-1 ring-inset ring-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20">
                      Hanja Style
                    </span>
                  </div>

                  {/* 원본 이름 분석 */}
                  <div className="border-b pb-4">
                    <h4 className="text-lg font-semibold mb-2">
                      Original Name Analysis:
                    </h4>
                    <p className="text-sm">
                      Rooted in English and Germanic traditions, this name
                      reflects a legacy of diligence and strength. It subtly
                      suggests a refined individual with a quietly powerful
                      character.
                    </p>
                  </div>

                  {/* 이름 정보 */}
                  <div className="border-b pb-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      Name Translation for
                    </p>
                    <p className="font-semibold">Emily Watson</p>
                    <h3 className="text-2xl font-bold text-primary mt-2">
                      김예린
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Kim Ye-rin (金藝潾)
                    </p>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePlayAudio}
                      >
                        <span className="mr-2">🔊</span>
                        Listen
                      </Button>
                    </div>
                  </div>

                  {/* 상세 의미 */}
                  <div>
                    <h4 className="text-lg font-semibold mb-2">
                      Syllable Meanings:
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-primary/5 p-3 rounded-lg text-center">
                        <div className="font-semibold">김 (Kim)</div>
                        <div className="text-xs bg-primary/10 px-1 py-0.5 rounded my-1 inline-block">
                          金
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Gold, tradition, dignity, strength
                        </div>
                      </div>
                      <div className="bg-primary/5 p-3 rounded-lg text-center">
                        <div className="font-semibold">예 (Ye)</div>
                        <div className="text-xs bg-primary/10 px-1 py-0.5 rounded my-1 inline-block">
                          藝
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Art, skill, talent, cultivation
                        </div>
                      </div>
                      <div className="bg-primary/5 p-3 rounded-lg text-center">
                        <div className="font-semibold">린 (Rin)</div>
                        <div className="text-xs bg-primary/10 px-1 py-0.5 rounded my-1 inline-block">
                          潾
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Clear water, pure, graceful, tranquil
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 이름 선택 이유 */}
                  <div className="border-t pt-3">
                    <h4 className="text-lg font-semibold mb-2">
                      Name Rationale:
                    </h4>
                    <p className="text-sm">
                      A spirit that finds beauty in diligence and cultivates
                      inner purity. This person approaches life with clear
                      intentions, artistic sensibility, and a gentle grace.
                    </p>
                  </div>

                  {/* 인생 가치관 */}
                  <div className="border-t pt-3">
                    <h4 className="text-lg font-semibold mb-2">Life Values:</h4>
                    <p className="text-sm">
                      A spirit that finds beauty in diligence and cultivates
                      inner purity. This person approaches life with clear
                      intentions, artistic sensibility, and a gentle grace.
                    </p>
                  </div>

                  {/* 문화적 인상 */}
                  <div className="border-t pt-3">
                    <h4 className="text-lg font-semibold mb-2">
                      Cultural Impression:
                    </h4>
                    <p className="text-sm">
                      The name &ldquo;예린&rdquo; (Ye-rin) is perceived as
                      elegant and modern in Korean society. It evokes an image
                      of someone gentle, intelligent, and artistically inclined.
                    </p>
                  </div>

                  {/* 공유 콘텐츠 */}
                  <div className="border-t pt-3">
                    <h4 className="text-lg font-semibold mb-2">
                      Shareable Content:
                    </h4>
                    <div className="bg-primary/5 p-3 rounded-lg">
                      <p className="font-medium">
                        Emily Watson : 김예린 🌟💖💧
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        A name that expresses diligent grace and clear beauty,
                        embodying a harmonious and refined spirit.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-primary/5">
                <Button
                  onClick={() => handleButtonClick("premium")}
                  className="w-full"
                  variant="default"
                >
                  Try Premium ($1.90 for 5 Credits)
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
