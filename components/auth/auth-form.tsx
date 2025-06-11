"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Database } from "@/types/supabase";

export default function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const supabase = createClientComponentClient<Database>();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Verification email sent. Please check your email.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Login successful!",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Google login error:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "An error occurred during Google login.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl rounded-3xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-6 pt-8">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <span className="text-white text-2xl">🔐</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isSignUp
              ? "Join us to discover your perfect Korean name"
              : "Sign in to continue your Korean name journey"}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-8">
        <form onSubmit={handleAuth} className="space-y-6">
          {/* Google Login Button */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            variant="outline"
            className="w-full py-6 text-lg font-semibold border-2 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
          >
            <Image
              src="/google-logo.svg"
              alt="Google Logo"
              width={24}
              height={24}
              className="mr-3"
            />
            {loading ? "Processing..." : "Continue with Google"}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">
                or continue with email
              </span>
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="py-6 text-lg border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="py-6 text-lg border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              required
            />
            {isSignUp && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`rounded-xl p-4 border ${
                message.type === "error"
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                  : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">
                  {message.type === "error" ? "⚠️" : "✅"}
                </span>
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Toggle Sign Up/Login */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage(null);
              }}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Create one"}
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200/50">
          <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
            <span>🔒</span>
            <span className="font-medium">
              Your data is secure and encrypted
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
