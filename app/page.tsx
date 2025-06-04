"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
      <div className="text-center space-y-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl w-full mt-4 md:mt-8">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900 dark:text-white whitespace-normal">
          <span className="inline-block">Find the Korean Name</span>{" "}
          <span className="inline-block">That Reflects You</span>
        </h1>
        <p className="text-gray-700 dark:text-gray-200 max-w-[600px] mx-auto font-medium text-base md:text-lg whitespace-normal break-keep">
          <span className="hidden md:inline whitespace-nowrap">
            Start with your name → Let AI explore its essence → Welcome your
            Korean name
          </span>
          <span className="flex flex-col gap-2 md:hidden">
            <span className="flex items-center justify-center whitespace-nowrap">
              Start with your name
            </span>
            <span className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M12 5v14"></path>
                <path d="m19 12-7 7-7-7"></path>
              </svg>
            </span>
            <span className="flex items-center justify-center whitespace-nowrap">
              Let AI explore its essence
            </span>
            <span className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M12 5v14"></path>
                <path d="m19 12-7 7-7-7"></path>
              </svg>
            </span>
            <span className="flex items-center justify-center whitespace-nowrap">
              Welcome your Korean name
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
            Get Your Korean Name Now
          </Button>
        </div>
      </div>

      <section className="w-full max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          Free vs Premium Results Example
        </h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          See how our premium tier offers deeper insights into your Korean name
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-md">
            <CardHeader className="bg-slate-50 dark:bg-slate-800/20">
              <CardTitle className="flex items-center gap-2">
                <span>Free Tier Example</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="inline-flex items-center rounded-md bg-green-100/80 px-2 py-1 text-xs font-medium text-green-800 ring-1 ring-inset ring-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                    Neutral Name
                  </span>
                  <span className="inline-flex items-center rounded-md bg-purple-100/80 px-2 py-1 text-xs font-medium text-purple-800 ring-1 ring-inset ring-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20">
                    Hanja Style
                  </span>
                </div>

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

                  <div>
                    <h4 className="text-lg font-semibold mb-2">
                      Name Rationale:
                    </h4>
                    <p className="text-sm whitespace-normal break-keep hyphens-auto">
                      The surname &ldquo;김&rdquo; (Kim) was chosen to reflect
                      the traditional strength in Watson. The given name
                      &ldquo;예린&rdquo; (Ye-rin) captures Emily&apos;s essence,
                      combining artistic grace with pure clarity.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-lg font-semibold mb-2">
                    Shareable Content:
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-800/20 p-3 rounded-lg">
                    <p className="font-medium">Emily Watson : 김예린 🌟💖💧</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary shadow-md">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <span>Premium Tier Example</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
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

                <div className="border-b pb-4">
                  <h4 className="text-lg font-semibold mb-2">
                    Original Name Analysis:
                  </h4>
                  <p className="text-sm whitespace-normal break-keep hyphens-auto">
                    Rooted in English and Germanic traditions, this name
                    reflects a legacy of diligence and strength. It subtly
                    suggests a refined individual with a quietly powerful
                    character.
                  </p>
                </div>

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

                <div className="border-t pt-3">
                  <h4 className="text-lg font-semibold mb-2">
                    Name Rationale:
                  </h4>
                  <p className="text-sm whitespace-normal break-keep hyphens-auto">
                    A spirit that finds beauty in diligence and cultivates inner
                    purity. This person approaches life with clear intentions,
                    artistic sensibility, and a gentle grace.
                  </p>
                </div>

                <div className="border-t pt-3">
                  <h4 className="text-lg font-semibold mb-2">Life Values:</h4>
                  <p className="text-sm whitespace-normal break-keep hyphens-auto">
                    A spirit that finds beauty in diligence and cultivates inner
                    purity. This person approaches life with clear intentions,
                    artistic sensibility, and a gentle grace.
                  </p>
                </div>

                <div className="border-t pt-3">
                  <h4 className="text-lg font-semibold mb-2">
                    Cultural Impression:
                  </h4>
                  <p className="text-sm whitespace-normal break-keep hyphens-auto">
                    The name &ldquo;예린&rdquo; (Ye-rin) is perceived as elegant
                    and modern in Korean society. It evokes an image of someone
                    gentle, intelligent, and artistically inclined.
                  </p>
                </div>

                <div className="border-t pt-3">
                  <h4 className="text-lg font-semibold mb-2">
                    Shareable Content:
                  </h4>
                  <div className="bg-primary/5 p-3 rounded-lg">
                    <p className="font-medium">Emily Watson : 김예린 🌟💖💧</p>
                    <p className="text-sm text-muted-foreground mt-2 whitespace-normal break-keep hyphens-auto">
                      A name that expresses diligent grace and clear beauty,
                      embodying a harmonious and refined spirit.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-primary/5">
              <p className="text-xs text-muted-foreground whitespace-normal break-keep hyphens-auto">
                ✨ Premium features include detailed analysis, cultural context,
                life values, and audio pronunciation
              </p>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}
