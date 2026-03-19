import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { PANEL_CONFIG } from '@/constants/editor-constants';

export interface PanelSizes {
  tools: number;
  preview: number;
  properties: number;
  mainContent: number;
  timeline: number;
}

export type PanelId = keyof PanelSizes;

interface PanelState {
  panels: PanelSizes;
  setPanel: (panel: PanelId, size: number) => void;
  setPanels: (sizes: Partial<PanelSizes>) => void;
  resetPanels: () => void;
}

export const usePanelStore = create<PanelState>()(
  devtools(
    persist(
      immer((set) => ({
        ...PANEL_CONFIG,
        setPanel: (panel, size) =>
          set((state) => {
            state.panels[panel] = size;
          }),
        setPanels: (sizes) =>
          set((state) => {
            Object.assign(state.panels, sizes);
          }),
        resetPanels: () => {
          set(() => ({ ...PANEL_CONFIG }));
        },
      })),
      {
        name: 'panel-sizes',
      },
    ),
    {
      name: 'PanelStore',
      enabled: import.meta.env.MODE === 'development',
    },
  ),
);
