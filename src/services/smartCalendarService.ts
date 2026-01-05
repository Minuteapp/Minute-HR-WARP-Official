
export interface MeetingRoom {
  id: string;
  name: string;
  location?: string;
  capacity: number;
  equipment?: string[];
  features?: Record<string, boolean>;
  room_type: string;
  is_available: boolean;
}

export interface MeetingFollowUp {
  id: string;
  event_id: string;
  task_title: string;
  task_description?: string;
  assigned_to?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
}

export interface SmartSuggestion {
  id: string;
  title: string;
  suggestedTime: string;
  duration: number;
  participants: string[];
  confidence: number;
  reasoning: string;
}

// Mock-Daten für die Entwicklung
export const mockMeetingRooms: MeetingRoom[] = [];

export const mockFollowUpTasks: MeetingFollowUp[] = [];
