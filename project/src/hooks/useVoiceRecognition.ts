import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

type VoiceRecognitionStatus = 'inactive' | 'listening' | 'processing' | 'error';

interface VoiceRecognitionResult {
  text: string;
  confidence: number;
}

interface UseVoiceRecognitionOptions {
  onResult?: (result: VoiceRecognitionResult) => void;
  onError?: (error: string) => void;
  autoStart?: boolean;
  continuous?: boolean;
  language?: string;
}

interface UseVoiceRecognitionReturn {
  text: string;
  isListening: boolean;
  status: VoiceRecognitionStatus;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  error: string | null;
  clearText: () => void;
}

/**
 * Custom hook for voice recognition functionality
 */
export function useVoiceRecognition({
  onResult,
  onError,
  autoStart = false,
  continuous = false,
  language = 'en-US',
}: UseVoiceRecognitionOptions = {}): UseVoiceRecognitionReturn {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<VoiceRecognitionStatus>('inactive');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any | null>(null);

  // Check if browser supports speech recognition
  const hasRecognitionSupport = !!window.SpeechRecognition || !!window.webkitSpeechRecognition;

  // Initialize speech recognition
  useEffect(() => {
    if (!hasRecognitionSupport) {
      setError('Your browser does not support speech recognition.');
      return;
    }

    // Create recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    // Configure recognition settings
    recognitionInstance.continuous = continuous;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = language;
    
    // Set up event handlers
    recognitionInstance.onstart = () => {
      setIsListening(true);
      setStatus('listening');
      setError(null);
    };
    
    recognitionInstance.onend = () => {
      setIsListening(false);
      setStatus('inactive');
    };
    
    recognitionInstance.onresult = (event: any) => {
      setStatus('processing');
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      const confidence = event.results[current][0].confidence;
      
      setText(transcript);
      
      if (onResult) {
        onResult({ text: transcript, confidence });
      }
      
      if (!continuous) {
        recognitionInstance.stop();
      }
    };
    
    recognitionInstance.onerror = (event: any) => {
      setStatus('error');
      setError(event.error);
      setIsListening(false);
      
      if (onError) {
        onError(event.error);
      }
    };
    
    setRecognition(recognitionInstance);
    
    // Start automatically if enabled
    if (autoStart) {
      try {
        recognitionInstance.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
    
    // Clean up on unmount
    return () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch (err) {
          // Ignore errors when stopping
        }
      }
    };
  }, [hasRecognitionSupport, autoStart, continuous, language, onResult, onError]);
  
  // Start listening function
  const startListening = useCallback(() => {
    if (!recognition || !hasRecognitionSupport) return;
    
    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
    }
  }, [recognition, hasRecognitionSupport]);
  
  // Stop listening function
  const stopListening = useCallback(() => {
    if (!recognition || !hasRecognitionSupport) return;
    
    try {
      recognition.stop();
    } catch (err) {
      console.error('Failed to stop speech recognition:', err);
    }
  }, [recognition, hasRecognitionSupport]);
  
  // Clear recognized text
  const clearText = useCallback(() => {
    setText('');
  }, []);

  return {
    text,
    isListening,
    status,
    startListening,
    stopListening,
    hasRecognitionSupport,
    error,
    clearText,
  };
}

export default useVoiceRecognition;