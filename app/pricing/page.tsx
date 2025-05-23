"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { trackButtonClick, trackPageView } from "@/lib/analytics";

export default function PricingPage() {
  const router = useRouter();

  // Track page view on component mount
  React.useEffect(() => {
    trackPageView("/pricing", "Pricing Page");
  }, []);

  const handleButtonClick = (tier: string) => {
    trackButtonClick(`select_${tier}_tier`, "from_pricing_page");
    router.push(`/?tier=${tier}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-muted/40">
      <div className="max-w-5xl w-full mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Our Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover your perfect Korean name with our thoughtfully designed
            plans
          </p>
        </div>

        <div className="mt-8 bg-muted p-6 rounded-lg">
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
                    Premium ($1.99)
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
                  <td className="py-3 px-4">Syllable Meanings & Hanja</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Name Rationale</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Social Share Format</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Original Name Analysis</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Life Values & Direction</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Korean Name Cultural Impression</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Audio Pronunciation</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Stable Name Generation</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">
            Ready to Begin Your Korean Name Journey?
          </h2>
          <div className="flex justify-center">
            <Button onClick={() => handleButtonClick("free")} className="px-8">
              Get Started Now
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Start with free tier and upgrade to premium anytime
          </p>
        </div>
      </div>
    </main>
  );
}
