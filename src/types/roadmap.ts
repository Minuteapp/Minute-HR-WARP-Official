export interface Roadmap {
  id: string;
  title: string;
  description?: string;
  vision?: string;
  mission?: string;
  status: 'draft' | 'active' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date: string;
  end_date: string;
  progress: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RoadmapMilestone {
  id: string;
  roadmap_id: string;
  title: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  target_date: string;
  completion_date?: string;
  progress: number;
  dependencies: string[];
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
}

export interface RoadmapGoal {
  id: string;
  roadmap_id: string;
  roadmap_milestone_id?: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'archived' | 'deleted';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  target_date?: string;
  completion_date?: string;
  owner_id?: string;
  team_members: string[];
  kpi_metrics: Record<string, any>;
  success_criteria?: string;
  dependencies: string[];
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface RoadmapConnection {
  id: string;
  roadmap_id: string;
  source_milestone_id: string;
  target_milestone_id: string;
  connection_type: 'depends_on' | 'blocks' | 'related_to';
  created_at: string;
}

export interface RoadmapTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'general' | 'product' | 'tech' | 'marketing' | 'custom';
  template_data: Record<string, any>;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Visual Planning Types
export interface RoadmapNode {
  id: string;
  type: 'milestone' | 'goal' | 'task';
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    status: string;
    priority: string;
    target_date: string;
    progress: number;
  };
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  data?: {
    connection_type: string;
  };
}

export interface CreateRoadmapData {
  title: string;
  description?: string;
  vision?: string;
  mission?: string;
  status?: string;
  priority?: string;
  start_date: string;
  end_date: string;
}

export interface CreateMilestoneData {
  roadmap_id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  target_date: string;
  position_x?: number;
  position_y?: number;
}

export interface CreateRoadmapGoalData {
  roadmap_id: string;
  roadmap_milestone_id?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  target_date?: string;
  success_criteria?: string;
  position_x?: number;
  position_y?: number;
}

export interface CreateRoadmapProjectData {
  roadmap_id: string;
  roadmap_milestone_id?: string;
  roadmap_goal_id?: string;
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
}

export interface CreateRoadmapTaskData {
  roadmap_id: string;
  roadmap_milestone_id?: string;
  roadmap_goal_id?: string;
  roadmap_project_id?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
}

export interface ComprehensiveRoadmapData {
  roadmap: CreateRoadmapData;
  milestones: CreateMilestoneData[];
  goals: CreateRoadmapGoalData[];
  projects: CreateRoadmapProjectData[];
  tasks: CreateRoadmapTaskData[];
}