import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 히어로 섹션 */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full border border-blue-200/50">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              We&apos;re Here to Help
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent">
            Contact Us
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Have questions about Korean name generation? Need technical support?
            We&apos;d love to hear from you and help you on your Korean name
            journey.
          </p>
        </div>

        {/* 연락 방법 섹션 */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* 이메일 연락 */}
          <Card className="relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-blue-200/50 hover:border-blue-300/50 transition-all duration-300 shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Email Support
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Get personalized help with any questions or technical issues
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Perfect for:
                </h3>
                <ul className="space-y-2">
                  {[
                    "Technical support & bug reports",
                    "Korean name generation questions",
                    "Premium feature inquiries",
                    "Cultural pronunciation guidance",
                    "Partnership & collaboration",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 text-xs">
                          ✓
                        </span>
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                asChild
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <a href="mailto:gguggulab@gmail.com">
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Send Email
                </a>
              </Button>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200/50 space-y-2">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 text-center">
                  📧 gguggulab@gmail.com
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 소셜 미디어 */}
          <Card className="relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-purple-200/50 hover:border-purple-300/50 transition-all duration-300 shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Social Media
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Follow us for updates, tips, and Korean name inspiration
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* X (Twitter) */}
                <a
                  href="https://x.com/ggugguday"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 border border-gray-200/50"
                >
                  <div className="bg-gray-900 p-3 rounded-xl group-hover:bg-gray-800 transition-colors mr-4 shadow-md">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      X (Twitter)
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      @ggugguday • Updates & announcements
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@nametokorean"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 border border-gray-200/50"
                >
                  <div className="bg-gray-900 p-3 rounded-xl group-hover:bg-gray-800 transition-colors mr-4 shadow-md">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      TikTok
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      @nametokorean • Fun Korean name content
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200/50">
                <p className="text-sm text-purple-800 dark:text-purple-200 text-center">
                  🚀 Follow for Korean culture tips and name inspiration!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ 섹션 */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Quick answers to common questions about our Korean name generation
              service
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                question: "How are Korean names generated?",
                answer:
                  "Using advanced AI technology, we analyze the meaning and pronunciation of your input name, then recommend the most appropriate Korean name considering Korean culture and linguistic characteristics.",
                icon: "🤖",
              },
              {
                question: "Is refund available after payment?",
                answer:
                  "If you experience any issues with our service, please contact us within 7 days and we will process a refund. For more details, please refer to our Terms & Policies.",
                icon: "💰",
                hasLink: true,
              },
              {
                question: "How accurate are the generated Korean names?",
                answer:
                  "We use AI models reviewed by Korean linguistics experts to ensure high accuracy. However, cultural nuances and personal preferences may vary, so please use them for reference.",
                icon: "🎯",
              },
              {
                question: "What's the difference between Free and Premium?",
                answer:
                  "Free provides basic Korean name generation with cultural meanings. Premium adds deep cultural analysis, audio pronunciation, life values interpretation, and enhanced shareable content.",
                icon: "✨",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200/50"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl shadow-md flex-shrink-0">
                    {faq.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                      {faq.hasLink && (
                        <>
                          {" "}
                          <Link
                            href="/terms"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium"
                          >
                            Terms & Policies
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="text-center space-y-8 mt-16 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-blue-900/20 rounded-3xl p-12 border border-blue-200/50">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Still Have Questions?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Don&apos;t hesitate to reach out. We&apos;re here to help you
            discover your perfect Korean name!
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-lg mx-auto">
            <Button
              asChild
              variant="outline"
              className="flex-1 py-6 text-lg font-semibold border-2 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              <a href="mailto:gguggulab@gmail.com">📧 Send Email</a>
            </Button>
            <Button
              asChild
              className="flex-1 py-6 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <a
                href="https://x.com/ggugguday"
                target="_blank"
                rel="noopener noreferrer"
              >
                🐦 Follow on X
              </a>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
