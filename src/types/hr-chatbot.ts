
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system' | 'ai';
  timestamp: Date;
  attachment?: {
    name: string;
    type: string;
    url: string;
  };
  isVoice?: boolean;
  voiceUrl?: string;
}

export interface ProjectInfo {
  id: string;
  name: string;
  progress: number;
  deadline: string;
  taskCount: number;
  lastActivity: string;
  teamMembers: string[];
}

export interface MeetingInfo {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: string[];
  location: string;
}

export interface ChatSummary {
  id: string;
  topic: string;
  questions: string[];
  nextSteps: string[];
  dueDate?: string;
}

export interface HRChatbotProps {
  calendarEnabled?: boolean;
}
