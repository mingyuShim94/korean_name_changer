import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            If you have any questions or inquiries, please feel free to contact
            us anytime. We&apos;re here to help and communicate with you in
            various ways.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          {/* Email Contact */}
          <div className="bg-gray-50 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Email Contact
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              For general inquiries or technical support, please contact us via
              email.
            </p>
            <a
              href="mailto:gguggulab@gmail.com"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              gguggulab@gmail.com
            </a>
          </div>
        </div>

        {/* Social Media */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Connect with us on Social Media
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Follow us for the latest updates and interesting content about
            Korean names.
          </p>

          <div className="flex justify-center space-x-6">
            {/* X (Twitter) */}
            <a
              href="https://x.com/ggugguday"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="bg-gray-900 p-3 rounded-full group-hover:bg-gray-800 transition-colors mb-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                X (Twitter)
              </span>
              <span className="text-xs text-gray-500">@ggugguday</span>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@nametokorean"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="bg-gray-900 p-3 rounded-full group-hover:bg-gray-800 transition-colors mb-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                TikTok
              </span>
              <span className="text-xs text-gray-500">@nametokorean</span>
            </a>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                How are Korean names generated?
              </h3>
              <p className="text-gray-600">
                Using AI technology, we analyze the meaning and pronunciation of
                your input name, then recommend the most appropriate Korean name
                considering Korean culture and linguistic characteristics.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Is refund available after payment?
              </h3>
              <p className="text-gray-600">
                If you experience any issues with our service, please contact us
                within 7 days and we will process a refund. For more details,
                please refer to our{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms & Policies
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                How accurate are the generated Korean names?
              </h3>
              <p className="text-gray-600">
                We use AI models reviewed by Korean linguistics experts to
                ensure high accuracy. However, cultural nuances and personal
                preferences may vary, so please use them for reference.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
