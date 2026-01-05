export interface WBSItem {
  id: string;
  title: string;
  type: 'epic' | 'task' | 'subtask';
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  progress: number;
  assignedTo?: string;
  hoursSpent: number;
  hoursPlanned: number;
  costSpent: number;
  costPlanned: number;
  co2Impact: number;
  dueDate?: string;
  raciCount: number;
  hasChildren: boolean;
}

export interface WBSSubtask extends WBSItem {
  type: 'subtask';
  taskId: string;
}

export interface WBSTask extends WBSItem {
  type: 'task';
  epicId: string;
  subtasks?: WBSSubtask[];
}

export interface WBSEpic extends WBSItem {
  type: 'epic';
  tasks?: WBSTask[];
}

export interface WBSMetrics {
  totalProgress: number;
  hoursSpent: number;
  hoursPlanned: number;
  costSpent: number;
  costPlanned: number;
  co2Impact: number;
  totalEpics: number;
}

export const calculateWBSMetrics = (epics: WBSEpic[]): WBSMetrics => {
  let totalHoursSpent = 0;
  let totalHoursPlanned = 0;
  let totalCostSpent = 0;
  let totalCostPlanned = 0;
  let totalCO2 = 0;
  let totalProgress = 0;
  let itemCount = 0;

  const processItem = (item: WBSItem) => {
    totalHoursSpent += item.hoursSpent;
    totalHoursPlanned += item.hoursPlanned;
    totalCostSpent += item.costSpent;
    totalCostPlanned += item.costPlanned;
    totalCO2 += item.co2Impact;
    totalProgress += item.progress;
    itemCount++;
  };

  epics.forEach(epic => {
    processItem(epic);
    epic.tasks?.forEach(task => {
      processItem(task);
      task.subtasks?.forEach(subtask => {
        processItem(subtask);
      });
    });
  });

  return {
    totalProgress: itemCount > 0 ? Math.round(totalProgress / itemCount) : 0,
    hoursSpent: totalHoursSpent,
    hoursPlanned: totalHoursPlanned,
    costSpent: totalCostSpent,
    costPlanned: totalCostPlanned,
    co2Impact: totalCO2,
    totalEpics: epics.length
  };
};
