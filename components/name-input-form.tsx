"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type GenderOption = "masculine" | "feminine" | "neutral";
type NameStyleOption = "hanja" | "pureKorean";

interface NameInputFormProps {
  onSubmit: (name: string) => void;
  isLoading: boolean;
  selectedGender: GenderOption;
  onGenderChange: (gender: GenderOption) => void;
  selectedNameStyle: NameStyleOption;
  onNameStyleChange: (style: NameStyleOption) => void;
  isPremium?: boolean;
  inputName?: string;
  onNameChange?: (name: string) => void;
  hasPremiumCredit?: boolean;
}

export function NameInputForm({
  onSubmit,
  isLoading,
  selectedGender,
  onGenderChange,
  selectedNameStyle,
  onNameStyleChange,
  isPremium = false,
  inputName = "",
  onNameChange,
  hasPremiumCredit = false,
}: NameInputFormProps) {
  const [name, setName] = React.useState(inputName);
  const [error, setError] = React.useState<string | null>(null);
  const [windowWidth, setWindowWidth] = React.useState(0);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);

    // 초기 너비 설정 및 리사이즈 이벤트 리스너
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // 클라이언트 사이드에서만 window 객체에 접근
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth); // 초기 너비 설정
      window.addEventListener("resize", handleResize);
    }

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  // inputName prop이 변경되면 내부 상태 업데이트
  React.useEffect(() => {
    if (inputName !== undefined) {
      setName(inputName);
    }
  }, [inputName]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Type your name");
      return;
    }
    onSubmit(name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (onNameChange) {
      onNameChange(newName);
    }
  };

  // 기본 플레이스홀더 텍스트 (서버 렌더링용)
  let placeholderText = "e.g. Hailey Morgan, さくら 田中";

  // 클라이언트 사이드에서만 화면 크기에 따라 플레이스홀더 변경
  if (isClient) {
    placeholderText =
      windowWidth < 768
        ? "e.g. Hailey Morgan, さくら 田中"
        : "e.g. Hailey Morgan, さくら 田中, ليلى الفاروق";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 relative">
      <div className="space-y-1 md:space-y-1.5">
        <Label htmlFor="foreign-name" className="text-sm md:text-base">
          Your Name
        </Label>
        <Input
          type="text"
          id="foreign-name"
          value={name}
          onChange={handleNameChange}
          placeholder={placeholderText}
          className="block w-full h-10 md:h-11 px-3 md:px-4 text-sm md:text-base"
          disabled={isLoading}
        />
        {error && (
          <p className="text-xs md:text-sm text-red-600 dark:text-red-400 pt-1">
            {error}
          </p>
        )}
      </div>
      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-sm md:text-base">Name Nuance</Label>
        <RadioGroup
          value={selectedGender}
          onValueChange={onGenderChange}
          className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
          disabled={isLoading}
        >
          <div className="flex items-center space-x-2 py-1 touch-action-manipulation">
            <RadioGroupItem
              value="masculine"
              id="masculine"
              className="h-4 w-4 md:h-5 md:w-5"
            />
            <Label
              htmlFor="masculine"
              className="font-normal text-sm md:text-base cursor-pointer"
            >
              Masculine
            </Label>
          </div>
          <div className="flex items-center space-x-2 py-1 touch-action-manipulation">
            <RadioGroupItem
              value="feminine"
              id="feminine"
              className="h-4 w-4 md:h-5 md:w-5"
            />
            <Label
              htmlFor="feminine"
              className="font-normal text-sm md:text-base cursor-pointer"
            >
              Feminine
            </Label>
          </div>
          <div className="flex items-center space-x-2 py-1 touch-action-manipulation">
            <RadioGroupItem
              value="neutral"
              id="neutral"
              className="h-4 w-4 md:h-5 md:w-5"
            />
            <Label
              htmlFor="neutral"
              className="font-normal text-sm md:text-base cursor-pointer"
            >
              Neutral
            </Label>
          </div>
        </RadioGroup>
        <p className="text-xs md:text-sm text-muted-foreground pt-1">
          Choose the nuance for your Korean name.
        </p>
      </div>
      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-sm md:text-base">Name Style</Label>
        <RadioGroup
          value={selectedNameStyle}
          onValueChange={onNameStyleChange}
          className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
          disabled={isLoading}
        >
          <div className="flex items-center space-x-2 py-1 touch-action-manipulation">
            <RadioGroupItem
              value="hanja"
              id="hanja"
              className="h-4 w-4 md:h-5 md:w-5"
            />
            <Label
              htmlFor="hanja"
              className="font-normal text-sm md:text-base cursor-pointer"
            >
              Hanja-based Name
            </Label>
          </div>
          <div className="flex items-center space-x-2 py-1 touch-action-manipulation">
            <RadioGroupItem
              value="pureKorean"
              id="pureKorean"
              className="h-4 w-4 md:h-5 md:w-5"
            />
            <Label
              htmlFor="pureKorean"
              className="font-normal text-sm md:text-base cursor-pointer"
            >
              Pure Korean Name
            </Label>
          </div>
        </RadioGroup>
        <p className="text-xs md:text-sm text-muted-foreground pt-1">
          Choose between traditional Hanja-based name or modern Pure Korean
          name.
        </p>
      </div>
      <Button
        type="submit"
        className="w-full h-10 md:h-11 text-sm md:text-base active:scale-[0.98] transition-transform"
        disabled={isLoading}
      >
        {isLoading ? "Generating..." : "Generate Korean Name"}
      </Button>
      {isPremium && !hasPremiumCredit && (
        <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 z-10" />
      )}
    </form>
  );
}
