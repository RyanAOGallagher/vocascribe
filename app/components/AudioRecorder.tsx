'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  onTranscription?: (text: string, keySentences?: string, title?: string, date?: string) => void;
  onProcessingStart?: () => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onRecordingComplete,
  onTranscription,
  onProcessingStart
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [currentAudioBlob, setCurrentAudioBlob] = useState<Blob | null>(null);
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);
  const [chunkProgress, setChunkProgress] = useState({ current: 0, total: 0 });
  const [isChunkProcessing, setIsChunkProcessing] = useState(false);
  const [mode, setMode] = useState<'record' | 'upload'>('record');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileDuration, setUploadedFileDuration] = useState<number>(0);
  const [isLoadingDuration, setIsLoadingDuration] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isRecordingRef = useRef<boolean>(false);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Initialize waveform heights
  useEffect(() => {
    const heights = Array.from({ length: 50 }, () => 8); // Higher default for speech
    setWaveformHeights(heights);
  }, []);

  // Cleanup function for audio resources
  const cleanupAudioResources = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Audio visualization function
  const updateWaveform = () => {
    if (!analyserRef.current || !isRecordingRef.current) {
      return;
    }

    // Get frequency data from the analyser
    const frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(frequencyData);
    
    // Calculate volume with speech-optimized amplification
    const volume = frequencyData.reduce((sum, value) => sum + value, 0) / frequencyData.length;
    
    // Apply higher amplification for better speech sensitivity
    const amplifiedVolume = volume * 1.8; // Higher amplification for speech
    
    console.log('Current frame volume:', volume, 'Amplified:', amplifiedVolume);
    
    // Shift all bars left and add new volume to the last bar
    setWaveformHeights(prev => {
      const newHeights = [...prev];
      // Shift all bars one position to the left
      for (let i = 0; i < newHeights.length - 1; i++) {
        newHeights[i] = newHeights[i + 1];
      }
      // Set the last bar to the current frame volume with speech-optimized range
      newHeights[newHeights.length - 1] = Math.max(8, Math.min(100, amplifiedVolume)); 
      return newHeights;
    });
    
    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    console.log('startRecording')
    try {
      // Clean up any existing resources first
      cleanupAudioResources();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000,
          channelCount: 1
        } 
      });
      
      streamRef.current = stream;
      
      // Set up audio context for visualization
      audioContextRef.current = new AudioContext();
      
      // Resume audio context (required for Chrome)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // Create and configure analyzer
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256; // Smaller for more responsive visualization
      analyserRef.current.smoothingTimeConstant = 0.15; // More responsive for speech
      analyserRef.current.minDecibels = -100; // Lower threshold for better speech sensitivity
      analyserRef.current.maxDecibels = -25; // Better range for speech
      
      console.log('Audio context state:', audioContextRef.current.state);
      console.log('Analyser created, fftSize:', analyserRef.current.fftSize);
      console.log('Frequency bin count:', analyserRef.current.frequencyBinCount);
      
      // Create source and connect to analyzer
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      
      console.log('Source connected to analyser');
      console.log('Stream tracks:', stream.getTracks().map(track => ({ kind: track.kind, enabled: track.enabled, muted: track.muted })));
      console.log('Audio context sample rate:', audioContextRef.current.sampleRate);
      
      // Set up MediaRecorder with better format
      let options: MediaRecorderOptions = { 
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      };
      
      // Fallback if webm is not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options = { 
          mimeType: 'audio/webm',
          audioBitsPerSecond: 128000
        };
      }
      
      // Final fallback
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options = {};
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        setCurrentAudioBlob(audioBlob);
        setShowSaveOptions(true);
        onRecordingComplete?.(audioBlob);
        
        // Clean up audio resources
        cleanupAudioResources();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      isRecordingRef.current = true;
      setRecordingTime(0);

      // Start visualization after a short delay to ensure everything is ready
    
        updateWaveform();
      
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
      cleanupAudioResources();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      isRecordingRef.current = false;
      
      // Stop visualization
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Reset waveform to static state
      const staticHeights = Array.from({ length: 50 }, () => 8);
      setWaveformHeights(staticHeights);
    }
  };

  // Helper function to split audio into chunks using Web Audio API
  const splitAudioIntoChunks = async (audioBlob: Blob, chunkDurationMs: number): Promise<Blob[]> => {
    return new Promise((resolve, reject) => {
      console.log('Starting audio chunking process...');
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const fileReader = new FileReader();
      
      fileReader.onload = async (event) => {
        try {
          console.log('File read successfully, decoding audio...');
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          console.log('Audio decoded successfully');
          const chunks: Blob[] = [];
          const sampleRate = audioBuffer.sampleRate;
          const samplesPerChunk = Math.floor((chunkDurationMs / 1000) * sampleRate);
          const totalSamples = audioBuffer.length;
          const numChunks = Math.ceil(totalSamples / samplesPerChunk);
          
          console.log(`Splitting audio: ${totalSamples} samples into ${numChunks} chunks (max ${samplesPerChunk} samples per chunk)`);
          
          for (let i = 0; i < numChunks; i++) {
            console.log(`Processing chunk ${i + 1} of ${numChunks}...`);
            const startSample = i * samplesPerChunk;
            const endSample = Math.min(startSample + samplesPerChunk, totalSamples);
            const chunkLength = endSample - startSample;
            
            console.log(`Chunk ${i + 1}: samples ${startSample} to ${endSample} (length: ${chunkLength}, duration: ${(chunkLength / sampleRate).toFixed(2)}s)`);
            
            // Create a new audio buffer for this chunk
            const chunkBuffer = audioContext.createBuffer(
              audioBuffer.numberOfChannels,
              chunkLength,
              sampleRate
            );
            
            // Copy audio data for each channel
            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
              const channelData = audioBuffer.getChannelData(channel);
              const chunkChannelData = chunkBuffer.getChannelData(channel);
              
              for (let sample = 0; sample < chunkLength; sample++) {
                chunkChannelData[sample] = channelData[startSample + sample];
              }
            }
            
            console.log(`Converting chunk ${i + 1} to blob...`);
            // Convert chunk buffer to blob - use simpler WAV format for reliability
            const chunkBlob = audioBufferToWav(chunkBuffer);
            chunks.push(chunkBlob);
            console.log(`Chunk ${i + 1} completed, size: ${(chunkBlob.size / 1024 / 1024).toFixed(2)}MB`);
          }
          
          console.log('All chunks created successfully');
          audioContext.close();
          resolve(chunks);
        } catch (error) {
          console.error('Error in audio chunking:', error);
          audioContext.close();
          reject(error);
        }
      };
      
      fileReader.onerror = (error) => {
        console.error('FileReader error:', error);
        audioContext.close();
        reject(new Error('Failed to read audio file'));
      };
      
      console.log('Reading file as ArrayBuffer...');
      fileReader.readAsArrayBuffer(audioBlob);
    });
  };

  // Helper function to convert AudioBuffer to WAV format
  const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;
    
    // Create WAV header
    const buffer = new ArrayBuffer(44 + length * numChannels * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numChannels * 2, true);
    
    // Write audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  };

  // Helper function to convert AudioBuffer to Blob
  const audioBufferToBlob = async (audioBuffer: AudioBuffer, mimeType: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        // Check if the original MIME type is supported by MediaRecorder
        const supportedTypes = [
          'audio/webm',
          'audio/webm;codecs=opus',
          'audio/webm;codecs=vorbis',
          'audio/mp4',
          'audio/mp4;codecs=mp4a.40.2',
          'audio/ogg',
          'audio/ogg;codecs=opus',
          'audio/ogg;codecs=vorbis'
        ];
        
        // Use a supported format if the original isn't supported
        const useMimeType = supportedTypes.includes(mimeType) ? mimeType : 'audio/webm;codecs=opus';
        
        // Try MediaRecorder first
        try {
          // Create a MediaRecorder to encode the audio
          const stream = new MediaStream();
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          
          const destination = audioContext.createMediaStreamDestination();
          source.connect(destination);
          stream.addTrack(destination.stream.getAudioTracks()[0]);
          
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: useMimeType
          });
          
          const chunks: Blob[] = [];
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };
          
          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: useMimeType });
            audioContext.close();
            resolve(blob);
          };
          
          mediaRecorder.onerror = (error) => {
            audioContext.close();
            // Fallback to WAV if MediaRecorder fails
            console.log('MediaRecorder failed, falling back to WAV format');
            resolve(audioBufferToWav(audioBuffer));
          };
          
          mediaRecorder.start();
          source.start();
          source.onended = () => {
            mediaRecorder.stop();
          };
        } catch (mediaRecorderError) {
          // Fallback to WAV if MediaRecorder is not supported
          console.log('MediaRecorder not supported, using WAV format');
          resolve(audioBufferToWav(audioBuffer));
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  // Helper function to generate AI title
  const generateAITitle = async (transcription: string): Promise<string> => {
    try {
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcription }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate title');
      }

      const data = await response.json();
      return data.title || 'Untitled';
    } catch (error) {
      console.error('Error generating AI title:', error);
      return 'Untitled';
    }
  };

  const saveSession = async (title: string, transcription: string, keySentences?: string, date?: string) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, transcription, keySentences, date }),
      });

      if (!response.ok) {
        throw new Error('Failed to save session');
      }

      const data = await response.json();
      return data.session;
    } catch (error) {
      console.error('Error saving session:', error);
      // Don't throw - we don't want to fail the entire process if saving fails
      return null;
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    if (!audioBlob) {
      console.error('No audio file to transcribe');
      return;
    }
  
    try {
      setIsProcessing(true);
      onProcessingStart?.();
      
      const duration = mode === 'record' ? recordingTime : uploadedFileDuration;
      const chunkDurationMs = 5 * 60 * 1000; // 5 minutes in milliseconds
      const needsChunking = duration > 300; // 5 minutes in seconds
      
      // Validate duration
      if (duration <= 0) {
        throw new Error('Invalid audio duration');
      }
      
      // Generate date for the recording
      const now = new Date();
      const date = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      // Temporarily disable chunking for debugging
      
      
      if (needsChunking) {
        console.log(`Audio duration (${duration}s) exceeds 5 minutes, splitting into chunks`);
        setIsChunkProcessing(true);
        
        // Split audio into chunks with timeout
        console.log(`Splitting audio of duration ${duration}s into chunks of ${chunkDurationMs/1000}s each`);
        
        // Add timeout to prevent hanging
        const chunkingPromise = splitAudioIntoChunks(audioBlob, chunkDurationMs);
        const timeoutPromise = new Promise<Blob[]>((_, reject) => {
          setTimeout(() => reject(new Error('Audio chunking timed out after 30 seconds')), 30000);
        });
        
        let chunks: Blob[];
        try {
          chunks = await Promise.race([chunkingPromise, timeoutPromise]);
          setChunkProgress({ current: 0, total: chunks.length });
          
          console.log(`Split audio into ${chunks.length} chunks`);
          console.log('Chunk sizes:', chunks.map((chunk, i) => `Chunk ${i+1}: ${(chunk.size / 1024 / 1024).toFixed(2)}MB`));
          
          // Validate chunking
          const totalChunkSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
          const originalSize = audioBlob.size;
          console.log(`Original file size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
          console.log(`Total chunk size: ${(totalChunkSize / 1024 / 1024).toFixed(2)}MB`);
          console.log(`Size difference: ${((totalChunkSize - originalSize) / 1024 / 1024).toFixed(2)}MB`);
        } catch (chunkingError) {
          console.error('Audio chunking failed:', chunkingError);
          console.log('Falling back to processing entire file without chunking');
          setIsChunkProcessing(false);
          
          // Process the entire file without chunking
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          formData.append('recordingDuration', duration.toString());

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
          
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse?.message || 'Transcription failed');
          }

          const data = await response.json();
          
          // Generate AI title
          const aiTitle = await generateAITitle(data.transcription);
          
          // Save session to database
          await saveSession(aiTitle, data.transcription, data.keySentences, date);
          
          onTranscription?.(data.transcription, data.keySentences, aiTitle, date);
          return;
        }
        
        let fullTranscription = '';
        let allKeySentences = '';
        
        // Process each chunk sequentially
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          setChunkProgress({ current: i + 1, total: chunks.length });
          
          console.log(`Processing chunk ${i + 1} of ${chunks.length}`);
          
          const formData = new FormData();
          formData.append('audio', chunk, `chunk_${i + 1}.webm`);
          formData.append('recordingDuration', (chunkDurationMs / 1000).toString());
          formData.append('isChunk', 'true');
          formData.append('chunkIndex', i.toString());
          formData.append('totalChunks', chunks.length.toString());
  
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
          
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
  
          if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse?.message || `Transcription failed for chunk ${i + 1}`);
          }
  
          const data = await response.json();
          
          console.log(`Chunk ${i + 1} transcription result:`, data.transcription);
          console.log(`Chunk ${i + 1} transcription length:`, data.transcription?.length || 0, 'characters');
          
          // Append chunk transcription to full transcription
          if (data.transcription) {
            fullTranscription += (fullTranscription ? ' ' : '') + data.transcription;
          }
        }
        
        // Extract key sentences from the complete transcription
        console.log('Extracting key sentences from complete transcription');
        const keySentencesResponse = await fetch('/api/key-sentences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transcription: fullTranscription }),
        });
        
        if (keySentencesResponse.ok) {
          const keySentencesData = await keySentencesResponse.json();
          allKeySentences = keySentencesData.keySentences;
        }
        
        console.log('Final combined transcription length:', fullTranscription.length, 'characters');
        console.log('Final combined transcription preview:', fullTranscription.substring(0, 200) + '...');
        
        // Generate AI title for the complete transcription
        const aiTitle = await generateAITitle(fullTranscription);
        
        // Save session to database
        await saveSession(aiTitle, fullTranscription, allKeySentences, date);
        
        // Send combined results with AI title
        onTranscription?.(fullTranscription, allKeySentences, aiTitle, date);
        
      } else {
        console.log('Processing full audio file for transcription');
        
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('recordingDuration', duration.toString());
  
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
  
        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse?.message || 'Transcription failed');
        }
  
        const data = await response.json();
        
        // Generate AI title
        const aiTitle = await generateAITitle(data.transcription);
        
        // Save session to database
        await saveSession(aiTitle, data.transcription, data.keySentences, date);
        
        onTranscription?.(data.transcription, data.keySentences, aiTitle, date);
      }
      
    } catch (error) {
      console.error('Transcription error:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          onTranscription?.("Transcription timed out. Please try with a shorter audio file.");
        } else {
          onTranscription?.("Sorry, transcription failed. Please try again.");
        }
      } else {
        onTranscription?.("Sorry, transcription failed. Please try again.");
      }
    } finally {
      setIsProcessing(false);
      setIsChunkProcessing(false);
      setChunkProgress({ current: 0, total: 0 });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is an audio file
      if (!file.type.startsWith('audio/')) {
        alert('Please select an audio file.');
        return;
      }
      
      setUploadedFile(file);
      setUploadedFileName(file.name);
      setCurrentAudioBlob(file);
      setShowSaveOptions(true);
      
      // Create audio URL for preview
      const audioUrl = URL.createObjectURL(file);
      setAudioURL(audioUrl);
      
      // Get audio duration
      setIsLoadingDuration(true);
      const audio = new Audio(audioUrl);
      audio.addEventListener('loadedmetadata', () => {
        setUploadedFileDuration(audio.duration);
        setIsLoadingDuration(false);
      });
      audio.addEventListener('error', () => {
        setIsLoadingDuration(false);
        console.error('Error loading audio file');
      });
      
      // Reset recording state
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const resetRecording = () => {
    setAudioURL(null);
    setRecordingTime(0);
    setIsProcessing(false);
    setIsChunkProcessing(false);
    setChunkProgress({ current: 0, total: 0 });
    setShowSaveOptions(false);
    setCurrentAudioBlob(null);
    setUploadedFile(null);
    setUploadedFileName('');
    setUploadedFileDuration(0);
    setIsLoadingDuration(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Reset waveform
    const staticHeights = Array.from({ length: 50 }, () => 8);
    setWaveformHeights(staticHeights);
    
    // Clean up any remaining audio resources
    cleanupAudioResources();
  };

  const handleSave = () => {
    if (currentAudioBlob) {
      setShowSaveOptions(false);
      setIsProcessing(true);
      onProcessingStart?.();
      transcribeAudio(currentAudioBlob);
    }
  };

  const handleDelete = () => {
    resetRecording();
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupAudioResources();
    };
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto h-96 relative">
      {/* Mode Toggle */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
        <div className="flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setMode('record')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              mode === 'record' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Record
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              mode === 'upload' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upload
          </button>
        </div>
      </div>

      {/* Timer Display - Fixed Position */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-6xl font-mono font-bold text-gray-900 mb-2">
          {mode === 'record' 
            ? formatTime(recordingTime) 
            : (uploadedFile 
                ? (isLoadingDuration ? '--:--' : formatTime(Math.floor(uploadedFileDuration)))
                : '00:00'
              )
          }
        </div>
        <div className="text-sm text-gray-500 font-medium">
          {mode === 'record' 
            ? (isRecording ? 'Recording...' : 'Recorded time')
            : (uploadedFile ? uploadedFileName : 'No file selected')
          }
        </div>
        {((mode === 'record' && recordingTime > 300) || (mode === 'upload' && uploadedFileDuration > 300)) && (
          <div className="text-xs text-orange-600 font-medium mt-1">
            ⚠️ Audio will be split into chunks for processing
          </div>
        )}
      </div>

            {/* Audio Waveform Visualization - Fixed Position */}
      <div className="absolute top-38 left-1/2 transform -translate-x-1/2 w-full h-36 px-4">
        <div className="w-full h-full flex items-end justify-center space-x-1">
          {waveformHeights.map((height, i) => (
            <div
              key={i}
              className={`w-1.25 rounded-full transition-all duration-75 ${isRecording ? 'bg-red-500' : 'bg-gray-300'}`}
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
      </div>

      {/* Drag & Drop Area - Fixed Position (Upload Mode Only) */}
      {mode === 'upload' && (
        <div className="absolute top-52 left-1/2 transform -translate-x-1/2 w-full h-52 px-4">
          <div 
            className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
            onClick={handleFileSelect}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('audio/')) {
                  // Handle the dropped file directly
                  setUploadedFile(file);
                  setUploadedFileName(file.name);
                  setCurrentAudioBlob(file);
                  setShowSaveOptions(true);
                  
                  // Create audio URL for preview
                  const audioUrl = URL.createObjectURL(file);
                  setAudioURL(audioUrl);
                  
                  // Get audio duration
                  setIsLoadingDuration(true);
                  const audio = new Audio(audioUrl);
                  audio.addEventListener('loadedmetadata', () => {
                    setUploadedFileDuration(audio.duration);
                    setIsLoadingDuration(false);
                  });
                  audio.addEventListener('error', () => {
                    setIsLoadingDuration(false);
                    console.error('Error loading audio file');
                  });
                  
                  // Reset recording state
                  setIsRecording(false);
                  setRecordingTime(0);
                } else {
                  alert('Please select an audio file.');
                }
              }
            }}
          >
            {uploadedFile ? (
              <div className="text-center">
                <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-600 font-medium">{uploadedFileName}</p>
                <p className="text-xs text-gray-500">Click to change file</p>
              </div>
            ) : (
              <div className="text-center">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-600 font-medium">Drop audio file here</p>
                <p className="text-xs text-gray-500">or click to browse</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Action Button - Fixed Position */}
      {mode === 'record' && (
        <div className="absolute top-84 left-1/2 transform -translate-x-1/2">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 ${isRecording ? 'bg-red-500 hover:bg-red-600 shadow-lg' : 'bg-gray-900 hover:bg-gray-800 shadow-lg'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isRecording ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 512 512">
                <path d="m439.5,236c0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,70-64,126.9-142.7,126.9-78.7,0-142.7-56.9-142.7-126.9 0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,86.2 71.5,157.4 163.1,166.7v57.5h-23.6c-11.3,0-20.4,9.1-20.4,20.4 0,11.3 9.1,20.4 20.4,20.4h88c11.3,0 20.4-9.1 20.4-20.4 0-11.3-9.1-20.4-20.4-20.4h-23.6v-57.5c91.6-9.3 163.1-80.5 163.1-166.7z"/>
                <path d="m256,323.5c51,0 92.3-41.3 92.3-92.3v-127.9c0-51-41.3-92.3-92.3-92.3s-92.3,41.3-92.3,92.3v127.9c0,51 41.3,92.3 92.3,92.3zm-52.3-220.2c0-28.8 23.5-52.3 52.3-52.3s52.3,23.5 52.3,52.3v127.9c0,28.8-23.5,52.3-52.3,52.3s-52.3-23.5-52.3-52.3v-127.9z"/>
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Processing Status - Fixed Position */}
      {isProcessing && (
        <div className="absolute top-122 left-1/2 transform -translate-x-1/2 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-900 font-medium">
                {isChunkProcessing && chunkProgress.total > 1 
                  ? `Processing chunk ${chunkProgress.current} of ${chunkProgress.total}...`
                  : 'Processing...'
                }
              </span>
            </div>
            {isChunkProcessing && chunkProgress.total > 1 && (
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(chunkProgress.current / chunkProgress.total) * 100}%` }}
                ></div>
              </div>
            )}
            {isChunkProcessing && chunkProgress.total > 1 && (
              <div className="text-xs text-gray-500">
                {Math.round((chunkProgress.current / chunkProgress.total) * 100)}% complete
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save/Delete Options - Fixed Position, Always Present */}
      <div className="absolute top-116 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-4">
        <button
          onClick={handleSave}
          className={`px-8 py-3 bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-full transition-colors duration-200 font-medium cursor-pointer ${showSaveOptions && !isProcessing ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          Transcribe
        </button>
        <button
          onClick={handleDelete}
          className={`p-3 text-red-500 hover:text-red-600 transition-colors duration-200 cursor-pointer ${showSaveOptions && !isProcessing ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

        {/* Audio Player - Hidden by default, only show if needed */}
        {audioURL && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 opacity-0 pointer-events-none">
            <audio controls className="w-full" src={audioURL}>
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
  );
};

export default AudioRecorder;
