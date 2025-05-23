import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-3 md:py-4 mt-auto">
      <div className="container mx-auto px-4 text-center text-xs md:text-sm text-gray-600">
        <p>
          &copy; {new Date().getFullYear()} MyKoreanName. All rights reserved.
        </p>
        <div className="mt-2 flex justify-center space-x-4">
          <Link href="/pricing" className="hover:underline">
            Pricing
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms & Policies
          </Link>
        </div>
      </div>
    </footer>
  );
}
