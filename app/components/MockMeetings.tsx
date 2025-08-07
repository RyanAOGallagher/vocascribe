import React, { useState } from 'react';

interface MockMeeting {
  id: string;
  title: string;
  description: string;
  scenario: string;
  participants: string[];
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  vocabulary: string[];
  transcript: string;
}

const mockMeetings: MockMeeting[] = [
  {
    id: '1',
    title: 'Team Standup Meeting',
    description: 'Daily team synchronization meeting',
    scenario: 'You are leading a daily standup meeting with your development team. Each team member needs to share their progress, blockers, and plans for the day.',
    participants: ['Team Lead (You)', 'Frontend Developer', 'Backend Developer', 'QA Engineer', 'Product Manager'],
    duration: '15 minutes',
    difficulty: 'Beginner',
    vocabulary: ['standup', 'sprint', 'blocker', 'milestone', 'deliverable', 'stakeholder', 'iteration'],
    transcript: `Good morning everyone, let's start our daily standup. Sarah, would you like to go first?

Sarah: Sure! Yesterday I completed the user authentication feature and started working on the dashboard layout. Today I'll finish the dashboard and begin the profile settings page. No blockers.

Mike: I finished the API endpoints for user management and started on the data validation. Today I'll complete the validation and begin the notification system. I might need help with the email service integration.

Lisa: I completed testing the login flow and found a few edge cases. Today I'll test the registration flow and start on the dashboard testing. No blockers.

John: I'm working on the product roadmap for Q2. Today I'll finalize the feature priorities and schedule a stakeholder review meeting.

Great! Any other blockers or questions before we wrap up?`
  },
  {
    id: '2',
    title: 'Client Presentation',
    description: 'Presenting project progress to client',
    scenario: 'You are presenting the current progress of a software project to your client. You need to explain technical concepts in business terms and address their concerns.',
    participants: ['Project Manager (You)', 'Client', 'Technical Lead', 'Business Analyst'],
    duration: '45 minutes',
    difficulty: 'Intermediate',
    vocabulary: ['deliverable', 'milestone', 'scope', 'timeline', 'budget', 'stakeholder', 'requirements', 'prototype'],
    transcript: `Thank you for joining us today. I'd like to present our progress on the e-commerce platform project.

We've completed 60% of the project scope and are currently on track with our timeline. The user authentication system is fully implemented, and we're in the final stages of the product catalog feature.

Our next major milestone is the shopping cart functionality, which we expect to complete by the end of this sprint. The payment integration is scheduled for the following sprint.

We've identified a few scope changes that might impact our timeline. The client has requested additional reporting features that weren't in the original requirements.

Our technical lead will now walk you through the technical architecture and answer any questions about the implementation.

Do you have any concerns about the current progress or timeline?`
  },
  {
    id: '3',
    title: 'Strategic Planning Session',
    description: 'Quarterly business strategy meeting',
    scenario: 'You are facilitating a quarterly strategic planning session with senior management. You need to guide the discussion on business objectives, market analysis, and resource allocation.',
    participants: ['Strategy Director (You)', 'CEO', 'CFO', 'CTO', 'Head of Marketing', 'Head of Sales'],
    duration: '2 hours',
    difficulty: 'Advanced',
    vocabulary: ['strategic', 'objectives', 'key performance indicators', 'market analysis', 'competitive advantage', 'resource allocation', 'stakeholder', 'milestone'],
    transcript: `Welcome everyone to our Q2 strategic planning session. Let's start by reviewing our Q1 performance against our key performance indicators.

Our revenue growth exceeded targets by 15%, but customer acquisition costs were higher than projected. Our market analysis shows increasing competition in the SaaS space.

I'd like to discuss our strategic objectives for Q2. We need to focus on three key areas: market expansion, product innovation, and operational efficiency.

The competitive analysis reveals that our main advantage is our customer service quality and product reliability. However, we need to improve our time-to-market for new features.

Let's discuss resource allocation for these initiatives. The marketing team has proposed a 20% budget increase for digital campaigns, while the product team needs additional developers for the new feature roadmap.

What are your thoughts on these strategic priorities and resource requirements?`
  }
];

