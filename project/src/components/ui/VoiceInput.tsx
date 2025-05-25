import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useVoiceRecognition from '../../hooks/useVoiceRecognition';
import { VoiceAssistant } from '../../services/voiceAssistant';

interface VoiceInputProps {
  onCommandSubmit: (command: string) => void;
  placeholder?: string;
  className?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onCommandSubmit,
  placeholder = "Press the mic button and speak...",
  className = "",
}) => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistantResponse, setAssistantResponse] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  
  const { 
    text: recognizedText, 
    isListening, 
    startListening, 
    stopListening,
    hasRecognitionSupport,
    clearText
  } = useVoiceRecognition({
    onResult: (result) => {
      setInputText(result.text);
      handleVoiceCommand(result.text);
    },
    onError: (error) => {
      console.error('Voice recognition error:', error);
      setAssistantResponse('Sorry, I had trouble hearing that. Could you try again?');
      setShowResponse(true);
    }
  });
  
  const handleVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    try {
      const response = await VoiceAssistant.handleCommand(command);
      setAssistantResponse(response);
      setShowResponse(true);
      
      // Extract navigation route if present
      const navigationMatch = response.match(/Navigating to (\/[a-z]+)\.\.\.$/);
      if (navigationMatch) {
        setTimeout(() => {
          navigate(navigationMatch[1]);
        }, 1000);
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      setAssistantResponse('Sorry, I encountered an error. Please try again.');
      setShowResponse(true);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const finalText = inputText || recognizedText;
    if (!finalText.trim()) return;
    
    handleVoiceCommand(finalText);
    setInputText('');
    clearText();
  }, [inputText, recognizedText, clearText]);
  
  // Handle text input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };
  
  // Toggle microphone
  const toggleMicrophone = () => {
    if (isListening) {
      stopListening();
    } else {
      setShowResponse(false);
      startListening();
    }
  };
  
  // Clear response after delay
  useEffect(() => {
    if (showResponse) {
      const timer = setTimeout(() => {
        setShowResponse(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showResponse]);

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText || recognizedText}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="input py-3 pl-4 pr-20 w-full text-lg rounded-full shadow-sm border-2 focus:border-accent-400"
          />
          
          <div className="absolute right-2 flex items-center space-x-1">
            {/* Microphone button */}
            {hasRecognitionSupport && (
              <motion.button
                type="button"
                onClick={toggleMicrophone}
                className={`p-2.5 rounded-full ${isListening ? 'bg-accent-100 text-accent-600' : 'bg-gray-100 text-gray-600'}`}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 1 }}
                animate={{ scale: isListening ? [1, 1.1, 1] : 1 }}
                transition={{ repeat: isListening ? Infinity : 0, duration: 1.5 }}
                aria-label={isListening ? "Stop listening" : "Start listening"}
              >
                {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </motion.button>
            )}
            
            {/* Submit button */}
            <motion.button
              type="submit"
              className="p-2.5 rounded-full bg-primary-600 text-white"
              disabled={!(inputText || recognizedText).trim() || isProcessing}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {isProcessing ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </div>
        
        {/* Voice waveform visualization */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 flex justify-center"
            >
              <div className={`waveform ${isListening ? 'waveform-active' : ''}`}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="waveform-bar"
                    animate={{
                      height: isListening ? `${Math.random() * 24 + 8}px` : '16px'
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Assistant response */}
        <AnimatePresence>
          {showResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 p-3 bg-white rounded-lg shadow-lg border border-gray-200"
            >
              <p className="text-gray-800">{assistantResponse}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default VoiceInput;