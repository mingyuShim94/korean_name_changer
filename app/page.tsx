"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { NameInputForm } from "@/components/name-input-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { createNameGenerationToken } from "./actions"; // JWT 토큰 생성 액션 추가
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackButtonClick, trackPageView } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

// 성별 느낌 옵션 정의 수정
type GenderOption = "masculine" | "feminine" | "neutral";
// 이름 스타일 옵션 정의 추가
type NameStyleOption = "hanja" | "pureKorean";

export default function Home() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [selectedGender, setSelectedGender] =
    React.useState<GenderOption>("masculine");
  const [selectedNameStyle, setSelectedNameStyle] =
    React.useState<NameStyleOption>("hanja");
  const [activeTab, setActiveTab] = React.useState<"free" | "premium">("free");
  const [inputName, setInputName] = React.useState<string>("");
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // 페이지 로드 시 페이지 조회 이벤트 추적
  React.useEffect(() => {
    trackPageView("/", "Home Page - Korean Name Generator");
  }, []);

  const handleFreeNameSubmit = async (
    name: string,
    gender: GenderOption,
    nameStyle: NameStyleOption
  ) => {
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
      console.error("Token generation error:", error);
      setError(
        "An error occurred while preparing the name generation request."
      );
    }
  };

  const handlePremiumNameSubmit = async (
    name: string,
    gender: GenderOption,
    nameStyle: NameStyleOption
  ) => {
    // Google Analytics 이벤트 추적
    trackButtonClick("generate_korean_name", `premium_${gender}_${nameStyle}`);

    setError(null);
    console.log(
      "Submitting PREMIUM: Name:",
      name,
      "Gender:",
      gender,
      "Style:",
      nameStyle
    );

    try {
      // JWT 토큰 생성
      const { token } = await createNameGenerationToken({
        name,
        gender,
        nameStyle,
        isPremium: true,
      });

      // 결제 기능 비활성화하고 바로 payment-successful 페이지로 이동
      router.push(`/payment-successful?token=${token}`);
    } catch (error) {
      console.error("Token generation error:", error);
      setError(
        "An error occurred while preparing the name generation request."
      );
    }
  };

  // Tab 전환 시 이벤트 추적
  const handleTabChange = (value: string) => {
    trackButtonClick("tab_switch", value);
    setActiveTab(value as "free" | "premium");
  };

  const handlePlayAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/example_korean_name.mp3");
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  return (
    <div className="flex flex-col items-center space-y-8 max-w-4xl mx-auto px-4">
      <div className="text-center space-y-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl w-full mt-8">
        <h1 className="flex flex-col gap-3 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900 dark:text-white">
          <span className="text-primary">NameToKorean</span>
          <span>Find Your Perfect Korean Name</span>
        </h1>
        <p className="text-gray-700 dark:text-gray-200 max-w-[600px] mx-auto font-medium text-lg">
          Discover the meaning behind your personalized Korean name. Our name
          translator combines traditional Hanja characters and modern pure
          Korean to create names that reflect your identity.
        </p>
      </div>

      <Card className="w-full max-w-md shadow-xl rounded-2xl border-t-4 border-primary">
        <CardContent className="p-8 space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="free">Free</TabsTrigger>
              <TabsTrigger value="premium">
                ✨ Premium(Free during beta test)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="free" className="pt-6">
              <NameInputForm
                onSubmit={(name) =>
                  handleFreeNameSubmit(name, selectedGender, selectedNameStyle)
                }
                isLoading={false}
                selectedGender={selectedGender}
                onGenderChange={(gender) => setSelectedGender(gender)}
                selectedNameStyle={selectedNameStyle}
                onNameStyleChange={(style) => setSelectedNameStyle(style)}
                isPremium={false}
                inputName={inputName}
                onNameChange={setInputName}
              />
            </TabsContent>
            <TabsContent value="premium" className="pt-6 space-y-4">
              <div className="p-4 border rounded-md bg-gradient-to-r from-yellow-100 via-amber-50 to-yellow-100 dark:from-yellow-800/30 dark:via-amber-900/20 dark:to-yellow-800/30">
                <h4 className="font-semibold text-lg mb-2 text-amber-700 dark:text-amber-400">
                  🌟 The Special Features of Premium Name Generation!
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  The premium service offers a more diverse and in-depth
                  interpretation of the generated names. Discover the cultural
                  meanings, pronunciation characteristics, and deep meanings of
                  the hanja contained in the names.
                  <br />
                  🎉 During the beta test, this premium service is available for
                  free!
                </p>
              </div>
              <NameInputForm
                onSubmit={(name) =>
                  handlePremiumNameSubmit(
                    name,
                    selectedGender,
                    selectedNameStyle
                  )
                }
                isLoading={false}
                selectedGender={selectedGender}
                onGenderChange={(gender) => setSelectedGender(gender)}
                selectedNameStyle={selectedNameStyle}
                onNameStyleChange={(style) => setSelectedNameStyle(style)}
                isPremium={true}
                inputName={inputName}
                onNameChange={setInputName}
              />
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 rounded-md p-4 text-sm">
              <h3 className="font-semibold mb-1">Error:</h3>
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

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
                    <p className="text-sm">
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
                  <p className="text-sm">
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
                  <p className="text-sm">
                    A spirit that finds beauty in diligence and cultivates inner
                    purity. This person approaches life with clear intentions,
                    artistic sensibility, and a gentle grace.
                  </p>
                </div>

                <div className="border-t pt-3">
                  <h4 className="text-lg font-semibold mb-2">Life Values:</h4>
                  <p className="text-sm">
                    A spirit that finds beauty in diligence and cultivates inner
                    purity. This person approaches life with clear intentions,
                    artistic sensibility, and a gentle grace.
                  </p>
                </div>

                <div className="border-t pt-3">
                  <h4 className="text-lg font-semibold mb-2">
                    Cultural Impression:
                  </h4>
                  <p className="text-sm">
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
                    <p className="text-sm text-muted-foreground mt-2">
                      A name that expresses diligent grace and clear beauty,
                      embodying a harmonious and refined spirit.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-primary/5">
              <p className="text-xs text-muted-foreground">
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
