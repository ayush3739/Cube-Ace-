'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type AppStatus = 'idle' | 'ready' | 'solving' | 'solved' | 'scrambled';
type SolvingMethod = 'beginner' | 'advanced';
type CubeType = '2x2' | '3x3' | '4x4';
type CubeTheme = 'classic' | 'pastel' | 'high-contrast';

interface CubeState {
  status: AppStatus;
  cubeConfig: string | null;
  solution: string[];
  solvingMethod: SolvingMethod;
  cubeType: CubeType;
  cubeTheme: CubeTheme;
  scrambleHistory: string[];
  
  setStatus: (status: AppStatus) => void;
  setCubeConfig: (config: string) => void;
  setSolution: (solution: string[]) => void;
  setSolvingMethod: (method: SolvingMethod) => void;
  setCubeType: (type: CubeType) => void;
  setCubeTheme: (theme: CubeTheme) => void;
  addScrambleToHistory: (scramble: string) => void;
}

export const useCubeStore = create<CubeState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      cubeConfig: null,
      solution: [],
      solvingMethod: 'beginner',
      cubeType: '3x3',
      cubeTheme: 'classic',
      scrambleHistory: [],

      setStatus: (status) => set({ status }),
      setCubeConfig: (config) => set({ cubeConfig: config }),
      setSolution: (solution) => set({ solution }),
      setSolvingMethod: (method) => set({ solvingMethod: method }),
      setCubeType: (type) => set({ cubeType: type }),
      setCubeTheme: (theme) => set({ cubeTheme: theme }),
      addScrambleToHistory: (scramble) => {
        const history = [scramble, ...get().scrambleHistory];
        if (history.length > 5) {
          history.pop();
        }
        set({ scrambleHistory: history });
      },
    }),
    {
      name: 'cubeace-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ 
        solvingMethod: state.solvingMethod,
        cubeType: state.cubeType,
        cubeTheme: state.cubeTheme,
        scrambleHistory: state.scrambleHistory
      }),
    }
  )
);
