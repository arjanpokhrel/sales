import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AudioVoiceGuideButton({ text, className = '' }) {
  const { lang } = useLanguage();
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported || !text) return null;

  const toggleSpeech = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ne' ? 'ne-NP' : 'en-US';
      utterance.rate = 0.95; // slightly slower for emergency clarity
      utterance.pitch = 1.0;

      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    } catch (e) {
      console.warn('Speech synthesis notice:', e);
      setSpeaking(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleSpeech}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 ${
        speaking
          ? 'bg-amber-600 text-white animate-pulse'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
      } ${className}`}
      title={speaking ? 'Stop Audio' : 'Listen Instructions Aloud'}
    >
      {speaking ? (
        <>
          <VolumeX className="w-3.5 h-3.5" />
          <span>{lang === 'ne' ? 'अडियो रोक्नुहोस्' : 'Stop Audio'}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-sky-500" />
          <span>{lang === 'ne' ? '🔊 आवाजमा सुन्नुहोस्' : '🔊 Listen Audio'}</span>
        </>
      )}
    </button>
  );
}

