"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type GenderOption = "masculine" | "feminine";

interface NameInputFormProps {
  onSubmit: (name: string) => void;
  isLoading: boolean;
  selectedGender: GenderOption;
  onGenderChange: (gender: GenderOption) => void;
}

export function NameInputForm({
  onSubmit,
  isLoading,
  selectedGender,
  onGenderChange,
}: NameInputFormProps) {
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [windowWidth, setWindowWidth] = React.useState(0);

  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Type your name");
      return;
    }
    onSubmit(name);
  };

  const placeholderText =
    windowWidth < 768
      ? "e.g. Hailey Morgan, さくら 田中"
      : "e.g. Hailey Morgan, さくら 田中, ليلى الفاروق";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="foreign-name">Your Name</Label>
        <Input
          type="text"
          id="foreign-name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          placeholder={placeholderText}
          className="block w-full"
          disabled={isLoading}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 pt-1">{error}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Name Nuance</Label>
        <RadioGroup
          value={selectedGender}
          onValueChange={onGenderChange}
          className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
          disabled={isLoading}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="masculine" id="masculine" />
            <Label htmlFor="masculine" className="font-normal">
              Masculine
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="feminine" id="feminine" />
            <Label htmlFor="feminine" className="font-normal">
              Feminine
            </Label>
          </div>
        </RadioGroup>
        <p className="text-xs text-muted-foreground pt-1">
          Choose the nuance for your Korean name.
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Korean Name"}
      </Button>
    </form>
  );
}
