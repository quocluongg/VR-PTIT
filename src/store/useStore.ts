import { create } from 'zustand';

export type EventMode = 'normal' | 'solar_eclipse' | 'lunar_eclipse' | 'blood_moon';

interface AppState {
  eventMode: EventMode;
  setEventMode: (mode: EventMode) => void;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  toggleMenu: () => void;
}

export const useStore = create<AppState>((set) => ({
  eventMode: 'normal',
  setEventMode: (mode) => set({ eventMode: mode }),
  showMenu: true,
  setShowMenu: (show) => set({ showMenu: show }),
  toggleMenu: () => set((state) => ({ showMenu: !state.showMenu })),
}));
