"use client";

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(true); // Default to dark mode

  useEffect(() => {
    // Set dark mode as default
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Default to dark mode if no saved preference
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      // Default to dark mode
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Sun className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-yellow-500'}`} />
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={isDark}
          onChange={toggleDarkMode}
        />
        <span className="toggle-slider"></span>
      </label>
      <Moon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-gray-400'}`} />
    </div>
  );
};

export default DarkModeToggle;