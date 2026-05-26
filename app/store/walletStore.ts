import { create } from 'zustand';

interface WalletSummary {
  totalSaved: number;      // kobo
  totalCollected: number;  // kobo
  circlesCompleted: number;
  missedPayments: number;
  activeCircles: number;
}

interface WalletState extends WalletSummary {
  isLoaded: boolean;
  setSummary: (data: WalletSummary) => void;
  reset: () => void;
}

const defaults: WalletSummary = {
  totalSaved: 0,
  totalCollected: 0,
  circlesCompleted: 0,
  missedPayments: 0,
  activeCircles: 0,
};

export const useWalletStore = create<WalletState>((set) => ({
  ...defaults,
  isLoaded: false,
  setSummary: (data) => set({ ...data, isLoaded: true }),
  reset: () => set({ ...defaults, isLoaded: false }),
}));
