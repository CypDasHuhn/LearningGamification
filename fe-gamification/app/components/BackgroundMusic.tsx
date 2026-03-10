import { useEffect, useRef, useState } from "react";
import { useMusicSettings } from "~/contexts/MusicSettingsContext";

// Retro-Hintergrundmusik (CC BY 4.0 – Attribution in Einstellungen)
const BG_MUSIC_URL = "https://www.silvermansound.com/wp-content/uploads/happynes.mp3";

export function BackgroundMusic() {
  const { musicEnabled } = useMusicSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const audio = new Audio(BG_MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    const tryPlay = () => {
      if (!musicEnabled || started) return;
      audio.play().then(() => setStarted(true)).catch(() => {});
    };

    const onInteraction = () => {
      tryPlay();
      document.removeEventListener("click", onInteraction);
      document.removeEventListener("keydown", onInteraction);
      document.removeEventListener("touchstart", onInteraction);
    };

    document.addEventListener("click", onInteraction, { once: true });
    document.addEventListener("keydown", onInteraction, { once: true });
    document.addEventListener("touchstart", onInteraction, { once: true });

    return () => {
      audio.pause();
      audioRef.current = null;
      document.removeEventListener("click", onInteraction);
      document.removeEventListener("keydown", onInteraction);
      document.removeEventListener("touchstart", onInteraction);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicEnabled && started) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [musicEnabled, started]);

  return null;
}
