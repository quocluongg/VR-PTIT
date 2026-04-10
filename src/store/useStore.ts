import { create } from 'zustand';

export type EventMode = 'normal' | 'solar_eclipse' | 'lunar_eclipse' | 'blood_moon';

interface AppState {
  eventMode: EventMode;
  setEventMode: (mode: EventMode) => void;
  timeScale: number;
  setTimeScale: (scale: number) => void;
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

export const useStore = create<AppState>((set) => ({
  eventMode: 'normal',
  setEventMode: (mode) => set({ eventMode: mode }),
  timeScale: 1.0,
  setTimeScale: (scale) => set({ timeScale: scale }),
  isMenuOpen: false,
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
}));
