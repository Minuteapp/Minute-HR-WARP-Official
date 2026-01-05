// Link-First Chatbot Action Types

export type ChatActionType = 'navigate' | 'form' | 'approve' | 'export' | 'task';

export interface ChatAction {
  id: string;
  type: ChatActionType;
  label: string;
  deepLink: string;
  icon?: string;
  requiresConfirmation?: boolean;
  queryParams?: Record<string, string>;
}

export interface ChatContext {
  dataSource: string;
  permission: string;
  setting?: string;
  legalInfo?: string;
}

export interface BotResponse {
  shortAnswer: string;
  primaryAction: ChatAction;
  secondaryAction?: ChatAction;
  context?: ChatContext;
}

export interface ModuleDeepLink {
  moduleKey: string;
  basePath: string;
  supportedFilters: string[];
  requiresPermission: string;
  icon?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'ai' | 'system';
  timestamp: Date;
  actionData?: BotResponse;
}
