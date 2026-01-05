import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, Trash2, CheckSquare } from 'lucide-react';
import { ExtendedTask } from '../hooks/useEnhancedTasks';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
}

interface TaskSubtasksProps {
  task?: ExtendedTask | null;
}

export function TaskSubtasks({ task }: TaskSubtasksProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: '1', title: 'Wireframes erstellen', completed: true },
    { id: '2', title: 'Design-System überarbeiten', completed: false },
    { id: '3', title: 'Responsive Layout testen', completed: false }
  ]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newSubtask: Subtask = {
        id: Date.now().toString(),
        title: newSubtaskTitle.trim(),
        completed: false
      };
      setSubtasks([...subtasks, newSubtask]);
      setNewSubtaskTitle('');
    }
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(prev => prev.map(subtask =>
      subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
    ));
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(subtask => subtask.id !== id));
  };

  const completedCount = subtasks.filter(st => st.completed).length;
  const completionPercentage = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  if (!task) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CheckSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p>Keine Aufgabe ausgewählt</p>
        <p className="text-sm mt-1">Wählen Sie eine Aufgabe aus, um Unteraufgaben zu verwalten.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subtask Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5" />
              <span>Unteraufgaben</span>
            </div>
            <Badge variant="outline">
              {completedCount} von {subtasks.length} erledigt
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subtasks.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Fortschritt</span>
                <span>{Math.round(completionPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Subtask */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Neue Unteraufgabe hinzufügen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Titel der Unteraufgabe..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
            />
            <Button onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subtasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aktuelle Unteraufgaben</CardTitle>
        </CardHeader>
        <CardContent>
          {subtasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>Noch keine Unteraufgaben vorhanden</p>
              <p className="text-sm mt-1">
                Fügen Sie Unteraufgaben hinzu, um große Aufgaben in kleinere Teile zu gliedern.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                    subtask.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => handleToggleSubtask(subtask.id)}
                  />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {subtask.title}
                    </p>
                    {subtask.assignedTo && (
                      <p className="text-xs text-gray-600 mt-1">
                        Zugewiesen an: {subtask.assignedTo}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {subtask.completed && (
                      <Badge variant="secondary" className="text-xs">
                        Erledigt
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subtask Statistics */}
      {subtasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistiken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{subtasks.length}</p>
                <p className="text-sm text-gray-600">Gesamt</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                <p className="text-sm text-gray-600">Erledigt</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{subtasks.length - completedCount}</p>
                <p className="text-sm text-gray-600">Offen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}