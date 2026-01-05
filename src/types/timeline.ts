export interface TimelineTask {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'completed' | 'on-track' | 'at-risk' | 'delayed' | 'not-started';
  estimatedHours: number;
  actualHours: number;
  isCritical?: boolean;
  milestones?: TimelineMilestone[];
}

export interface TimelineMilestone {
  id: string;
  date: string;
  status: 'reached' | 'upcoming' | 'critical';
}

export interface TimelineProject {
  id: string;
  title: string;
  progress: number;
  isExpanded: boolean;
  tasks: TimelineTask[];
}
