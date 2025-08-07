'use client';

import React, { useState, useEffect } from 'react';

interface HistoryItem {
  id: string;
  title: string;
  transcription: string;
  key_sentences?: string;
  created_at: string;
}

interface HistoryProps {
  onViewTranscription?: (item: HistoryItem) => void;
}

const History: React.FC<HistoryProps> = ({ onViewTranscription }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Fetch sessions from API
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/sessions');
        if (response.ok) {
          const data = await response.json();
          setHistoryItems(data.sessions || []);
        } else {
          console.error('Failed to fetch sessions');
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/sessions?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the deleted item from state
        setHistoryItems(prev => prev.filter(item => item.id !== id));
      } else {
        console.error('Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  };

  const confirmDelete = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const handleViewTranscription = (item: HistoryItem) => {
    if (onViewTranscription) {
      onViewTranscription(item);
    }
  };

  const filteredAndSortedItems = historyItems
    .filter(item => {
      return item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.transcription.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">History</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage your past transcriptions</p>
      </div>

      {/* Search and Sort */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search transcriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredAndSortedItems.length} of {historyItems.length} transcriptions
        </p>
      </div>

      {/* History Items */}
      <div className="space-y-4">
        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transcriptions found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria</p>
          </div>
        ) : (
          filteredAndSortedItems.map(item => (
            <div 
              key={item.id} 
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewTranscription(item)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(item.id);
                    }}
                    disabled={deletingId === item.id}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === item.id ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Transcription Preview */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transcription</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                  {item.transcription}
                </p>
              </div>

              {/* Key Sentences Preview */}
              {item.key_sentences && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Expressions</h4>
                  <div className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                    {item.key_sentences.split('\n\n').slice(0, 2).join('\n\n')}
                    {item.key_sentences.split('\n\n').length > 2 && '...'}
                  </div>
                </div>
              )}

              {/* View Full Button */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-600">
                <button 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewTranscription(item);
                  }}
                >
                  View Full Transcription →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Transcription
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this transcription? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deletingId === showDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {deletingId === showDeleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={cancelDelete}
                disabled={deletingId === showDeleteConfirm}
                className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History; 