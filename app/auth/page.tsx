import AuthForm from "@/components/auth/auth-form";

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 히어로 섹션 */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full border border-blue-200/50">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Join Our Community
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent">
            Welcome to
            <br />
            Korean Name Generator
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Create your account to unlock personalized Korean name generation
            and save your favorite results
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Instant access</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Save your names</span>
            </div>
          </div>
        </div>

        {/* 로그인 폼 섹션 */}
        <div className="flex justify-center">
          <AuthForm />
        </div>

        {/* 서비스 혜택 섹션 */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-white text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Personalized Names
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get Korean names that truly reflect your identity and cultural
              preferences
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-white text-2xl">💾</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Save Your Results
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Keep track of your favorite Korean names and their meanings
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-white text-2xl">🚀</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Premium Features
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Unlock advanced cultural analysis and pronunciation guides
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
