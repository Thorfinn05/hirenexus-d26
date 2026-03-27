"use client"

import { useState, useCallback, useRef } from 'react';

/**
 * usePiperTTS
 * A simplified hook for Piper TTS. 
 * Since Piper is a separate binary/model, this hook provides the structure.
 * For a truly "completely free" browser stack, we'll use the Web Speech API 
 * as a base, which can be swapped with a Piper WASM implementation.
 */
export function usePiperTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const speak = useCallback(async (text: string, voiceName?: string) => {
    setIsSpeaking(true);
    
    // Fallback to Web Speech API for this demo, 
    // simulating the Piper stack as requested.
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select a premium sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
    if (voice) utterance.voice = voice;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking
  };
}
