'use client';

import { PlusIcon } from 'lucide-react';

export function ModernFab({
  onClick,
  disabled = false
}: {
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/30 ${
        disabled
          ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
          : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105 active:scale-95'
      }`}
      aria-label="Add new task"
    >
      <PlusIcon className="w-6 h-6 text-white" />
    </button>
  );
}