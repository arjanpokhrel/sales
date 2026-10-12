import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function VoiceSearchButton({ onTranscript, className = '' }) {
  const { lang } = useLanguage();
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setSupported(true);
    }
  }, []);

  if (!supported) return null;

  const toggleListen = () => {
    if (listening) {
      setListening(false);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'ne' ? 'ne-NP' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        if (text && onTranscript) {
          onTranscript(text);
        }
        setListening(false);
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition notice:', err);
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Voice search failed to start:', err);
      setListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListen}
      className={`p-2 rounded-xl transition flex items-center justify-center flex-shrink-0 relative ${
        listening
          ? 'bg-red-600 text-white animate-pulse'
          : 'text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800'
      } ${className}`}
      title={listening ? (lang === 'ne' ? 'सुन्दैछ… बोल्नुहोस्' : 'Listening… speak now') : (lang === 'ne' ? 'आवाजबाट खोज्नुहोस्' : 'Voice Search')}
    >
      {listening ? (
        <>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <Mic className="w-4 h-4" />
        </>
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}

