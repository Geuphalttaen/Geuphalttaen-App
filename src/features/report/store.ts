import { create } from 'zustand';

interface LocationPickResult {
  lat: number;
  lng: number;
  address: string;
}

interface ReportDraftStore {
  pendingLocation: LocationPickResult | null;
  setPendingLocation: (loc: LocationPickResult) => void;
  clearPendingLocation: () => void;
}

export const useReportDraftStore = create<ReportDraftStore>((set) => ({
  pendingLocation: null,
  setPendingLocation: (loc) => set({ pendingLocation: loc }),
  clearPendingLocation: () => set({ pendingLocation: null }),
}));
