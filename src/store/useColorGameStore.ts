import { create } from 'zustand';
import * as THREE from 'three';

export type GameMode = 'easy' | 'hard' | null;

export interface Slot {
  id: string;
  expectedColor: string; // The color string/hex expected
  filledBy: string | null; // ball id if filled, else null
}

export interface Ball {
  id: string;
  color: string;
  isPlaced: boolean;
}

interface GameState {
  mode: GameMode;
  level: number;
  isPlaying: boolean;
  isVictory: boolean;
  isGameOver: boolean;
  timeRemaining: number;
  slots: Slot[];
  balls: Ball[];
  activeBallId: string | null;
  
  startGame: (mode: GameMode) => void;
  nextLevel: () => void;
  setActiveBall: (ballId: string | null) => void;
  placeBall: (slotId: string) => boolean; // returns true if correctly placed
  tickTimer: () => void;
  resetGame: () => void;
}

const LEVEL_CONFIGS = {
  1: {
    // Primary colors
    colors: ['red', 'yellow', 'blue'],
    time: 30, // seconds for hard mode
  },
  2: {
    // Secondary colors
    colors: ['green', 'orange', 'purple'],
    time: 45,
  },
  3: {
    // Tertiary colors
    colors: ['#FF4500', '#FF8C00', '#9ACD32', '#008080', '#4B0082', '#C71585'], // red-orange, yellow-orange, yellow-green, blue-green, blue-purple, red-purple
    time: 60,
  }
};

const generateLevelData = (level: number) => {
  const config = LEVEL_CONFIGS[level as keyof typeof LEVEL_CONFIGS];
  const slots: Slot[] = config.colors.map((color, index) => ({
    id: `slot_${level}_${index}`,
    expectedColor: color,
    filledBy: null,
  }));
  
  // Create balls and shuffle them
  const balls: Ball[] = config.colors.map((color, index) => ({
    id: `ball_${level}_${index}`,
    color: color,
    isPlaced: false,
  })).sort(() => Math.random() - 0.5);

  return { slots, balls };
};

export const useColorGameStore = create<GameState>((set, get) => ({
  mode: null,
  level: 1,
  isPlaying: false,
  isVictory: false,
  isGameOver: false,
  timeRemaining: 0,
  slots: [],
  balls: [],
  activeBallId: null,

  startGame: (mode) => {
    const { slots, balls } = generateLevelData(1);
    set({
      mode,
      level: 1,
      isPlaying: true,
      isVictory: false,
      isGameOver: false,
      timeRemaining: mode === 'hard' ? LEVEL_CONFIGS[1].time : -1,
      slots,
      balls,
      activeBallId: null,
    });
  },

  nextLevel: () => {
    const { level, mode } = get();
    if (level < 3) {
      const nextLvl = level + 1;
      const { slots, balls } = generateLevelData(nextLvl);
      set({
        level: nextLvl,
        slots,
        balls,
        timeRemaining: mode === 'hard' ? LEVEL_CONFIGS[nextLvl as keyof typeof LEVEL_CONFIGS].time : -1,
        activeBallId: null,
      });
    } else {
      set({ isPlaying: false, isVictory: true, activeBallId: null });
    }
  },

  setActiveBall: (ballId) => {
    set({ activeBallId: ballId });
  },

  placeBall: (slotId) => {
    const state = get();
    const { activeBallId, slots, balls } = state;
    
    if (!activeBallId) return false;

    const slotIndex = slots.findIndex(s => s.id === slotId);
    const ballIndex = balls.findIndex(b => b.id === activeBallId);
    
    if (slotIndex === -1 || ballIndex === -1) return false;

    const slot = slots[slotIndex];
    const ball = balls[ballIndex];

    // Check if correct color
    if (slot.expectedColor === ball.color && !slot.filledBy) {
      const newSlots = [...slots];
      newSlots[slotIndex] = { ...slot, filledBy: activeBallId };
      
      const newBalls = [...balls];
      newBalls[ballIndex] = { ...ball, isPlaced: true };

      // Check if level complete
      const isLevelComplete = newSlots.every(s => s.filledBy !== null);
      
      set({ slots: newSlots, balls: newBalls, activeBallId: null });

      if (isLevelComplete) {
        setTimeout(() => {
          get().nextLevel();
        }, 2000); // 2 second delay before next level
      }
      return true;
    }
    
    // Deselect if wrong
    set({ activeBallId: null });
    return false;
  },

  tickTimer: () => {
    const state = get();
    if (state.mode === 'hard' && state.isPlaying && !state.isGameOver && !state.isVictory) {
      if (state.timeRemaining > 0) {
        set({ timeRemaining: state.timeRemaining - 1 });
      } else {
        set({ isPlaying: false, isGameOver: true, activeBallId: null });
      }
    }
  },

  resetGame: () => {
    set({
      mode: null,
      level: 1,
      isPlaying: false,
      isVictory: false,
      isGameOver: false,
      timeRemaining: 0,
      slots: [],
      balls: [],
      activeBallId: null,
    });
  }
}));
