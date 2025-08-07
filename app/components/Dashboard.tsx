import React, { useState, useEffect } from 'react';
import { getVocabularyItems } from '../database/vocabulary';
import { VocabularyItem } from '../database/vocabulary';

type PageType = 'home' | 'recorder' | 'transcription' | 'history' | 'knowledge-store' | 'learn' | 'flash-card-selection' | 'flash-cards' | 'settings' | 'help';

interface DashboardProps {
  onNavigate: (page: PageType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [vocabularyCount, setVocabularyCount] = useState(0);
  const [recentWords, setRecentWords] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const vocabularyItems = await getVocabularyItems();
        setVocabularyCount(vocabularyItems.length);
        
        // Get the 5 most recent words (assuming they're ordered by first_seen)
        const recent = vocabularyItems
          .sort((a, b) => new Date(b.first_seen).getTime() - new Date(a.first_seen).getTime())
          .slice(0, 5);
        setRecentWords(recent);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Add Meeting',
      description: 'Record or upload a meeting',
      icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => onNavigate('recorder')
    },
    {
      title: 'View History',
      description: 'Browse past transcriptions',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => onNavigate('history')
    },
    {
      title: 'Vocabulary',
      description: 'Manage your word collection',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => onNavigate('knowledge-store')
    },
    {
      title: 'Start Learning',
      description: 'Practice with flash cards',
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => onNavigate('learn')
    }
  ];

  const stats = [
    {
      title: 'Total Words',
      value: vocabularyCount,
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
    },
    {
      title: 'Sessions',
      value: '12',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
    },
    {
      title: 'Learning Streak',
      value: '5 days',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
    },
    {
      title: 'Accuracy',
      value: '94%',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ready to continue your language learning journey?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-left hover:shadow-md transition-shadow group"
            >
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{action.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Words */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Words</h3>
            <button 
              onClick={() => onNavigate('knowledge-store')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
            >
              View all
            </button>
          </div>
          {recentWords.length > 0 ? (
            <div className="space-y-3">
              {recentWords.map((word, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{word.word}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{word.translation}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(word.first_seen).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {word.occurrences} times
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">No words added yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Record or upload a meeting to build your vocabulary</p>
            </div>
          )}
        </div>

        {/* Learning Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Progress</h3>
            <button 
              onClick={() => onNavigate('learn')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
            >
              Continue
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Flash Cards</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">8/15</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '53%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quiz Score</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">85%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sentences</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">6/10</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Great progress!</p>
                <p className="text-xs text-blue-700 dark:text-blue-200">You're on a 5-day learning streak</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 