'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SettingsProps {
  onThemeChange?: (isDark: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ onThemeChange }) => {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldBeDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    console.log('Initial theme setup:', { savedTheme, prefersDark, shouldBeDark });
  }, []);

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode;
    console.log('Toggling theme from', isDarkMode, 'to', newTheme);
    
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log('Added dark class to document');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      console.log('Removed dark class from document');
    }
    
    // Notify parent component
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
    
    // Force a re-render by updating state
    setTimeout(() => {
      setIsDarkMode(newTheme);
    }, 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Customize your VocaScribe experience</p>
      </div>

      {/* Debug Info */}
      <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
        <p className="text-sm">
          <strong>Debug Info:</strong> Dark mode is {isDarkMode ? 'ON' : 'OFF'}. 
          Document has dark class: {document.documentElement.classList.contains('dark') ? 'YES' : 'NO'}
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
          
          <div className="space-y-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Switch between light and dark themes
                </p>
              </div>
              <button
                onClick={handleThemeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={isDarkMode}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Theme Preview */}
            <div className="mt-4 p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-500 rounded w-1/2"></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Preview of {isDarkMode ? 'dark' : 'light'} theme
              </p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Preferences</h2>
          
          <div className="space-y-4">
            {/* Auto Save */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Auto Save</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically save transcriptions as you work
                </p>
              </div>
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  autoSave ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={autoSave}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive notifications when transcriptions are ready
                </p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={notifications}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Interface Language</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose your preferred language for the interface
                </p>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Export Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Download all your transcriptions and settings
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Export
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Clear History</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Delete all your transcription history
                </p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Clear All
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Account</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Logout</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sign out of your account
                </p>
              </div>
              <button 
                onClick={async () => {
                  try {
                    await logout();
                  } catch (error) {
                    console.error('Logout failed:', error);
                  }
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h2>
          
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Build:</strong> 2024.01.15</p>
            <p><strong>License:</strong> MIT</p>
            <p className="pt-2">
              VocaScribe helps you transcribe and learn from your voice recordings with AI-powered analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 