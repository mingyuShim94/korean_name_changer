"use client";

import Link from "next/link";
import Image from "next/image";
import { useSupabase } from "@/app/providers";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, loading } = useSupabase();
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();

    // 로그아웃 시 프리미엄 상태 초기화를 위한 커스텀 이벤트 발생
    const logoutEvent = new CustomEvent("user-logout");
    window.dispatchEvent(logoutEvent);

    router.refresh();
  };

  return (
    <header className="bg-gray-100 py-3 md:py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold">
          <Link href="/" className="cursor-pointer flex items-center">
            <Image
              src="/favicon.ico"
              alt="Korean Name Logo"
              width={32}
              height={32}
              className="mr-2"
            />
            Name To Korean
          </Link>
        </h1>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <Link
                href="/pricing"
                className="text-sm md:text-base hover:underline"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-sm md:text-base hover:underline"
              >
                Terms & Policies
              </Link>
            </li>
            <li>
              {loading ? (
                <span className="text-sm md:text-base text-gray-500">
                  Loading...
                </span>
              ) : user ? (
                <button
                  onClick={handleSignOut}
                  className="text-sm md:text-base text-blue-600 hover:underline"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="text-sm md:text-base text-blue-600 hover:underline"
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
