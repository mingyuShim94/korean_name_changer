"use client";

import * as React from "react";
import { Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  audioUrl: string | null;
  loading: boolean;
}

/**
 * 한국어 이름 발음을 재생하는 오디오 플레이어 컴포넌트
 */
export function AudioPlayer({ audioUrl, loading }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // 새로운 오디오 URL이 들어오면 오디오 엘리먼트 업데이트
  React.useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  // 오디오 재생/일시정지 처리
  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 오디오 종료시 상태 업데이트
  const handleEnded = () => {
    setIsPlaying(false);
  };

  // 오디오 에러 발생 시 처리
  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error("오디오 재생 중 오류가 발생했습니다:", e);
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center space-x-2 py-2 mt-2">
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onError={handleError}
        className="hidden"
      />

      <Button
        variant="secondary"
        size="sm"
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm shadow-sm transition-colors hover:bg-primary/90 hover:text-primary-foreground"
        disabled={!audioUrl || loading || isPlaying}
        onClick={togglePlay}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Preparing audio...</span>
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4" />
            <span>Listen to pronunciation</span>
          </>
        )}
      </Button>
    </div>
  );
}
