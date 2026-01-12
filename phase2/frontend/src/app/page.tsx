/**
 * Home Page for Phase II Full-Stack Multi-User Web Application.
 *
 * This is the root page that will be accessible at /
 */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Todo App
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage your tasks efficiently with our secure platform
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <a
            href="/signin"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg"
          >
            Sign In
          </a>

          <a
            href="/signup"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-lg"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}