"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface NameInputFormProps {
  onSubmit: (name: string) => void;
  isLoading: boolean;
}

export function NameInputForm({ onSubmit, isLoading }: NameInputFormProps) {
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Type your name");
      return;
    }
    onSubmit(name);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="foreign-name">Your Name</Label>
        <Input
          type="text"
          id="foreign-name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          placeholder="e.g. John Smith"
          className="block w-full"
          disabled={isLoading}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 pt-1">{error}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Korean Name"}
      </Button>
    </form>
  );
}
