'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarIcon, CheckCircleIcon, ClockIcon, PlusCircleIcon, UserIcon, XIcon, Bot } from 'lucide-react';

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const [currentDateTime, setCurrentDateTime] = useState({
    date: 'Loading...',
    time: 'Loading...'
  });

  // Update date and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Format date as "Month Day, Year" (e.g., "January 28, 2026")
      const dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      const formattedDate = now.toLocaleDateString('en-US', dateOptions);

      // Format time as "HH:MM AM/PM" (e.g., "2:30 PM")
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      const formattedTime = now.toLocaleTimeString('en-US', timeOptions);

      setCurrentDateTime({
        date: formattedDate,
        time: formattedTime
      });
    };

    // Update immediately
    updateDateTime();

    // Update every minute
    const interval = setInterval(updateDateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: '/dashboard', icon: CheckCircleIcon, label: 'All Tasks' },
    { href: '/dashboard', icon: ClockIcon, label: 'Pending', param: 'active' },
    { href: '/dashboard', icon: CheckCircleIcon, label: 'Completed', param: 'completed' },
    { href: '/dashboard', icon: PlusCircleIcon, label: 'Add Task', action: () => {
      // Trigger adding a new task
      const event = new CustomEvent('addTaskClick');
      window.dispatchEvent(event);
    }},
    { href: '/dashboard', icon: Bot, label: 'AI Assistant', action: () => {
      // Scroll to the chatbot section
      const chatbotSection = document.querySelector('#chatbot-section');
      if (chatbotSection) {
        chatbotSection.scrollIntoView({ behavior: 'smooth' });
      }
    }},
    { href: '/profile', icon: UserIcon, label: 'Profile' },
  ];

  // Close sidebar when route changes
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:w-64 md:z-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-purple-600" />
              Tasks
            </h2>
            <button
              onClick={onClose}
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href &&
                                (!item.param || new URLSearchParams(window.location.search).get('filter') === item.param);

                return (
                  <li key={index}>
                    {item.action ? (
                      <button
                        onClick={item.action}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    ) : (
                      <Link
                        href={`${item.href}${item.param ? `?filter=${item.param}` : ''}`}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Current Date/Time */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="font-medium">{currentDateTime.date}</div>
              <div>{currentDateTime.time}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}