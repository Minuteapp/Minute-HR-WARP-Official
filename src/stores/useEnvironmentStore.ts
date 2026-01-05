
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Initiative {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'archived';
  startDate: string;
  endDate?: string;
  progress: number;
  goals?: string[];
  responsible?: string;
  budget?: number;
  tags?: string[];
  metrics?: Array<{
    name: string;
    value: number;
    target: number;
    unit: string;
  }>;
}

interface EnvironmentState {
  initiatives: Initiative[];
  addInitiative: (initiative: Omit<Initiative, 'id'>) => void;
  updateInitiative: (initiative: Initiative) => void;
  deleteInitiative: (id: string) => void;
}

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
  // Leere Initialisierung - Daten werden aus der Datenbank geladen
  initiatives: [],
  addInitiative: (initiative) => set((state) => ({
    initiatives: [...state.initiatives, { ...initiative, id: uuidv4() }]
  })),
  updateInitiative: (updatedInitiative) => set((state) => ({
    initiatives: state.initiatives.map(initiative => 
      initiative.id === updatedInitiative.id ? updatedInitiative : initiative
    )
  })),
  deleteInitiative: (id) => set((state) => ({
    initiatives: state.initiatives.filter(initiative => initiative.id !== id)
  }))
}));
