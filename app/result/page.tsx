"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ImprovedResultDisplay } from "@/components/improved-result-display";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackButtonClick, trackPageView } from "@/lib/analytics";
import { GenderOption, NameStyleOption } from "@/app/lib/krNameSystemPrompts";

// New interface definition - Free version
interface FreeKoreanNameData {
  original_name: string;
  original_name_analysis: {
    summary: string;
  };
  korean_name_suggestion: {
    full_name: string;
    rationale?: string;
    syllables?: {
      syllable: string;
      romanization: string;
      hanja?: string;
      meaning: string;
    }[];
  };
  korean_name_impression?: string;
  social_share_content: {
    formatted: string;
  };
}

// New interface definition - Premium version
interface PremiumKoreanNameData {
  original_name: string;
  original_name_analysis: {
    letters: {
      letter: string;
      meaning: string;
    }[];
    summary: string;
  };
  korean_name_suggestion: {
    full_name: string;
    syllables: {
      syllable: string;
      romanization: string;
      hanja: string;
      meaning: string;
    }[];
    rationale: string;
    life_values: string;
  };
  korean_name_impression: string;
  social_share_content: {
    formatted: string;
    summary: string;
  };
}

// Result data union type
type ResultData = FreeKoreanNameData | PremiumKoreanNameData;

// Extended free tier data type with syllables information - unified with existing interface
interface UpgradedFreeKoreanNameData extends FreeKoreanNameData {
  korean_name_suggestion: {
    full_name: string;
    rationale?: string;
    syllables?: {
      syllable: string;
      romanization: string;
      hanja?: string;
      meaning: string;
    }[];
  };
}

// Internal component that reads SearchParams and displays results
function ResultContent() {
  const searchParams = useSearchParams();
  const [resultData, setResultData] = React.useState<ResultData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isPremium, setIsPremium] = React.useState<boolean>(false);
  const [nameStyle, setNameStyle] = React.useState<NameStyleOption>("hanja");
  const [gender, setGender] = React.useState<GenderOption>("neutral");

  React.useEffect(() => {
    const dataString = searchParams.get("data");

    // Extract required values from search parameters
    const type = searchParams.get("type") || "free";
    const style = searchParams.get("nameStyle") || "hanja";
    const genderParam = searchParams.get("gender") || "neutral";

    // Determine premium status based on URL parameters (not dependent on data structure)
    setIsPremium(type === "premium");
    setNameStyle(style as NameStyleOption);
    setGender(genderParam as GenderOption);

    if (dataString) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataString));

        // Validate if parsed data has the correct format
        if (parsedData && parsedData.original_name) {
          // Filter data for free users (based on URL parameter)
          if (type !== "premium") {
            // Include syllables information in free tier to enable similar UI structure as premium
            const freeData: UpgradedFreeKoreanNameData = {
              original_name: parsedData.original_name,
              original_name_analysis: {
                summary:
                  parsedData.original_name_analysis?.summary ||
                  "Your Korean name is based on your original name's essence.",
              },
              korean_name_suggestion: {
                full_name: parsedData.korean_name_suggestion?.full_name || "",
                rationale: parsedData.korean_name_suggestion?.rationale || "",
                // Use syllables information from server if available
                syllables: parsedData.korean_name_suggestion?.syllables || [],
              },
              korean_name_impression:
                parsedData.korean_name_impression || undefined,
              social_share_content: {
                formatted:
                  parsedData.social_share_content?.formatted ||
                  `${parsedData.original_name} : ${
                    parsedData.korean_name_suggestion?.full_name || ""
                  }`,
              },
            };
            setResultData(freeData as ResultData);
          } else {
            // Provide full data for premium users
            setResultData(parsedData);
          }
        } else {
          throw new Error("Data format is invalid");
        }
      } catch (e) {
        console.error("Failed to parse result data:", e);
        setError("Failed to load result data. The format may be invalid.");
      }
    } else {
      // Case where there is no data, for example, direct access to /result
      setError(
        "No result data to display. Please return to the home page and try again."
      );
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="mt-4 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 rounded-md p-4 text-sm">
        <h3 className="font-semibold mb-1">Error:</h3>
        <p>{error}</p>
        <Link
          href="/"
          className="mt-2 inline-block text-blue-600 hover:underline"
          onClick={() => trackButtonClick("return_to_home", "from_error")}
        >
          Return to Home
        </Link>
      </div>
    );
  }

  // Use improved ImprovedResultDisplay component
  return (
    <>
      <div className="text-center space-y-4 mb-6">
        <h1 className="flex flex-col gap-2 text-3xl font-bold tracking-tighter sm:text-4xl">
          <span className="text-primary">Your Korean Name</span>
          <span>Meaning & Translation</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-[600px] mx-auto">
          Explore the deep meaning and cultural significance of your
          personalized Korean name, complete with Hanja characters and
          pronunciation guide.
        </p>
      </div>
      <ImprovedResultDisplay
        data={resultData}
        loading={false}
        nameStyle={nameStyle}
        isPremium={isPremium}
        gender={gender}
      />
      {resultData && (
        <CardFooter className="flex p-6 pt-0 sm:p-8 sm:pt-0">
          <div className="flex flex-col w-full gap-3">
            <Button className="w-full text-sm md:text-base text-center" asChild>
              <Link
                href="/"
                onClick={() =>
                  trackButtonClick("generate_another_name", "from_result_page")
                }
              >
                Generate Another Name
              </Link>
            </Button>
          </div>
        </CardFooter>
      )}
    </>
  );
}

export default function ResultPage() {
  const searchParams = useSearchParams();

  // Track event on page load
  React.useEffect(() => {
    const type = searchParams.get("type") || "free";
    const nameStyle = searchParams.get("nameStyle") || "hanja";
    const gender = searchParams.get("gender") || "neutral";

    // Track result page view event
    trackPageView(
      "/result",
      `Result Page - ${
        type === "premium" ? "Premium" : "Free"
      } ${nameStyle} Name (${gender})`
    );
  }, [searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-muted/40">
      <div className="w-full max-w-4xl mx-auto px-4 flex flex-col items-center space-y-8">
        <div className="text-center space-y-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl w-full">
          <h1 className="flex flex-col gap-2 text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900 dark:text-white">
            <span className="text-primary">Your Korean Name</span>
            <span>Meaning & Translation</span>
          </h1>
          <p className="text-gray-700 dark:text-gray-200 max-w-[600px] mx-auto font-medium text-lg">
            Explore the deep meaning and cultural significance of your
            personalized Korean name, complete with Hanja characters and
            pronunciation guide.
          </p>
        </div>

        <Card className="w-full max-w-lg shadow-xl rounded-2xl border-t-4 border-primary relative">
          <CardContent className="p-6 sm:p-8">
            <React.Suspense
              fallback={
                <p className="text-center text-muted-foreground">
                  Loading results...
                </p>
              }
            >
              <ResultContent />
            </React.Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
