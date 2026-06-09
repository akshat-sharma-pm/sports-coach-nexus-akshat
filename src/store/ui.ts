import { create } from "zustand";

type PanelKind = "athlete" | "injury" | "session" | null;

interface UIState {
  panelKind: PanelKind;
  panelId: string | null;
  openPanel: (kind: Exclude<PanelKind, null>, id: string) => void;
  closePanel: () => void;
  scope: { federationId: string; stateId?: string; academyId?: string; teamId?: string };
  setScope: (s: UIState["scope"]) => void;
}

export const useUI = create<UIState>((set) => ({
  panelKind: null,
  panelId: null,
  openPanel: (kind, id) => set({ panelKind: kind, panelId: id }),
  closePanel: () => set({ panelKind: null, panelId: null }),
  scope: { federationId: "fed-1" },
  setScope: (scope) => set({ scope }),
}));
