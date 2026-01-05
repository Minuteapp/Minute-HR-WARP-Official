import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, User, Calendar, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const columns = [
  { id: 'todo', title: 'Zu erledigen', color: 'bg-gray-100' },
  { id: 'in_progress', title: 'In Bearbeitung', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-yellow-100' },
  { id: 'done', title: 'Erledigt', color: 'bg-green-100' }
];

export const TaskBoard = () => {
  const queryClient = useQueryClient();

  const { data: tasks = [], refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:assigned_to(name),
          creator:created_by(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          ...(newStatus === 'done' && { completed: true, completed_at: new Date().toISOString() })
        })
        .eq('id', draggableId);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Dringend';
      case 'high': return 'Hoch';
      case 'medium': return 'Mittel';
      case 'low': return 'Niedrig';
      default: return 'Normal';
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <Card key={column.id} className={`${column.color} border-0`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-medium">
                {column.title}
                <Badge variant="secondary" className="ml-2">
                  {getTasksByStatus(column.id).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <CardContent
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-3 min-h-96 ${
                    snapshot.isDraggingOver ? 'bg-white/50' : ''
                  }`}
                >
                  {getTasksByStatus(column.id).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                            snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
                          }`}
                        >
                          <CardContent className="p-4 space-y-3">
                            {/* Priority & More Actions */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                                <span className="text-xs text-gray-500">
                                  {getPriorityLabel(task.priority)}
                                </span>
                              </div>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Task Title */}
                            <h3 className="font-medium text-sm line-clamp-2">
                              {task.title}
                            </h3>

                            {/* Task Description */}
                            {task.description && (
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            {/* Labels */}
                            {task.labels && task.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {task.labels.slice(0, 2).map((label: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                                    {label}
                                  </Badge>
                                ))}
                                {task.labels.length > 2 && (
                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                    +{task.labels.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Due Date */}
                            {task.due_date && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(new Date(task.due_date), 'dd.MM.yyyy', { locale: de })}
                                </span>
                                {new Date(task.due_date) < new Date() && (
                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                )}
                              </div>
                            )}

                            {/* Time Estimate */}
                            {task.estimated_hours && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{task.estimated_hours}h geschätzt</span>
                              </div>
                            )}

                            {/* Assigned User */}
                            {task.assigned_to && (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {task.assigned_user?.name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-gray-600">
                                  {task.assigned_user?.name || 'Unbekannt'}
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {getTasksByStatus(column.id).length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-sm">Keine Aufgaben</div>
                    </div>
                  )}
                </CardContent>
              )}
            </Droppable>
          </Card>
        ))}
      </div>
    </DragDropContext>
  );
};