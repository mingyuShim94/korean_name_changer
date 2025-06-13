"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trackButtonClick, trackPageView } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { useSupabase } from "./providers";

export default function Home() {
  const router = useRouter();
  const {} = useSupabase();
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  // 클라이언트 사이드 렌더링 확인
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // 페이지 로드 시 페이지 조회 이벤트 추적
  React.useEffect(() => {
    if (isClient) {
      trackPageView("/", "Home Page - Korean Name Generator");
    }
  }, [isClient]);

  const handlePlayAudio = () => {
    if (!isClient) return;

    if (!audioRef.current) {
      audioRef.current = new Audio("/example_korean_name.mp3");
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  return (
    <div className="flex flex-col items-center space-y-12 max-w-4xl mx-auto px-4 pb-16">
      {/* 메인 히어로 섹션 */}
      <div className="text-center space-y-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 shadow-2xl w-full mt-8 md:mt-12 border border-white/20">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-gray-900 dark:text-white leading-tight">
            <span className="block sm:inline bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Discover Your Perfect Korean Name
            </span>
            <br className="hidden sm:block" />
            <span className="block sm:inline text-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-2 sm:mt-0">
              In Just 30 Seconds! 🇰🇷
            </span>
          </h1>

          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-gray-700 dark:text-gray-200 font-medium text-lg md:text-xl leading-relaxed">
              <span className="hidden md:block text-center">
                🎯 <strong className="text-primary">FREE AI-powered</strong>{" "}
                Korean name with deep cultural meanings,
                <br />
                authentic Hanja characters & perfect pronunciation
              </span>
              <span className="block md:hidden text-center">
                🎯 <strong className="text-primary">FREE AI</strong> Korean Name
                Generator with cultural meanings & pronunciation
              </span>
            </p>

            <div className="inline-flex items-center justify-center px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm font-semibold text-primary">
                ✨ Beta Launch - Shape the Future!
              </span>
            </div>
          </div>
        </div>

        {/* 가치 제안 강화 요소들 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
            <span className="text-2xl mb-1">🎭</span>
            <span className="text-xs font-medium text-center">
              Cultural Meanings
            </span>
          </div>
          <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
            <span className="text-2xl mb-1">📜</span>
            <span className="text-xs font-medium text-center">
              Hanja Characters
            </span>
          </div>
          <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
            <span className="text-2xl mb-1">🔊</span>
            <span className="text-xs font-medium text-center">
              Pronunciation
            </span>
          </div>
          <div className="flex flex-col items-center p-3 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/30">
            <span className="text-2xl mb-1">✨</span>
            <span className="text-xs font-medium text-center text-primary">
              100% Free
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => {
              trackButtonClick("hero_cta", "login");
              router.push("/auth");
            }}
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-bold px-12 py-4 rounded-2xl shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105 text-lg"
          >
            🌟 Get My Korean Name FREE
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            🚀 Launch Week Special • Free Basic + Premium Options
          </p>
        </div>
      </div>

      {/* 사회적 증명 섹션 */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-primary/5 via-blue-500/5 to-purple-500/5 rounded-2xl p-8 border border-primary/10 shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              ✨ Loved by Korean Culture Enthusiasts
            </h3>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">📚</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                  Korean Learners&apos; Choice
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">🌟</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                  Premium Quality
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">💎</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                  Cultural Resources
                </span>
              </div>
            </div>
          </div>

          {/* 실제 후기들 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                    <span className="text-lg font-bold text-primary">A</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    &quot;I really like it!!! I can share this with people
                    trying to learn Korean!&quot;
                  </p>
                  <div className="flex items-center mt-3">
                    <div className="flex text-yellow-400">
                      <span>⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                    <span className="text-lg font-bold text-blue-600">M</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    &quot;This is very cool! So much valuable information. Added
                    it to my Korean names resources. The cultural context is
                    great!&quot;
                  </p>
                  <div className="flex items-center mt-3">
                    <div className="flex text-yellow-400">
                      <span>⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 사회적 증명 섹션 CTA */}
          <div className="text-center mt-8">
            <Button
              onClick={() => {
                trackButtonClick("social_proof_cta", "login");
                router.push("/auth");
              }}
              variant="outline"
              size="lg"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 font-semibold px-8 py-3 rounded-xl"
            >
              ✨ Try It Yourself - FREE
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Join the community discovering their Korean names
            </p>
          </div>
        </div>
      </div>

      <section className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Korean Name Translation Example
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            See how our AI transforms your name into a meaningful Korean
            identity with deep cultural analysis
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-primary shadow-lg">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <span>✨ Translation Result</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h4 className="text-lg font-semibold mb-2">
                    Original Name Analysis:
                  </h4>
                  <p className="text-sm whitespace-normal break-keep hyphens-auto">
                    Harry Porter conveys the essence of a leader who is also a
                    steadfast guardian or bearer of responsibility, protecting
                    and guiding with strength and quiet devotion.
                  </p>
                </div>

                <div className="border-b pb-4">
                  <p className="text-sm text-muted-foreground mb-1">
                    Name Translation for
                  </p>
                  <p className="font-semibold">Harry Porter</p>
                  <h3 className="text-3xl font-bold text-primary mt-2">
                    박도현
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Park Do-Hyun (朴道賢)
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

                <div>
                  <h4 className="text-lg font-semibold mb-2">
                    Syllable Meanings:
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-primary/5 p-3 rounded-lg text-center">
                      <div className="font-semibold">박 (Park)</div>
                      <div className="text-xs bg-primary/10 px-1 py-0.5 rounded my-1 inline-block">
                        朴
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Grounded, authentic, steadfast
                      </div>
                    </div>
                    <div className="bg-primary/5 p-3 rounded-lg text-center">
                      <div className="font-semibold">도 (Do)</div>
                      <div className="text-xs bg-primary/10 px-1 py-0.5 rounded my-1 inline-block">
                        道
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Principled, directional, ethical
                      </div>
                    </div>
                    <div className="bg-primary/5 p-3 rounded-lg text-center">
                      <div className="font-semibold">현 (Hyun)</div>
                      <div className="text-xs bg-primary/10 px-1 py-0.5 rounded my-1 inline-block">
                        賢
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Wise, virtuous, capable
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold mb-2">
                    Integrated Meaning:
                  </h4>
                  <p className="text-sm whitespace-normal break-keep hyphens-auto">
                    Park Do-Hyun symbolizes &lsquo;a wise and principled leader
                    who walks the right path and protects with integrity,&rsquo;
                    reinterpreting Harry Porter&apos;s core leadership and
                    guardian-like qualities through a culturally resonant Korean
                    identity.
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold mb-2">Life Values:</h4>
                  <p className="text-sm whitespace-normal break-keep hyphens-auto">
                    This name embodies someone who is steady and grounded,
                    leading by example and unwavering principles. They inspire
                    trust and respect through their quiet strength, wisdom, and
                    responsible actions, always striving for what is right.
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold mb-2">
                    Cultural Impression:
                  </h4>
                  <p className="text-sm whitespace-normal break-keep hyphens-auto">
                    The name &lsquo;Do-Hyun&rsquo; conveys an image of
                    intelligence, integrity, and strong character in Korean
                    society. It is seen as modern and respectable, suitable for
                    individuals in professional or leadership roles.
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold mb-2">
                    Shareable Content:
                  </h4>
                  <div className="bg-primary/5 p-3 rounded-lg">
                    <p className="font-medium">Harry Porter : 박도현 🏛️⚖️🌟</p>
                    <p className="text-sm text-muted-foreground mt-2 whitespace-normal break-keep hyphens-auto">
                      A wise and principled leader who walks the right path with
                      integrity
                    </p>
                  </div>
                </div>

                {/* 예시 하단 CTA */}
                <div className="border-t pt-6 text-center">
                  <Button
                    onClick={() => {
                      trackButtonClick("example_cta", "login");
                      router.push("/auth");
                    }}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
                  >
                    ✨ Create My Korean Name Like This
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Basic Features FREE • Premium for $1.90
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section for Better SEO */}
      <section className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to know about our Korean name generator
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
              How does the Korean name generator work?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Our AI analyzes your name&apos;s meaning and cultural
              significance, then creates a Korean name that reflects your
              identity with proper Hanja characters and pronunciations.
            </p>
          </div>

          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
              Is the Korean name generator really free?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Yes! Our basic Korean name generator is completely free. We also
              offer premium features for more detailed cultural analysis and
              additional options.
            </p>
          </div>

          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
              What makes Korean names special?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Korean names often carry deep cultural meanings through Hanja
              characters, reflecting virtues, nature, and family values that
              have been cherished for generations.
            </p>
          </div>

          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
              Can I use my Korean name officially?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              While our generated names are culturally appropriate, please
              consult local regulations for official name changes. Many people
              use Korean names for cultural appreciation and learning.
            </p>
          </div>
        </div>

        {/* FAQ 하단 CTA */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-2xl p-8 border border-primary/10">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to discover your Korean name?
            </h3>
            <Button
              onClick={() => {
                trackButtonClick("faq_cta", "login");
                router.push("/auth");
              }}
              size="lg"
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-bold px-12 py-4 rounded-2xl shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105 text-lg"
            >
              🚀 Start My Korean Name Journey
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              🚀 New Launch Special • Free Basic + Premium Options
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
