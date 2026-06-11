import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Volume2, VolumeX } from "lucide-react";

const SALAWAT = [
  "اللهم صلِّ وسلم على نبينا محمد ﷺ",
  "اللهم صلِّ على محمد وعلى آل محمد كما صليت على إبراهيم",
  "صلى الله عليه وسلم تسليماً كثيراً",
];

const ATHKAR_MORNING = [
  "🌅 أصبحنا وأصبح الملك لله، والحمد لله",
  "🌅 سبحان الله وبحمده، عدد خلقه ورضا نفسه",
  "🌅 اللهم بك أصبحنا وبك أمسينا وبك نحيا",
  "🌅 لا إله إلا الله وحده لا شريك له",
];

const ATHKAR_EVENING = [
  "🌙 أمسينا وأمسى الملك لله، والحمد لله",
  "🌙 اللهم ما أمسى بي من نعمة فمنك وحدك",
  "🌙 أعوذ بكلمات الله التامات من شر ما خلق",
  "🌙 سبحان الله والحمد لله ولا إله إلا الله والله أكبر",
];

const AYAT_HADITH = [
  { t: "آية اليوم", text: "﴿وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا﴾", src: "الطلاق: 2" },
  { t: "آية اليوم", text: "﴿إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾", src: "الشرح: 6" },
  { t: "آية اليوم", text: "﴿وَبَشِّرِ الصَّابِرِينَ﴾", src: "البقرة: 155" },
  { t: "حديث اليوم", text: "«الكلمة الطيبة صدقة»", src: "متفق عليه" },
  { t: "حديث اليوم", text: "«من لا يرحم لا يُرحم»", src: "متفق عليه" },
  { t: "حديث اليوم", text: "«إنما الأعمال بالنيات»", src: "متفق عليه" },
  { t: "حديث اليوم", text: "«البركة في البكور»", src: "رواه أبو داود" },
];

const STORAGE_KEY = "islamic-voice-enabled";
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const stripForSpeech = (s: string) =>
  s.replace(/[🌅🌙﴿﴾«»""()]/g, "").replace(/ﷺ/g, "صلى الله عليه وسلم").trim();

const speak = (text: string) => {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(stripForSpeech(text));
    u.lang = "ar-SA";
    u.rate = 0.9;
    u.pitch = 1;
    u.volume = 0.9;
    const voices = synth.getVoices();
    const ar = voices.find((v) => v.lang?.toLowerCase().startsWith("ar"));
    if (ar) u.voice = ar;
    synth.speak(u);
  } catch {
    /* noop */
  }
};

const isVoiceOn = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
};

const showSalawat = () => {
  const text = pick(SALAWAT);
  toast(text, {
    description: "اضغط على ﷺ للصلاة عليه",
    duration: 8000,
    action: {
      label: "ﷺ صليت",
      onClick: () => toast.success("تقبّل الله 🤍"),
    },
  });
  if (isVoiceOn()) speak(text);
};

const showAthkar = () => {
  const hour = new Date().getHours();
  const list = hour >= 5 && hour < 16 ? ATHKAR_MORNING : ATHKAR_EVENING;
  const text = pick(list);
  toast(text, { duration: 6000 });
  if (isVoiceOn()) speak(text);
};

const showAyahHadith = () => {
  const item = pick(AYAT_HADITH);
  toast(item.text, {
    description: `${item.t} — ${item.src}`,
    duration: 9000,
  });
  if (isVoiceOn()) speak(item.text);
};

const REMINDERS = [showSalawat, showAthkar, showAyahHadith];

export function IslamicReminders() {
  const idx = useRef(0);
  const shown = useRef(false);
  const [voice, setVoice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setVoice(localStorage.getItem(STORAGE_KEY) === "true");
      // preload voices
      window.speechSynthesis?.getVoices();
    }
  }, []);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;

    const first = setTimeout(() => {
      showSalawat();
    }, 20_000);

    // كل دقيقتين
    const interval = setInterval(() => {
      const fn = REMINDERS[idx.current % REMINDERS.length];
      idx.current += 1;
      fn();
    }, 2 * 60 * 1000);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  const toggleVoice = () => {
    const next = !voice;
    setVoice(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    if (next) {
      // user gesture يفعّل صوت المتصفح
      speak("بسم الله");
      toast.success("تم تفعيل صوت الأذكار 🔊");
    } else {
      window.speechSynthesis?.cancel();
      toast("تم إيقاف الصوت 🔇");
    }
  };

  return (
    <button
      onClick={toggleVoice}
      aria-label={voice ? "إيقاف صوت الأذكار" : "تشغيل صوت الأذكار"}
      title={voice ? "إيقاف صوت الأذكار" : "تشغيل صوت الأذكار"}
      className="fixed bottom-24 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105 active:scale-95"
    >
      {voice ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </button>
  );
}
