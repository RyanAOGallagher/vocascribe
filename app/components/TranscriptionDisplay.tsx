import React, { useState, useEffect } from 'react';

interface TranscriptionDisplayProps {
  transcription: string;
  keySentences?: string;
  title?: string;
  date?: string;
  isLoading?: boolean;
}

interface VocabularyItem {
  word: string;
  count: number;
  type: string;
}

interface AnalysisResult {
  newVocabulary: VocabularyItem[];
  knownVocabulary: VocabularyItem[];
  summary: {
    totalNewWords: number;
    totalKnownWords: number;
    totalUniqueWords: number;
  };
  rawText?: string; // Added for fallback
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ 
  transcription, 
  keySentences,
  title,
  date,
  isLoading = false 
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<AnalysisResult | null>(null);
  const [showFullTranscription, setShowFullTranscription] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title || '');
  const [originalTitle, setOriginalTitle] = useState(title || '');

  useEffect(() => {
    setEditedTitle(title || '');
    setOriginalTitle(title || '');
  }, [title]);

  const handleExtract = async () => {
    if (!transcription) return;
    
    setIsExtracting(true);
    setExtractionResult(null);
    
    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcription }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setExtractionResult(data.analysis);
      } else {
        console.error('Extraction failed:', data.error);
        // Fallback to raw text if structured data fails
        setExtractionResult({
          newVocabulary: [],
          knownVocabulary: [],
          summary: { totalNewWords: 0, totalKnownWords: 0, totalUniqueWords: 0 },
          rawText: data.rawText || 'Failed to extract analysis. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error during extraction:', error);
      setExtractionResult({
        newVocabulary: [],
        knownVocabulary: [],
        summary: { totalNewWords: 0, totalKnownWords: 0, totalUniqueWords: 0 },
        rawText: 'An error occurred during extraction. Please try again.'
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setEditedTitle(title || '');
  };

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    setOriginalTitle(editedTitle);
    // Here you could also save to backend if needed
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setEditedTitle(originalTitle);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  if (!transcription && !isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg font-medium">No transcription yet</p>
          <p className="text-sm">Record audio to see analysis here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col">
      <div className="flex flex-col space-y-6 pb-8">
        {isLoading && (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-900 font-medium">Processing transcription...</span>
            </div>
          </div>
        )}
        
        {/* Title Section */}
        {title && !isLoading && (
          <div className="space-y-4 mb-8 text-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="flex-1 text-center">
                {isEditingTitle ? (
                  <div className="flex flex-col items-center space-y-2">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onKeyDown={handleTitleKeyDown}
                      className="text-gray-900 text-3xl font-bold leading-tight text-center bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 px-2 py-1"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleTitleSave}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleTitleCancel}
                        className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="cursor-pointer hover:bg-gray-50 rounded-lg px-4 py-2 transition-colors relative"
                    onClick={handleTitleEdit}
                    title="Click to edit title"
                  >
                    <p className="text-gray-900 text-3xl font-bold leading-tight">
                      {originalTitle}
                    </p>
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-blue-500 text-white rounded-full p-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {date && (
              <div className="flex flex-col items-center space-y-1">
                <div className="flex-1 text-center">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {(() => {
                      const dateObj = new Date(date);
                      return dateObj.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                    })()}
                  </p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {(() => {
                      const dateObj = new Date(date);
                      return dateObj.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      });
                    })()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transcription Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Transcription</h3>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-between w-full">
                <span className="text-base font-semibold text-gray-900">Content</span>
                {transcription && !isLoading && (
                  <button
                    onClick={() => setShowFullTranscription(!showFullTranscription)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    {showFullTranscription ? 'Show Less' : 'Show Full'}
                  </button>
                )}
              </div>
            </div>
            <div className={`overflow-y-auto ${showFullTranscription ? '' : 'max-h-[200px]'}`}>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                </div>
              ) : (
                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap text-sm">
                  {transcription}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Key Sentences */}
        {keySentences && !isLoading && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Key Expressions & Translations</h3>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold text-gray-900">Summary</span>
              
              </div>
              <div className="space-y-4">
                {(() => {
                  const pairs = keySentences.split('\n\n').filter(pair => pair.trim());
                  return pairs.map((pair, index) => {
                    const lines = pair.split('\n').filter(line => line.trim());
                    const original = lines.find(line => line.startsWith('Original:'))?.replace('Original:', '').trim();
                    const translation = lines.find(line => line.startsWith('Translation:'))?.replace('Translation:', '').trim();
                    
                    if (!original || !translation) return null;
                    
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3 mb-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-gray-900 text-sm font-medium mb-1">Original:</p>
                            <p className="text-gray-900 text-sm leading-relaxed">
                              {original}
                            </p>
                          </div>
                        </div>
                        <div className="ml-9">
                          <p className="text-gray-600 text-sm font-medium mb-1">Translation:</p>
                          <p className="text-gray-700 text-sm leading-relaxed italic">
                            {translation}
                          </p>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}


        
        {/* Analysis Pipelines */}
        {transcription && !isLoading && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Analysis</h3>
            
            <div className="space-y-4">
              {/* Extract */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">Extract</h4>
                    <p className="text-sm text-gray-600 mt-1">Extract new vocabulary and grammar patterns</p>
                  </div>
                  <button 
                    onClick={handleExtract}
                    disabled={isExtracting}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded text-sm font-medium transition-colors"
                  >
                    {isExtracting ? 'Extracting...' : 'Extract'}
                  </button>
                </div>
                
                {/* Extraction Result */}
                {extractionResult && (
                  <div className="mt-4 space-y-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">{extractionResult.summary.totalNewWords}</div>
                        <div className="text-xs text-blue-600 font-medium">New Words</div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">{extractionResult.summary.totalKnownWords}</div>
                        <div className="text-xs text-green-600 font-medium">Known Words</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-purple-600">{extractionResult.summary.totalUniqueWords}</div>
                        <div className="text-xs text-purple-600 font-medium">Total Unique</div>
                      </div>
                    </div>

                    {/* New Vocabulary */}
                    {extractionResult.newVocabulary && extractionResult.newVocabulary.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h6 className="font-semibold text-red-800 mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          New Vocabulary ({extractionResult.newVocabulary.length})
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {extractionResult.newVocabulary.map((item, index) => (
                            <div key={index} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-red-100">
                              <div className="flex items-center space-x-2">
                                <span className="text-red-700 font-medium">{item.word}</span>
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full capitalize">
                                  {item.type}
                                </span>
                              </div>
                              <span className="text-sm text-red-600 font-semibold">{item.count}x</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Known Vocabulary */}
                    {extractionResult.knownVocabulary && extractionResult.knownVocabulary.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h6 className="font-semibold text-green-800 mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Known Vocabulary ({extractionResult.knownVocabulary.length})
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {extractionResult.knownVocabulary.map((item, index) => (
                            <div key={index} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-green-100">
                              <div className="flex items-center space-x-2">
                                <span className="text-green-700 font-medium">{item.word}</span>
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full capitalize">
                                  {item.type}
                                </span>
                              </div>
                              <span className="text-sm text-green-600 font-semibold">{item.count}x</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fallback for raw text */}
                    {extractionResult.rawText && !extractionResult.newVocabulary?.length && !extractionResult.knownVocabulary?.length && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h6 className="font-medium text-gray-900 mb-3">Raw Analysis:</h6>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto border border-gray-200 rounded p-3">
                          {extractionResult.rawText}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Compare */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">Compare</h4>
                    <p className="text-sm text-gray-600 mt-1">Compare with existing knowledge store</p>
                  </div>
                  <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition-colors">
                    Compare
                  </button>
                </div>
              </div>

              {/* Append */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">Append</h4>
                    <p className="text-sm text-gray-600 mt-1">Add new items to knowledge store</p>
                  </div>
                  <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm font-medium transition-colors">
                    Append
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        {transcription && !isLoading && (
          <div className="flex justify-center space-x-4 pt-6">
            <button className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded text-sm font-medium transition-colors">
              Copy
            </button>
            <button className="px-6 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded text-sm font-medium transition-colors">
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionDisplay; 