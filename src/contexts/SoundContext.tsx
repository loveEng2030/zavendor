import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

interface SoundContextValue {
  enabled: boolean;
  toggle: () => void;
  playPop: () => void;
}

const SoundContext = createContext<SoundContextValue | undefined>(undefined);

// Tiny inline base64 "pop" sound (very short, ~3kb mp3) - cheerful click
const POP_SOUND_URL =
  "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAEsAB6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6//////////////////////////////////////////////////////////////////8AAAA5TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAABLBJ8t6CAAAAAAAAAAAAAAAAAAAA";

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("sound-enabled");
    if (saved !== null) setEnabled(saved === "true");
    const a = new Audio(POP_SOUND_URL);
    a.volume = 0.35;
    a.preload = "auto";
    setAudio(a);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((v) => {
      const next = !v;
      if (typeof window !== "undefined") localStorage.setItem("sound-enabled", String(next));
      return next;
    });
  }, []);

  const playPop = useCallback(() => {
    if (!enabled || !audio) return;
    try {
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    } catch {
      /* noop */
    }
  }, [enabled, audio]);

  return (
    <SoundContext.Provider value={{ enabled, toggle, playPop }}>{children}</SoundContext.Provider>
  );
}

export function useSoundFx() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSoundFx must be used within SoundProvider");
  return ctx;
}
