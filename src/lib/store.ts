/**
 * Global State Management with Zustand
 */

import { create } from 'zustand';
import type { Building, TeamMember, Folder, Bot, OutreachTemplate, SearchFilters, PipelineStage } from '@/types';
import { normalizeBuildingForReportGuardrails, normalizeBuildingsForReportGuardrails } from '@/lib/property-guardrails';

// ============================================================
// Buildings Store
// ============================================================
interface BuildingsState {
  buildings: Building[];
  selectedBuildings: Set<string>;
  activeBuilding: Building | null;
  isLoading: boolean;
  error: string | null;
  filters: SearchFilters;

  setBuildings: (buildings: Building[]) => void;
  addBuildings: (buildings: Building[]) => void;
  updateBuilding: (id: string, data: Partial<Building>) => void;
  removeBuilding: (id: string) => void;
  setActiveBuilding: (building: Building | null) => void;
  toggleSelected: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Persist buildings to localStorage
function saveBuildingsToStorage(buildings: Building[]) {
  try {
    localStorage.setItem('scout_buildings', JSON.stringify(normalizeBuildingsForReportGuardrails(buildings)));
  } catch { /* quota exceeded — skip */ }
}
function loadBuildingsFromStorage(): Building[] {
  try {
    const raw = localStorage.getItem('scout_buildings');
    const buildings = (raw ? JSON.parse(raw) : []) as Building[];
    const normalized = normalizeBuildingsForReportGuardrails(buildings);
    if (raw && JSON.stringify(normalized) !== JSON.stringify(buildings)) {
      localStorage.setItem('scout_buildings', JSON.stringify(normalized));
    }
    return normalized;
  } catch { return []; }
}

export const useBuildingsStore = create<BuildingsState>((set, get) => ({
  buildings: loadBuildingsFromStorage(),
  selectedBuildings: new Set(),
  activeBuilding: null,
  isLoading: false,
  error: null,
  filters: {
    regions: [],
    buildingTypes: [],
    grades: [],
    sortBy: 'score',
    sortOrder: 'desc',
  },

  setBuildings: (buildings) => {
    const normalized = normalizeBuildingsForReportGuardrails(buildings);
    saveBuildingsToStorage(normalized);
    set({ buildings: normalized });
  },
  addBuildings: (newBuildings) =>
    set((state) => {
      // Deduplicate by address (case-insensitive, trimmed) — new buildings win over old
      const normalize = (addr: string) => (addr || '').trim().toLowerCase().replace(/\s+/g, ' ');
      const normalizedNewBuildings = normalizeBuildingsForReportGuardrails(newBuildings);
      const newAddrs = new Set(normalizedNewBuildings.map((b) => normalize(b.address)));
      const deduped = state.buildings.filter((b) => !newAddrs.has(normalize(b.address)));
      const merged = normalizeBuildingsForReportGuardrails([...normalizedNewBuildings, ...deduped]);
      saveBuildingsToStorage(merged);
      return { buildings: merged };
    }),
  updateBuilding: (id, data) =>
    set((state) => {
      const buildings = state.buildings.map((b) => (b.id === id ? normalizeBuildingForReportGuardrails({ ...b, ...data }) : b));
      const activeBuilding =
        state.activeBuilding?.id === id ? normalizeBuildingForReportGuardrails({ ...state.activeBuilding, ...data }) : state.activeBuilding;
      saveBuildingsToStorage(buildings);
      return { buildings, activeBuilding };
    }),
  removeBuilding: (id) =>
    set((state) => ({
      buildings: state.buildings.filter((b) => b.id !== id),
      selectedBuildings: new Set([...state.selectedBuildings].filter((s) => s !== id)),
    })),
  setActiveBuilding: (building) => set({ activeBuilding: building ? normalizeBuildingForReportGuardrails(building) : building }),
  toggleSelected: (id) =>
    set((state) => {
      const next = new Set(state.selectedBuildings);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedBuildings: next };
    }),
  selectAll: () =>
    set((state) => ({
      selectedBuildings: new Set(state.buildings.map((b) => b.id)),
    })),
  clearSelection: () => set({ selectedBuildings: new Set() }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// ============================================================
// Team Store
// ============================================================
interface TeamState {
  members: TeamMember[];
  currentUser: TeamMember | null;
  setMembers: (members: TeamMember[]) => void;
  setCurrentUser: (user: TeamMember | null) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  members: [],
  currentUser: null,
  setMembers: (members) => set({ members }),
  setCurrentUser: (currentUser) => set({ currentUser }),
}));

// ============================================================
// UI Store
// ============================================================
interface UIState {
  sidebarCollapsed: boolean;
  propertyDetailOpen: boolean;
  searchPanelOpen: boolean;
  toggleSidebar: () => void;
  setPropertyDetailOpen: (open: boolean) => void;
  setSearchPanelOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  propertyDetailOpen: false,
  searchPanelOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setPropertyDetailOpen: (open) => set({ propertyDetailOpen: open }),
  setSearchPanelOpen: (open) => set({ searchPanelOpen: open }),
}));