interface MockMeetingsProps {
  onBack: () => void;
}

const MockMeetings: React.FC<MockMeetingsProps> = ({ onBack }) => {
  const [selectedMeeting, setSelectedMeeting] = useState<MockMeeting | null>(null);
  const [currentStep, setCurrentStep] = useState<'selection' | 'scenario' | 'transcript' | 'vocabulary'>('selection');
  const [currentVocabularyIndex, setCurrentVocabularyIndex] = useState(0);

  const handleMeetingSelect = (meeting: MockMeeting) => {
    setSelectedMeeting(meeting);
    setCurrentStep('scenario');
  };

  const handleStartExercise = () => {
    setCurrentStep('transcript');
  };

  const handleViewVocabulary = () => {
    setCurrentStep('vocabulary');
    setCurrentVocabularyIndex(0);
  };

  const handleNextVocabulary = () => {
    if (selectedMeeting && currentVocabularyIndex < selectedMeeting.vocabulary.length - 1) {
      setCurrentVocabularyIndex(currentVocabularyIndex + 1);
    }
  };

  const handlePreviousVocabulary = () => {
    if (currentVocabularyIndex > 0) {
      setCurrentVocabularyIndex(currentVocabularyIndex - 1);
    }
  };

  const handleBackToSelection = () => {
    setSelectedMeeting(null);
    setCurrentStep('selection');
  };

  const renderSelection = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mock Meetings Exercise
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Practice vocabulary in realistic meeting scenarios. Choose a meeting type and role-play the conversation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMeetings.map((meeting) => (
          <div 
            key={meeting.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleMeetingSelect(meeting)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  meeting.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  meeting.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {meeting.difficulty}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{meeting.duration}</span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {meeting.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {meeting.description}
              </p>
              
              <div className="space-y-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Participants:</strong> {meeting.participants.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Vocabulary:</strong> {meeting.vocabulary.length} words
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderScenario = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {selectedMeeting?.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Read the scenario and prepare for the meeting
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Scenario</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          {selectedMeeting?.scenario}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Participants</h4>
            <ul className="space-y-1">
              {selectedMeeting?.participants.map((participant, index) => (
                <li key={index} className="text-gray-600 dark:text-gray-400">• {participant}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Meeting Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="text-gray-900 dark:text-white">{selectedMeeting?.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                <span className="text-gray-900 dark:text-white">{selectedMeeting?.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Vocabulary Words:</span>
                <span className="text-gray-900 dark:text-white">{selectedMeeting?.vocabulary.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleBackToSelection}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back to Selection
        </button>
        <button
          onClick={handleStartExercise}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Start Exercise
        </button>
      </div>
    </div>
  );

  const renderTranscript = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Meeting Transcript
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Read through the meeting transcript and identify key vocabulary words
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="prose dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
            {selectedMeeting?.transcript}
          </pre>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setCurrentStep('scenario')}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back to Scenario
        </button>
        <button
          onClick={handleViewVocabulary}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          View Vocabulary
        </button>
      </div>
    </div>
  );

  const renderVocabulary = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Key Vocabulary
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Review the important vocabulary words from this meeting scenario
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6">
        <div className="text-center mb-8">
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {selectedMeeting?.vocabulary[currentVocabularyIndex]}
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Word {currentVocabularyIndex + 1} of {selectedMeeting?.vocabulary.length}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handlePreviousVocabulary}
            disabled={currentVocabularyIndex === 0}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNextVocabulary}
            disabled={selectedMeeting ? currentVocabularyIndex === selectedMeeting.vocabulary.length - 1 : true}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setCurrentStep('transcript')}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back to Transcript
        </button>
        <button
          onClick={handleBackToSelection}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          Try Another Meeting
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      {currentStep === 'selection' && renderSelection()}
      {currentStep === 'scenario' && renderScenario()}
      {currentStep === 'transcript' && renderTranscript()}
      {currentStep === 'vocabulary' && renderVocabulary()}
    </div>
  );
};

export default MockMeetings; 