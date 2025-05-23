"use client";

import * as React from "react";

interface FullScreenLoaderProps {
  message?: string;
  duration?: number; // Loading duration in seconds. If 0 or negative, timer/progress won't show.
}

export function FullScreenLoader({
  message = "Processing your request. This may take a little while...",
  duration = 15,
}: FullScreenLoaderProps) {
  const [timeLeft, setTimeLeft] = React.useState(duration > 0 ? duration : 0);
  const [tipIndex, setTipIndex] = React.useState(0);
  // Show extended message if the initial duration passes and the loader is still visible.
  const [showExtendedMessage, setShowExtendedMessage] = React.useState(false);

  const tips = [
    "Korean names typically consist of 2-3 syllables.",
    "In Hanja names, the meaning of each character is important.",
    "In Korea, the family name comes before the given name.",
    "The most common Korean surnames are Kim, Lee, and Park.",
    "Pure Korean names often reflect nature, virtues, or aspirations.",
    "In Korea, names must be registered within one week of birth.",
    "Both pronunciation and meaning are important for Korean names.",
    "Many Koreans consult naming experts who consider birth charts.",
  ];

  React.useEffect(() => {
    let timer: NodeJS.Timeout | undefined = undefined;
    if (duration > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer as NodeJS.Timeout);
            setShowExtendedMessage(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    const tipTimer = setInterval(() => {
      setTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
    }, 5000);

    return () => {
      if (timer) clearInterval(timer);
      clearInterval(tipTimer);
    };
  }, [duration, tips.length]); // duration 추가

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm bg-transparent">
      <div className="w-full max-w-md p-6 rounded-xl bg-card/90 shadow-xl border border-border flex flex-col items-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-primary"></div>
          {duration > 0 && timeLeft > 0 && (
            <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-lg">
              {timeLeft}s
            </div>
          )}
        </div>

        <p className="mt-6 text-lg font-medium text-card-foreground text-center whitespace-pre-line">
          {message}
        </p>

        {duration > 0 && (
          <div className="w-full h-2 bg-muted rounded-full mt-6 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {duration > 0 && timeLeft > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Working on it... {timeLeft}s remaining
          </p>
        )}
        {showExtendedMessage && timeLeft === 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
            This is taking a bit longer than usual. Thanks for your patience!
          </p>
        )}

        <div className="mt-6 p-4 bg-secondary/30 rounded-lg border border-border">
          <p className="text-sm text-secondary-foreground">
            <span className="font-semibold">💡 Did you know?</span>
            <br />
            {tips[tipIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
