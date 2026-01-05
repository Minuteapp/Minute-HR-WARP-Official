
// KI-Nutzungstypen
export type AIUsageData = {
  userId: string;
  userName: string;
  moduleUsage: ModuleUsageData[];
  totalUsage: number;
  lastUsed: Date;
  department?: string;
  role?: string;
  badge?: AIBadge;
};

export type ModuleUsageData = {
  moduleName: string;
  count: number;
  acceptanceRate?: number;
  lastUsed: Date;
};

export type AIBadge = 'Anfänger' | 'Fortgeschritten' | 'Experte' | 'Early Adopter' | 'Innovator';

// KI-Forschungsprojekt
export type AIResearchProject = {
  id: string;
  title: string;
  description: string;
  status: 'idea' | 'planning' | 'development' | 'testing' | 'review' | 'production' | 'archived';
  startDate: Date;
  estimatedEndDate?: Date;
  actualEndDate?: Date;
  leadResearcher: string;
  team: string[];
  tags: string[];
  goals: string[];
  metrics: AIProjectMetric[];
  testGroup?: string[];
  feedbacks: AIFeedback[];
  documents: AIDocument[];
};

export type AIFeedback = {
  id: string;
  userId: string;
  userName: string;
  content: string;
  rating: number;
  createdAt: Date;
};

export type AIProjectMetric = {
  name: string;
  value: number;
  target: number;
  unit: string;
};

// KI-Governance
export type AIGovernanceRule = {
  id: string;
  title: string;
  description: string;
  scope: 'global' | 'department' | 'role' | 'project';
  scopeTarget?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  status: 'draft' | 'review' | 'active' | 'deprecated';
  approvedBy?: string[];
  dataRestrictions: AIDataRestriction[];
};

export type AIDataRestriction = {
  dataType: string;
  allowedUse: boolean;
  requiresConsent: boolean;
  retentionPeriod?: number;
};

// KI-Aktivitätsprotokoll
export type AIActivityLog = {
  id: string;
  userId: string;
  userName: string;
  action: 'view' | 'create' | 'modify' | 'approve' | 'reject' | 'use';
  target: string;
  timestamp: Date;
  details?: string;
};

// KI-Zukunftsprojekte
export type AIFutureProject = {
  id: string;
  title: string;
  description: string;
  vision: string;
  stage: 'idea' | 'concept' | 'prototype' | 'beta' | 'rollout';
  plannedStartDate?: Date;
  plannedReleaseDate?: Date;
  businessImpact: 'low' | 'medium' | 'high' | 'transformative';
  responsibleTeam: string;
  relatedModules: string[];
  estimatedResourceRequirements: string;
  expectedBenefits: string[];
  potentialRisks: string[];
  votesCount: number;
};

// KI-Dokumententyp
export type AIDocument = {
  id: string;
  title: string;
  type: 'specification' | 'concept' | 'documentation' | 'presentation' | 'report' | 'model';
  url: string;
  createdBy: string;
  createdAt: Date;
  version?: string;
  tags: string[];
};
