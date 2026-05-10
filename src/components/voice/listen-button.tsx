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

  const speakWithTTS = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsLoading(false);
  };

  const handleListen = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    try {
      const audioUrl = `${AUDIO_BASE}/${listingId}.mp3`;

      // Check if file exists first
      const headRes = await fetch(audioUrl, { method: "HEAD" });
      if (!headRes.ok) {
        speakWithTTS();
        return;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => speakWithTTS();

      // Wait for audio to be ready before playing
      await new Promise<void>((resolve, reject) => {
        audio.oncanplaythrough = () => resolve();
        audio.onerror = () => reject();
        audio.load();
      });

      await audio.play();
      setIsPlaying(true);
      setIsLoading(false);
    } catch {
      speakWithTTS();
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
