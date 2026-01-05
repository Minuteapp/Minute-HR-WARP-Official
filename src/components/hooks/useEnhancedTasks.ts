import { useState, useMemo } from 'react';

export type UserRole = 'admin' | 'manager' | 'member';

export interface ExtendedTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  projectId?: string;
  roadmapId?: string;
  dependencies: string[];
  blockedBy: string[];
  estimatedHours: number;
  actualHours: number;
  dueDate: string;
  createdAt: string;
  tags?: string[];
  teamMembers?: string[];
  riskLevel: 'low' | 'medium' | 'high';
  aiInsights?: {
    impactOnProject: string;
    impactOnRoadmap: string;
    suggestions: string[];
  };
}

export interface TaskAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  riskyTasks: ExtendedTask[];
  recommendations: string[];
}

export function useEnhancedTasks(userRole: UserRole) {
  // Mock data - in real app this would come from API
  const [tasks] = useState<ExtendedTask[]>([
    {
      id: 'task-1',
      title: 'Homepage Design überarbeiten',
      description: 'Das aktuelle Design entspricht nicht mehr den modernen Standards',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Max Mustermann',
      projectId: 'project-1',
      dependencies: [],
      blockedBy: [],
      estimatedHours: 16,
      actualHours: 8,
      dueDate: '2024-02-15',
      createdAt: '2024-01-10',
      tags: ['design', 'frontend'],
      teamMembers: ['Max Mustermann', 'Anna Schmidt'],
      riskLevel: 'medium',
      aiInsights: {
        impactOnProject: 'Kritischer Pfad für Website-Launch',
        impactOnRoadmap: 'Blockiert Marketing-Kampagne Q1',
        suggestions: ['Zusätzliche Designer einplanen', 'Zwischenmeilensteine definieren']
      }
    },
    {
      id: 'task-2',
      title: 'API Integration testen',
      description: 'Umfassende Tests der neuen API-Endpunkte',
      status: 'todo',
      priority: 'urgent',
      assignee: 'Tom Weber',
      projectId: 'project-1',
      dependencies: ['task-1'],
      blockedBy: [],
      estimatedHours: 12,
      actualHours: 0,
      dueDate: '2024-02-20',
      createdAt: '2024-01-12',
      tags: ['api', 'testing'],
      teamMembers: ['Tom Weber'],
      riskLevel: 'high'
    },
    {
      id: 'task-3',
      title: 'Datenbank Migration',
      description: 'Migration zu neuer Datenbankstruktur',
      status: 'review',
      priority: 'medium',
      assignee: 'Lisa Klein',
      projectId: 'project-2',
      dependencies: [],
      blockedBy: [],
      estimatedHours: 24,
      actualHours: 20,
      dueDate: '2024-02-10',
      createdAt: '2024-01-08',
      tags: ['database', 'migration'],
      teamMembers: ['Lisa Klein', 'Tom Weber'],
      riskLevel: 'low'
    },
    {
      id: 'task-4',
      title: 'Cloud Infrastructure Setup',
      description: 'Aufbau der neuen Cloud-Infrastruktur',
      status: 'todo',
      priority: 'high',
      assignee: 'Anna Schmidt',
      projectId: 'project-3',
      dependencies: [],
      blockedBy: [],
      estimatedHours: 32,
      actualHours: 0,
      dueDate: '2024-02-25',
      createdAt: '2024-01-15',
      tags: ['cloud', 'infrastructure'],
      teamMembers: ['Anna Schmidt', 'Tom Weber'],
      riskLevel: 'medium'
    },
    {
      id: 'task-5',
      title: 'Security Audit durchführen',
      description: 'Umfassende Sicherheitsprüfung aller Systeme',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Lisa Klein',
      projectId: 'project-4',
      dependencies: [],
      blockedBy: [],
      estimatedHours: 16,
      actualHours: 4,
      dueDate: '2024-03-01',
      createdAt: '2024-01-20',
      tags: ['security', 'audit'],
      teamMembers: ['Lisa Klein'],
      riskLevel: 'low'
    },
    {
      id: 'task-6',
      title: 'Website Redesign Konzept',
      description: 'Neues Design-Konzept für die Unternehmenswebsite erstellen',
      status: 'todo',
      priority: 'high',
      assignee: 'Anna Schmidt',
      projectId: 'project-5',
      dependencies: [],
      blockedBy: [],
      estimatedHours: 20,
      actualHours: 0,
      dueDate: '2024-02-18',
      createdAt: '2024-01-22',
      tags: ['design', 'website'],
      teamMembers: ['Anna Schmidt', 'Max Mustermann'],
      riskLevel: 'medium'
    },
    {
      id: 'task-7',
      title: 'Marketing Kampagne planen',
      description: 'Strategie für die neue Marketingkampagne entwickeln',
      status: 'done',
      priority: 'medium',
      assignee: 'Tom Weber',
      projectId: 'project-6',
      dependencies: [],
      blockedBy: [],
      estimatedHours: 12,
      actualHours: 12,
      dueDate: '2024-01-30',
      createdAt: '2024-01-05',
      tags: ['marketing', 'strategy'],
      teamMembers: ['Tom Weber', 'Anna Schmidt'],
      riskLevel: 'low'
    }
  ]);

  const allTasks = useMemo(() => {
    // Filter based on user role
    switch (userRole) {
      case 'member':
        // Members only see their assigned tasks
        return tasks.filter(task => task.assignee === 'Max Mustermann'); // Mock current user
      case 'manager':
      case 'admin':
      default:
        return tasks;
    }
  }, [tasks, userRole]);

  const getTaskDependencies = (taskId: string): ExtendedTask[] => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return [];
    
    return task.dependencies
      .map(depId => tasks.find(t => t.id === depId))
      .filter(Boolean) as ExtendedTask[];
  };

  const getBlockingTasks = (taskId: string): ExtendedTask[] => {
    return tasks.filter(task => task.dependencies.includes(taskId));
  };

  const analyzeProjectRisk = (projectId: string): TaskAnalysis | null => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    if (projectTasks.length === 0) return null;

    const riskyTasks = projectTasks.filter(task => 
      task.riskLevel === 'high' || 
      task.priority === 'urgent' ||
      (new Date(task.dueDate) < new Date() && task.status !== 'done')
    );

    const riskLevel: 'low' | 'medium' | 'high' = 
      riskyTasks.length >= projectTasks.length * 0.5 ? 'high' :
      riskyTasks.length >= projectTasks.length * 0.25 ? 'medium' : 'low';

    const recommendations = [];
    if (riskyTasks.length > 0) {
      recommendations.push('Überprüfen Sie überfällige Aufgaben');
      recommendations.push('Ressourcenallokation überdenken');
    }
    if (riskyTasks.some(t => t.priority === 'urgent')) {
      recommendations.push('Dringende Aufgaben priorisieren');
    }

    return {
      riskLevel,
      riskyTasks,
      recommendations
    };
  };

  return {
    tasks: allTasks,
    allTasks: tasks,
    getTaskDependencies,
    getBlockingTasks,
    analyzeProjectRisk
  };
}