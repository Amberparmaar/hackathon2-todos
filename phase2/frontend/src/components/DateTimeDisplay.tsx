'use client';

import { useState, useEffect } from 'react';

export function DateTimeDisplay() {
  const [currentDateTime, setCurrentDateTime] = useState({
    date: '',
    time: ''
  });

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

  return (
    <div className="text-center mb-6">
      <div className="text-lg font-semibold text-gray-800 dark:text-white">
        {currentDateTime.date}
      </div>
      <div className="text-gray-600 dark:text-gray-400">
        {currentDateTime.time}
      </div>
    </div>
  );
}