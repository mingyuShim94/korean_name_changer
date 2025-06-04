"use client";

import Link from "next/link";
import Image from "next/image";
import { useSupabase } from "@/app/providers";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const { user, loading } = useSupabase();
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();

    // 로그아웃 시 프리미엄 상태 초기화를 위한 커스텀 이벤트 발생
    const logoutEvent = new CustomEvent("user-logout");
    window.dispatchEvent(logoutEvent);

    router.refresh();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gray-100 py-3 md:py-4 relative">
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

        {/* 데스크탑 메뉴 */}
        <nav className="hidden md:block">
          <ul className="flex space-x-4 items-center">
            <li>
              <Link href="/pricing" className="text-base hover:underline">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-base hover:underline">
                Terms & Policies
              </Link>
            </li>
            <li>
              {loading ? (
                <span className="text-base text-gray-500">Loading...</span>
              ) : user ? (
                <button
                  onClick={handleSignOut}
                  className="text-base text-blue-600 hover:underline"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="text-base text-blue-600 hover:underline"
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
        </nav>

        {/* 모바일 햄버거 아이콘 */}
        <button
          className="md:hidden flex items-center"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 12H21M3 6H21M3 18H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-50 flex flex-col">
          <div className="p-4 flex flex-col space-y-4">
            <Link
              href="/pricing"
              className="text-sm hover:underline py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/terms"
              className="text-sm hover:underline py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Terms & Policies
            </Link>
          </div>

          {/* 로그인/로그아웃 버튼 - 하단에 분리 배치 */}
          <div className="border-t border-gray-200 p-4 mt-2">
            {loading ? (
              <span className="text-sm text-gray-500 block py-2">
                Loading...
              </span>
            ) : user ? (
              <button
                onClick={handleSignOut}
                className="text-sm text-blue-600 hover:underline w-full text-left py-2"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/auth"
                className="text-sm text-blue-600 hover:underline block py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
