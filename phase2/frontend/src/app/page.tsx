/**
 * Home Page for Phase II Full-Stack Multi-User Web Application.
 *
 * This is the root page that will be accessible at /
 */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Tasks
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-md mx-auto">
            Streamline your productivity with our secure and intuitive task management platform
          </p>
        </div>

        <div className="space-y-4">
          <a
            href="./signin"
            className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Sign In
          </a>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-purple-50 via-white to-blue-50 text-gray-500 dark:text-gray-400">
                or
              </span>
            </div>
          </div>

          <a
            href="/signup"
            className="w-full flex items-center justify-center px-6 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium text-lg shadow-sm hover:shadow-md"
          >
            Create Account
          </a>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          <p>Secure • Efficient • Intuitive</p>
        </div>
      </div>
    </div>
  );
}