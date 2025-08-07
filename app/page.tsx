'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import AudioRecorder from './components/AudioRecorder';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import History from './components/History';
import Settings from './components/Settings';
import Vocabulary from './components/Vocabulary';
import Dashboard from './components/Dashboard';
import MockMeetings from './components/MockMeetings';
import Auth from './components/Auth';

import LandingPage from './components/LandingPage';

type PageType = 'home' | 'recorder' | 'transcription' | 'history' | 'knowledge-store' | 'learn' | 'flash-card-selection' | 'flash-cards' | 'mock-meetings' | 'settings' | 'help';

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();

  const [transcription, setTranscription] = useState('');
  const [keySentences, setKeySentences] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [previousPage, setPreviousPage] = useState<PageType>('home');
  const [showFlashCardSelection, setShowFlashCardSelection] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMeetings, setSelectedMeetings] = useState({
    all: true,
    teamStandup: true,
    clientPresentation: true,
    planningSession: true
  });

  // Flash card state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // Mock flash card data
  const flashCards = [
    { word: 'Synergy', translation: '시너지', example: 'The team achieved great synergy in their collaboration.' },
    { word: 'Leverage', translation: '활용하다', example: 'We can leverage our existing resources.' },
    { word: 'Scalable', translation: '확장 가능한', example: 'This solution is highly scalable.' },
    { word: 'Iterate', translation: '반복하다', example: 'We need to iterate on this design.' },
    { word: 'Optimize', translation: '최적화하다', example: 'Let\'s optimize the process.' },
    { word: 'Deploy', translation: '배포하다', example: 'We will deploy the new version.' },
    { word: 'Integrate', translation: '통합하다', example: 'We need to integrate these systems.' },
    { word: 'Validate', translation: '검증하다', example: 'Please validate the data.' },
    { word: 'Streamline', translation: '간소화하다', example: 'This will streamline our workflow.' },
    { word: 'Facilitate', translation: '촉진하다', example: 'This tool will facilitate communication.' },
  ];

  // Initialize dark mode on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);



  const handleRecordingComplete = (audioBlob: Blob) => {
    console.log('Recording completed:', audioBlob);
    // Here you would typically send the audio blob to a transcription service
  };

  const handleTranscription = (text: string, keySentences?: string, title?: string, date?: string) => {
    setTranscription(text);
    setKeySentences(keySentences || '');
    setTitle(title || '');
    setDate(date || '');
    setIsProcessing(false);
    setPreviousPage('recorder');
    setCurrentPage('transcription');
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
  };

  const handleBackToRecorder = () => {
    setCurrentPage(previousPage);
    setTranscription('');
    setKeySentences('');
    setTitle('');
    setDate('');
    setIsProcessing(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleMenuNavigation = (page: PageType) => {
    setCurrentPage(page);
    closeMenu();
  };

  const handleThemeChange = (isDark: boolean) => {
    setIsDarkMode(isDark);
  };

  const handleViewHistoryTranscription = (item: any) => {
    setTranscription(item.transcription);
    setKeySentences(item.key_sentences || '');
    setTitle(item.title);
    setDate(item.created_at);
    setIsProcessing(false);
    setPreviousPage('history');
    setCurrentPage('transcription');
  };

  const handleFlashCardStart = () => {
    setCurrentPage('flash-card-selection');
  };

  const handleStartFlashCards = () => {
    setCurrentPage('flash-cards');
    setCurrentCardIndex(0);
    setIsAnswerRevealed(false);
  };

  const handleRevealAnswer = () => {
    setIsAnswerRevealed(true);
  };

  const handleNextCard = () => {
    if (currentCardIndex < flashCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsAnswerRevealed(false);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsAnswerRevealed(false);
    }
  };

  const handleCardClick = () => {
    setIsAnswerRevealed(!isAnswerRevealed);
  };

  const handleBackToLearn = () => {
    setCurrentPage('learn');
  };

  const handleMockMeetingsStart = () => {
    setCurrentPage('mock-meetings');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isDropdownOpen && !target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleAllMeetingsChange = (checked: boolean) => {
    setSelectedMeetings({
      all: checked,
      teamStandup: checked,
      clientPresentation: checked,
      planningSession: checked
    });
  };

  const handleIndividualMeetingChange = (meetingKey: string, checked: boolean) => {
    const newSelection = {
      ...selectedMeetings,
      [meetingKey]: checked
    };
    
    // If any individual meeting is unchecked, uncheck "all"
    if (!checked) {
      newSelection.all = false;
    }
    
    // If all individual meetings are checked, check "all"
    const allIndividualChecked = newSelection.teamStandup && 
                                newSelection.clientPresentation && newSelection.planningSession;
    if (allIndividualChecked) {
      newSelection.all = true;
    }
    
    setSelectedMeetings(newSelection);
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <button 
                onClick={toggleMenu}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">DASHBOARD</h1>
              
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <Dashboard onNavigate={handleMenuNavigation} />
            </div>
          </div>
        );

      case 'recorder':
        return (
          <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <button 
                onClick={toggleMenu}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">ADD MEETING</h1>
              
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-start items-center px-6 pt-8">
              <AudioRecorder 
                onRecordingComplete={handleRecordingComplete}
                onTranscription={handleTranscription}
                onProcessingStart={handleProcessingStart}
              />
            </div>
          </div>
        );

      case 'transcription':
        return (
          <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={handleBackToRecorder}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">ANALYSIS</h1>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-6">
                <TranscriptionDisplay 
                  transcription={transcription}
                  keySentences={keySentences}
                  title={title}
                  date={date}
                  isLoading={isProcessing}
                />
              </div>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <button 
                onClick={toggleMenu}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">HISTORY</h1>
              
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-6">
                <History onViewTranscription={handleViewHistoryTranscription} />
              </div>
            </div>
          </div>
        );

      case 'knowledge-store':
        return (
          <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <button 
                onClick={toggleMenu}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">KNOWLEDGE STORE</h1>
              
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <Vocabulary />
            </div>
          </div>
        );

      case 'learn':
        return (
          <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <button 
                onClick={toggleMenu}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">LEARN</h1>
              
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Learning Center
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose your learning method and improve your vocabulary skills
                  </p>
                </div>

                {/* Learning Sections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Flash Cards */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div className="p-6">
                      <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Flash Cards
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Review vocabulary with interactive flash cards. Test your memory and improve retention.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          15 words available
                        </span>
                        <button 
                          onClick={handleFlashCardStart}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Start
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quiz */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div className="p-6">
                      <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Quiz
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Challenge yourself with multiple choice questions. Test your understanding of vocabulary.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          3 quiz types
                        </span>
                        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                          Start
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mock Meetings */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div className="p-6">
                      <div className="flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-4">
                        <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Mock Meetings
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Practice vocabulary in realistic meeting scenarios. Role-play different meeting types and contexts.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          3 scenarios
                        </span>
                        <button 
                          onClick={handleMockMeetingsStart}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Start
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sentence Making */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div className="p-6">
                      <div className="flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
                        <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Sentence Making
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Practice using vocabulary in context. Create sentences and improve your writing skills.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          10 exercises
                        </span>
                        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                          Start
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Your Progress
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">Flash Cards</h4>
                        <span className="text-2xl font-bold">8/15</span>
                      </div>
                      <div className="w-full bg-blue-400 rounded-full h-2 mb-2">
                        <div className="bg-white rounded-full h-2" style={{ width: '53%' }}></div>
                      </div>
                      <p className="text-blue-100 text-sm">53% completed</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">Quiz</h4>
                        <span className="text-2xl font-bold">85%</span>
                      </div>
                      <div className="w-full bg-green-400 rounded-full h-2 mb-2">
                        <div className="bg-white rounded-full h-2" style={{ width: '85%' }}></div>
                      </div>
                      <p className="text-green-100 text-sm">Average score</p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">Sentences</h4>
                        <span className="text-2xl font-bold">6/10</span>
                      </div>
                      <div className="w-full bg-purple-400 rounded-full h-2 mb-2">
                        <div className="bg-white rounded-full h-2" style={{ width: '60%' }}></div>
                      </div>
                      <p className="text-purple-100 text-sm">60% completed</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Recent Activity
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white font-medium">Completed Flash Card Set</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">5 minutes ago</p>
                        </div>
                        <span className="text-green-600 dark:text-green-400 font-semibold">+10 points</span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white font-medium">Quiz Score: 90%</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">2 hours ago</p>
                        </div>
                        <span className="text-green-600 dark:text-green-400 font-semibold">+25 points</span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white font-medium">Completed Sentence Exercise</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">1 day ago</p>
                        </div>
                        <span className="text-green-600 dark:text-green-400 font-semibold">+15 points</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'flash-card-selection':
        return (
          <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={handleBackToLearn}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">FLASH CARDS</h1>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Flash Card Settings
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure your flash card session
                  </p>
                </div>

                {/* Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Flash Card Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Number of Cards
                      </label>
                      <select defaultValue="10" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="5">5 cards</option>
                        <option value="10">10 cards</option>
                        <option value="15">15 cards</option>
                        <option value="all">All available</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Meeting Selection
                      </label>
                      
                      {/* Multiselect Dropdown */}
                      <div className="relative dropdown-container">
                        <button
                          type="button"
                          onClick={toggleDropdown}
                          className="w-full px-3 py-2 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900 dark:text-white">All Meetings (15 words)</span>
                            <svg className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        
                        {/* Dropdown Content */}
                        {isDropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                            <div className="p-2">
                              {/* All Meetings Option */}
                              <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedMeetings.all}
                                  onChange={(e) => handleAllMeetingsChange(e.target.checked)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900 dark:text-white">All Meetings</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">15 words</span>
                                  </div>
                                </div>
                              </label>
                              
                              {/* Individual Meetings */}
                              <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-2">
                                  Individual Meetings
                                </div>
                                
                                <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedMeetings.teamStandup}
                                    onChange={(e) => handleIndividualMeetingChange('teamStandup', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-900 dark:text-white">Team Standup - Jan 15</span>
                                      <span className="text-sm text-gray-500 dark:text-gray-400">5 words</span>
                                    </div>
                                  </div>
                                </label>
                                
                                <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedMeetings.clientPresentation}
                                    onChange={(e) => handleIndividualMeetingChange('clientPresentation', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-900 dark:text-white">Client Presentation - Jan 14</span>
                                      <span className="text-sm text-gray-500 dark:text-gray-400">7 words</span>
                                    </div>
                                  </div>
                                </label>
                                
                                <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedMeetings.planningSession}
                                    onChange={(e) => handleIndividualMeetingChange('planningSession', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-900 dark:text-white">Planning Session - Jan 12</span>
                                      <span className="text-sm text-gray-500 dark:text-gray-400">3 words</span>
                                    </div>
                                  </div>
                                </label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleBackToLearn}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleStartFlashCards}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Start Flash Cards
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'flash-cards':
        return (
          <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={handleBackToLearn}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">FLASH CARDS</h1>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-md">
                {/* Flash Card */}
                <div 
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8 cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={handleCardClick}
                >
                  <div className="text-center">
                    {!isAnswerRevealed ? (
                      <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                        {flashCards[currentCardIndex].word}
                      </h2>
                    ) : (
                      <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                        {flashCards[currentCardIndex].translation}
                      </h2>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(((currentCardIndex + 1) / flashCards.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${((currentCardIndex + 1) / flashCards.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button 
                    onClick={handlePreviousCard}
                    disabled={currentCardIndex === 0}
                    className={`flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium transition-colors ${
                      currentCardIndex === 0 
                        ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 cursor-not-allowed' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      <span>Previous</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={handleNextCard}
                    disabled={currentCardIndex === flashCards.length - 1}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                      currentCardIndex === flashCards.length - 1
                        ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>{currentCardIndex === flashCards.length - 1 ? 'Finish' : 'Next'}</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'mock-meetings':
        return (
          <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={handleBackToLearn}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">MOCK MEETINGS</h1>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Main Content */}
            <MockMeetings onBack={handleBackToLearn} />
          </div>
        );

      case 'settings':
        return (
          <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <button 
                onClick={toggleMenu}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">SETTINGS</h1>
              
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-6">
                <Settings onThemeChange={handleThemeChange} />
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <button 
                onClick={toggleMenu}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">HELP</h1>
              
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="text-center">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Help & Support</h3>
                <p className="text-gray-600 dark:text-gray-400">Coming soon...</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {renderPageContent()}

      {/* Side Menu */}
      <SideMenu isOpen={isMenuOpen} onClose={closeMenu} onNavigate={handleMenuNavigation} />


    </div>
  );
}
