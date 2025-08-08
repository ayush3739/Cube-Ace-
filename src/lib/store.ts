
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type AppStatus = 'idle' | 'ready' | 'solving' | 'solved' | 'scrambled' | 'detecting';
type SolvingMethod = 'beginner' | 'advanced';
type CubeType = '2x2' | '3x3' | '4x4';

export interface ColorScheme {
  U: string;
  D: string;
  F: string;
  B: string;
  R: string;
  L: string;
}

export const defaultColors: ColorScheme = {
  U: '#ffffff', // White
  D: '#ffd500', // Yellow
  F: '#009b48', // Green
  B: '#0045ad', // Blue
  R: '#b71234', // Red
  L: '#ff5800', // Orange
};

export const SOLVED_CUBE_CONFIG = 'WWWWWWWWWRRRRRRRRRGGGGGGGGGYYYYYYYYYOOOOOOOOOBBBBBBBBB';
export const faceToColor: Record<keyof ColorScheme, string> = {
    U: 'W',
    R: 'R',
    F: 'G',
    D: 'Y',
    L: 'O',
    B: 'B',
};


interface CubeState {
  status: AppStatus;
  cubeConfig: string;
  solution: string[];
  scramble: string;
  solvingMethod: SolvingMethod;
  cubeType: CubeType;
  colorScheme: ColorScheme;
  scrambleHistory: string[];
  
  setStatus: (status: AppStatus) => void;
  setCubeConfig: (config: string) => void;
  setSolution: (solution: string[]) => void;
  setScramble: (scramble: string) => void;
  setSolvingMethod: (method: SolvingMethod) => void;
  setCubeType: (type: CubeType) => void;
  setColorScheme: (scheme: Partial<ColorScheme>) => void;
  resetColorScheme: () => void;
  addScrambleToHistory: (scramble: string) => void;
  resetCube: () => void;
}

export const useCubeStore = create<CubeState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      cubeConfig: SOLVED_CUBE_CONFIG,
      solution: [],
      scramble: '',
      solvingMethod: 'beginner',
      cubeType: '3x3',
      colorScheme: defaultColors,
      scrambleHistory: [],

      setStatus: (status) => set({ status }),
      setCubeConfig: (config) => set({ cubeConfig: config }),
      setSolution: (solution) => set({ solution }),
      setScramble: (scramble) => set({ scramble }),
      setSolvingMethod: (method) => set({ solvingMethod: method }),
      setCubeType: (type) => set({ cubeType: type }),
      setColorScheme: (scheme) => set((state) => ({ colorScheme: { ...state.colorScheme, ...scheme } })),
      resetColorScheme: () => set({ colorScheme: defaultColors }),
      addScrambleToHistory: (scramble) => {
        const history = [scramble, ...get().scrambleHistory].filter((s, i, a) => a.indexOf(s) === i);
        if (history.length > 5) {
          history.pop();
        }
        set({ scrambleHistory: history });
      },
      resetCube: () => {
        set({
          status: 'ready',
          solution: [],
          cubeConfig: SOLVED_CUBE_CONFIG,
          scramble: '',
        });
      }
    }),
    {
      name: 'cubeace-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ 
        solvingMethod: state.solvingMethod,
        cubeType: state.cubeType,
        colorScheme: state.colorScheme,
        scrambleHistory: state.scrambleHistory,
        cubeConfig: state.cubeConfig,
      }),
    }
  )
);
