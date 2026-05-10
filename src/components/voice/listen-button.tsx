"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

const AUDIO_BASE = "https://vjqxvrugrnynfepgrmzi.supabase.co/storage/v1/object/public/listing-audio";

interface ListenButtonProps {
  listingId: string;
  text: string;
}

export default function ListenButton({ listingId, text }: ListenButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleListen = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    try {
      // Try pre-generated audio first
      const audioUrl = `${AUDIO_BASE}/${listingId}.mp3`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        // Fallback to browser TTS
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsPlaying(false);
        speechSynthesis.speak(utterance);
        setIsPlaying(true);
        setIsLoading(false);
      };

      await audio.play();
      setIsPlaying(true);
    } catch {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="cursor-pointer"
      onClick={handleListen}
      disabled={isLoading}
      aria-label={isPlaying ? "Stop reading" : "Read aloud"}
    >
      {isLoading ? "⏳" : isPlaying ? "⏹️ Stop" : "🔊 Listen"}
    </Button>
  );
}
