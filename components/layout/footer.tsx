import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-3 md:py-4 mt-auto">
      <div className="container mx-auto px-4 text-center text-xs md:text-sm text-gray-600">
        <p>
          &copy; {new Date().getFullYear()} NameToKorean. All rights reserved.
        </p>
        <div className="mt-2 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex space-x-4">
            <Link href="/pricing" className="hover:underline">
              Pricing
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms & Policies
            </Link>
            <a
              href="mailto:gguggulab@gmail.com"
              className="hover:underline"
              title="Contact us"
            >
              <svg
                className="w-4 h-4 inline-block"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </a>
          </div>
          <div className="flex space-x-3 items-center">
            <a
              href="https://x.com/ggugguday"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800 transition-colors"
              title="Follow us on X (Twitter)"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@nametokorean"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800 transition-colors"
              title="Follow us on TikTok"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
