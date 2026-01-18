'use client';

import { useState } from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';

export function ModernHeader({
  activeFilter = 'all',
  onFilterChange,
  user,
  onSignOut
}: {
  activeFilter?: 'all' | 'active' | 'completed';
  onFilterChange?: (filter: 'all' | 'active' | 'completed') => void;
  user?: { email: string } | null;
  onSignOut?: () => void;
}) {
  const [darkMode, setDarkMode] = useState(false);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, you might persist this preference
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 backdrop-blur-sm bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Tasks
            </h1>

            <nav className="hidden md:flex space-x-1">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => onFilterChange?.(filter.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeFilter === filter.id
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                  {user.email}
                </span>
                <button
                  onClick={onSignOut}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile filter tabs */}
        <div className="md:hidden flex space-x-1 pb-4 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange?.(filter.id as any)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeFilter === filter.id
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}