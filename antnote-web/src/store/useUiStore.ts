import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

/**
 * Example client-UI store (Zustand). Feature stores (auth session, active
 * portfolio, etc.) follow the same shape and live next to this one.
 */
export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
