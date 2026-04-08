import { create } from 'zustand';

export type EventMode = 'normal' | 'solar_eclipse' | 'lunar_eclipse' | 'blood_moon';

interface AppState {
  eventMode: EventMode;
  setEventMode: (mode: EventMode) => void;
}

export const useStore = create<AppState>((set) => ({
  eventMode: 'normal',
  setEventMode: (mode) => set({ eventMode: mode }),
}));
