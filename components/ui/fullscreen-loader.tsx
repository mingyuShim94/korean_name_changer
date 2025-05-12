"use client";

import * as React from "react";

interface FullScreenLoaderProps {
  message?: string;
}

export function FullScreenLoader({
  message = "AI is creating a Korean name.Please wait a moment...",
}: FullScreenLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      <p className="mt-6 text-lg font-medium text-foreground text-center whitespace-pre-line">
        {message}
      </p>
    </div>
  );
}
