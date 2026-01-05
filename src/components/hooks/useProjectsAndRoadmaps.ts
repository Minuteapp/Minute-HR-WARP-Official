import { useState } from 'react';

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  roadmapId?: string;
  endDate?: string;
  progress: number;
  assignedUsers?: string[];
}

export interface Roadmap {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'in-progress' | 'completed' | 'at-risk';
  quarter: string;
  year: number;
}

export function useProjectsAndRoadmaps() {
  // KEINE MOCK DATEN MEHR - Leere Arrays für neue Firmen ohne echte Daten
  const [projects] = useState<Project[]>([]);
  const [roadmaps] = useState<Roadmap[]>([]);

  return {
    projects,
    roadmaps
  };
}