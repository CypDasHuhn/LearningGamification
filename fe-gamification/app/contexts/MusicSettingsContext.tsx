import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getMusicEnabled, setMusicEnabled as persistMusicEnabled } from "~/lib/music-settings";

type MusicSettingsContextValue = {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
};

const MusicSettingsContext = createContext<MusicSettingsContextValue | null>(null);

export function MusicSettingsProvider({ children }: { children: ReactNode }) {
  const [musicEnabled, setMusicEnabledState] = useState(() =>
    typeof window !== "undefined" ? getMusicEnabled() : true
  );

  const setMusicEnabled = useCallback((enabled: boolean) => {
    persistMusicEnabled(enabled);
    setMusicEnabledState(enabled);
  }, []);

  useEffect(() => {
    setMusicEnabledState(getMusicEnabled());
    const handler = () => setMusicEnabledState(getMusicEnabled());
    window.addEventListener("music-setting-changed", handler);
    return () => window.removeEventListener("music-setting-changed", handler);
  }, []);

  return (
    <MusicSettingsContext.Provider value={{ musicEnabled, setMusicEnabled }}>
      {children}
    </MusicSettingsContext.Provider>
  );
}

export function useMusicSettings() {
  const ctx = useContext(MusicSettingsContext);
  if (!ctx) throw new Error("useMusicSettings must be used within MusicSettingsProvider");
  return ctx;
}
