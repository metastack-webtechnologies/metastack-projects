import React, { useState, useEffect, useRef } from 'react';
import { addTask } from '../services/taskService';
import { motion } from 'framer-motion'; // NEW: Import motion

// Check if SpeechRecognition API is available in the browser
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

// Create a single recognition instance
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-IN'; // Default to English (India)
}

const indianLanguages = [
  { code: 'en-IN', name: 'English (India)' },
  { code: 'hi-IN', name: 'Hindi (India)' },
  { code: 'bn-IN', name: 'Bengali (India)' },
  { code: 'gu-IN', name: 'Gujarati (India)' },
  { code: 'kn-IN', name: 'Kannada (India)' },
  { code: 'ml-IN', name: 'Malayalam (India)' },
  { code: 'mr-IN', name: 'Marathi (India)' },
  { code: 'pa-IN', name: 'Punjabi (India)' },
  { code: 'ta-IN', name: 'Tamil (India)' },
  { code: 'te-IN', name: 'Telugu (India)' },
];

const VoiceInputButton = ({ onTaskAdded }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');

  const onTaskAddedRef = useRef(onTaskAdded);
  const transcriptToSendRef = useRef('');

  useEffect(() => {
    onTaskAddedRef.current = onTaskAdded;

    if (!recognition) {
      setError('Speech Recognition not supported by this browser. Try Chrome or Edge for voice input.');
      return;
    }

    recognition.lang = selectedLanguage;

    const handleStart = () => {
      setIsListening(true);
      setTranscript('');
      transcriptToSendRef.current = '';
      setError('');
      console.log('Voice recognition started for:', selectedLanguage);
    };

    const handleResult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      transcriptToSendRef.current = speechResult;
      console.log('Speech result:', speechResult);
    };

    const handleError = (event) => {
      setIsListening(false);
      setLoading(false);
      setError(`Speech recognition error: ${event.error}. Please ensure microphone access and try again.`);
      console.error('Speech recognition error:', event.error);
    };

    const handleEnd = () => {
      setIsListening(false);
      setLoading(false);
      console.log('Voice recognition ended.');

      if (transcriptToSendRef.current.trim()) {
        sendTaskToBackend(transcriptToSendRef.current);
      } else if (!error) {
        setError('No speech was recognized. Please try again.');
      }
      setTranscript('');
      transcriptToSendRef.current = '';
    };

    recognition.addEventListener('start', handleStart);
    recognition.addEventListener('result', handleResult);
    recognition.addEventListener('error', handleError);
    recognition.addEventListener('end', handleEnd);

    return () => {
      recognition.removeEventListener('start', handleStart);
      recognition.removeEventListener('result', handleResult);
      recognition.removeEventListener('error', handleError);
      recognition.removeEventListener('end', handleEnd);
    };
  }, [selectedLanguage, onTaskAdded]);

  const startListening = () => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        setLoading(false);
      } catch (e) {
        setError('Error starting speech recognition: ' + e.message);
        console.error('Error starting recognition:', e);
      }
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const sendTaskToBackend = async (text) => {
    if (!text.trim()) {
      setError('No speech was recognized or it was too short to send.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onTaskAddedRef.current(text);
    } catch (err) {
      setError('Error adding task from voice: ' + (err.message || 'Unknown error'));
      console.error('Task adding error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="voice-input-container">
      <select
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        disabled={isListening || loading || !recognition}
      >
        {indianLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>

      <motion.button // NEW: Apply motion to button
        onClick={isListening ? stopListening : startListening}
        disabled={loading || !recognition}
        whileTap={{ scale: 0.95 }} // Squash effect on button tap
      >
        {loading ? 'Processing...' : (isListening ? 'Stop Listening' : 'Start Voice Task')}
      </motion.button>
      {isListening && <p>Listening for speech in {indianLanguages.find(l => l.code === selectedLanguage)?.name || selectedLanguage}...</p>}
      {transcript && !isListening && !loading && <p>Transcribed: "<em>{transcript}</em>"</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!recognition && <p style={{ color: 'orange' }}>Your browser does not support Speech Recognition. Try Chrome or Edge.</p>}
    </div>
  );
};

export default VoiceInputButton;