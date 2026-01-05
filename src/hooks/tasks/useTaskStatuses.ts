
import { useMemo } from 'react';

interface TaskStatusOption {
  id: string;
  name: 'todo' | 'in-progress' | 'review' | 'blocked' | 'done' | 'archived' | 'deleted';
  label: string;
  color: string;
  description?: string;
}

export const useTaskStatuses = () => {
  const statuses = useMemo<TaskStatusOption[]>(() => [
    {
      id: 'todo',
      name: 'todo',
      label: 'Zu erledigen',
      color: '#6B7280',
      description: 'Aufgabe wurde noch nicht begonnen'
    },
    {
      id: 'in-progress',
      name: 'in-progress',
      label: 'In Bearbeitung',
      color: '#3B82F6',
      description: 'Aufgabe wird aktuell bearbeitet'
    },
    {
      id: 'review',
      name: 'review',
      label: 'Review',
      color: '#F59E0B',
      description: 'Aufgabe wird überprüft'
    },
    {
      id: 'blocked',
      name: 'blocked',
      label: 'Blockiert',
      color: '#EF4444',
      description: 'Aufgabe ist blockiert'
    },
    {
      id: 'done',
      name: 'done',
      label: 'Abgeschlossen',
      color: '#10B981',
      description: 'Aufgabe wurde erfolgreich abgeschlossen'
    },
    {
      id: 'archived',
      name: 'archived',
      label: 'Archiviert',
      color: '#9CA3AF',
      description: 'Aufgabe wurde archiviert'
    },
    {
      id: 'deleted',
      name: 'deleted',
      label: 'Gelöscht',
      color: '#6B7280',
      description: 'Aufgabe wurde gelöscht'
    }
  ], []);

  const getStatusByName = (name: string) => {
    return statuses.find(status => status.name === name);
  };

  const getStatusColor = (name: string) => {
    const status = getStatusByName(name);
    return status?.color || '#6B7280';
  };

  const getStatusLabel = (name: string) => {
    const status = getStatusByName(name);
    return status?.label || name;
  };

  return {
    statuses,
    getStatusByName,
    getStatusColor,
    getStatusLabel
  };
};
