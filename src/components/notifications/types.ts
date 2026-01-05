export type NotificationType = 
  | "system" 
  | "workflow" 
  | "communication" 
  | "task" 
  | "calendar" 
  | "ai" 
  | "compliance"
  | "personal";

export type NotificationPriority = "critical" | "high" | "normal" | "low";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  archived: boolean;
  favorite: boolean;
  important: boolean;
  source: string;
  sourceIcon?: string;
  actions?: NotificationAction[];
  aiPriority?: number;
  aiReason?: string;
  relatedModule?: string;
  relatedId?: string;
  snoozedUntil?: Date;
}

export interface NotificationAction {
  id: string;
  label: string;
  type: "approve" | "reject" | "view" | "reply" | "custom";
  variant?: "default" | "destructive" | "outline";
}

export interface NotificationFilters {
  type: NotificationType | "all";
  priority?: NotificationPriority;
  showUnreadOnly: boolean;
  showImportantOnly: boolean;
  showArchived: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  source?: string;
}
