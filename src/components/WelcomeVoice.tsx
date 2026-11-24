import { useEffect } from "react";
import { useSoundFx } from "@/contexts/SoundContext";

const SESSION_KEY = "welcome-voice-played";
const WELCOME_TEXT = "أهلاً بكم في البسمة لمستحضرات التجميل";

export function WelcomeVoice() {
  const { enabled } = useSoundFx();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!enabled) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (!("speechSynthesis" in window)) return;

    const speak = () => {
      try {
        const utter = new SpeechSynthesisUtterance(WELCOME_TEXT);
        utter.lang = "ar-EG";
        utter.rate = 0.95;
        utter.pitch = 1.05;
        utter.volume = 1;

        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find((v) => v.lang.startsWith("ar"));
        if (arabicVoice) utter.voice = arabicVoice;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* noop */
      }
    };

    // Wait for first user interaction (browsers block autoplay audio)
    const trigger = () => {
      // Voices may load async
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => speak();
      } else {
        speak();
      }
      window.removeEventListener("click", trigger);
      window.removeEventListener("touchstart", trigger);
      window.removeEventListener("keydown", trigger);
    };

    window.addEventListener("click", trigger, { once: true });
    window.addEventListener("touchstart", trigger, { once: true });
    window.addEventListener("keydown", trigger, { once: true });

    return () => {
      window.removeEventListener("click", trigger);
      window.removeEventListener("touchstart", trigger);
      window.removeEventListener("keydown", trigger);
    };
  }, [enabled]);

  return null;
}
