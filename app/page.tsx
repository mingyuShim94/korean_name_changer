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
    <div className="flex flex-col items-center space-y-8 max-w-4xl mx-auto px-4">
      <div className="text-center space-y-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-xl w-full mt-4 md:mt-8">
        <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white leading-tight px-2">
          <span className="block sm:inline">What&apos;s Your Korean Name?</span>
          <br className="hidden sm:block" />
          <span className="block sm:inline">Find Out Instantly! 🇰🇷</span>
        </h1>
        <p className="text-gray-700 dark:text-gray-200 max-w-[600px] mx-auto font-medium text-base md:text-lg whitespace-normal break-words px-4">
          <span className="hidden md:block text-center leading-relaxed">
            🎯 Free AI-powered Korean name generator with cultural meanings,
            <br />
            Hanja characters & pronunciation guide
          </span>
          <span className="flex flex-col gap-2 md:hidden text-center">
            <span className="text-sm">🎯 Free AI Korean Name Generator</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Cultural meanings • Hanja characters • Pronunciation
            </span>
          </span>
        </p>
        <div className="mt-6">
          <Button
            onClick={() => {
              trackButtonClick("hero_cta", "login");
              router.push("/auth");
            }}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            🌟 Get My Korean Name FREE
          </Button>
        </div>
      </div>

      <section className="w-full max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          Korean Name Translation Example
        </h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          See how our AI transforms your name into a meaningful Korean identity
        </p>

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
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section for Better SEO */}
      <section className="w-full max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">
          Frequently Asked Questions
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 shadow">
            <h3 className="font-semibold mb-2">
              How does the Korean name generator work?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Our AI analyzes your name&apos;s meaning and cultural
              significance, then creates a Korean name that reflects your
              identity with proper Hanja characters and pronunciations.
            </p>
          </div>
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 shadow">
            <h3 className="font-semibold mb-2">
              Is the Korean name generator really free?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Yes! Our basic Korean name generator is completely free. We also
              offer premium features for more detailed cultural analysis and
              additional options.
            </p>
          </div>
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 shadow">
            <h3 className="font-semibold mb-2">
              What makes Korean names special?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Korean names often carry deep cultural meanings through Hanja
              characters, reflecting virtues, nature, and family values that
              have been cherished for generations.
            </p>
          </div>
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 shadow">
            <h3 className="font-semibold mb-2">
              Can I use my Korean name officially?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              While our generated names are culturally appropriate, please
              consult local regulations for official name changes. Many people
              use Korean names for cultural appreciation and learning.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
