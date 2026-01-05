import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar, ListTodo } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from '@/hooks/use-device-type';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TodayHeader from './TodayHeader';
import TimeTrackingCard from './cards/TimeTrackingCard';
import { TasksCard } from './cards/TasksCard';
import CalendarCard from './cards/CalendarCard';
import TeamStatusCard from './cards/TeamStatusCard';
import NotificationsCard from './cards/NotificationsCard';
import ProjectsCard from './cards/ProjectsCard';
import DocumentsCard from './cards/DocumentsCard';
import TrainingCard from './cards/TrainingCard';
import GoalsCard from './cards/GoalsCard';
import AIInsightsCard from './cards/AIInsightsCard';
import ApprovalsCard from './cards/ApprovalsCard';
import WeekView from './WeekView';
import MonthView from './MonthView';
import AdminWeekView from './admin/AdminWeekView';
import AdminMonthView from './admin/AdminMonthView';
import { useTodaySettings } from '@/hooks/today/useTodaySettings';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useTodayDragAndDrop } from '@/hooks/today/useTodayDragAndDrop';

const TodayDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [view, setView] = useState<'today' | 'week' | 'month'>('today');
  const { settings, toggleCardVisibility } = useTodaySettings();
  const timeTracking = useTimeTracking();
  const { isAdmin, isSuperAdmin } = useRolePermissions();
  const isAdminRole = isAdmin || isSuperAdmin;
  const { handleDragEnd, getCardsForColumn } = useTodayDragAndDrop();

  const { data: todayEvents = [] } = useQuery({
    queryKey: ['today-events', view],
    queryFn: async () => {
      const today = new Date();
      let startDate = new Date(today);
      let endDate = new Date(today);
      
      if (view === 'week') {
        startDate.setDate(today.getDate() - today.getDay());
        endDate.setDate(startDate.getDate() + 6);
      } else if (view === 'month') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      }
      
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      const { data } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time');
        
      return data || [];
    }
  });

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex flex-col space-y-4 w-full">
        <TodayHeader user={user} />
        
        <Tabs value={view} onValueChange={(v) => setView(v as 'today' | 'week' | 'month')} className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6 mb-6">
            <TabsTrigger 
              value="today"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Heute
            </TabsTrigger>
            <TabsTrigger 
              value="week"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Woche
            </TabsTrigger>
            <TabsTrigger 
              value="month"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Monat
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {view === 'week' ? (
          isAdminRole ? (
            <AdminWeekView darkMode={false} />
          ) : (
            <WeekView darkMode={false} />
          )
        ) : view === 'month' ? (
          isAdminRole ? (
            <AdminMonthView darkMode={false} />
          ) : (
            <MonthView darkMode={false} />
          )
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Linke Spalte */}
              <Droppable droppableId="column-0">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-6 flex flex-col"
                  >
                    {getCardsForColumn(0).map((cardId, index) => {
                      const cardMap: Record<string, JSX.Element | null> = {
                        aiInsights: settings.showAIInsights ? (
                          <AIInsightsCard 
                            darkMode={false} 
                            onToggleVisibility={() => toggleCardVisibility('showAIInsights')} 
                          />
                        ) : null,
                        tasks: settings.showTasks ? (
                          <TasksCard 
                            onSeeAll={() => toast({
                              title: "Zu Aufgaben",
                              description: "Navigation zu allen Aufgaben"
                            })} 
                            darkMode={false} 
                            onToggleVisibility={() => toggleCardVisibility('showTasks')} 
                          />
                        ) : null,
                        goals: settings.showGoals ? (
                          <GoalsCard 
                            darkMode={false} 
                            onToggleVisibility={() => toggleCardVisibility('showGoals')} 
                          />
                        ) : null,
                      };
                      
                      const card = cardMap[cardId];
                      if (!card) return null;
                      
                      return (
                        <Draggable key={cardId} draggableId={`card-${cardId}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`h-[400px] ${snapshot.isDragging ? 'opacity-70' : ''}`}
                            >
                              {card}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              
              {/* Mittlere Spalte */}
              <Droppable droppableId="column-1">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-6 flex flex-col"
                  >
                    {getCardsForColumn(1).map((cardId, index) => {
                      const cardMap: Record<string, JSX.Element | null> = {
                        timeTracking: settings.showTimeTracking ? (
                          <TimeTrackingCard 
                            timeTracking={timeTracking} 
                            darkMode={false} 
                            onToggleVisibility={() => toggleCardVisibility('showTimeTracking')} 
                          />
                        ) : null,
                        notifications: settings.showNotifications ? (
                          <NotificationsCard 
                            darkMode={false} 
                            onToggleVisibility={() => toggleCardVisibility('showNotifications')} 
                          />
                        ) : null,
                        training: settings.showTraining ? (
                          <TrainingCard 
                            darkMode={false} 
                            onToggleVisibility={() => toggleCardVisibility('showTraining')} 
                          />
                        ) : null,
                        teamStatus: settings.showTeamStatus ? (
                          <TeamStatusCard 
                            darkMode={false} 
                            onToggleVisibility={() => toggleCardVisibility('showTeamStatus')} 
                          />
                        ) : null,
                      };
                      
                      const card = cardMap[cardId];
                      if (!card) return null;
                      
                      return (
                        <Draggable key={cardId} draggableId={`card-${cardId}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`h-[400px] ${snapshot.isDragging ? 'opacity-70' : ''}`}
                            >
                              {card}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              
              {/* Rechte Spalte */}
              <Droppable droppableId="column-2">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-6 flex flex-col"
                  >
                    {getCardsForColumn(2).map((cardId, index) => {
                      const cardMap: Record<string, JSX.Element | null> = {
                        calendar: settings.showCalendar ? (
                          <CalendarCard 
                            events={todayEvents} 
                            darkMode={false} 
                            view={view} 
                            onToggleVisibility={() => toggleCardVisibility('showCalendar')} 
                          />
                        ) : null,
                        projects: settings.showProjects ? (
                          <ProjectsCard 
                            darkMode={false} 
                            onToggleVisibility={() => toggleCardVisibility('showProjects')} 
                          />
                        ) : null,
                        approvals: settings.showApprovals ? (
                          <ApprovalsCard 
                            darkMode={false} 
                            onToggleVisibility={() => toggleCardVisibility('showApprovals')} 
                          />
                        ) : null,
                        documents: settings.showDocuments ? (
                          <DocumentsCard 
                            darkMode={false} 
                            onToggleVisibility={() => toggleCardVisibility('showDocuments')} 
                          />
                        ) : null,
                      };
                      
                      const card = cardMap[cardId];
                      if (!card) return null;
                      
                      return (
                        <Draggable key={cardId} draggableId={`card-${cardId}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`h-[400px] ${snapshot.isDragging ? 'opacity-70' : ''}`}
                            >
                              {card}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>
        )}
        
        {isMobile && (
          <div className="fixed bottom-20 right-4 flex flex-col-reverse space-y-reverse space-y-2">
            {!timeTracking.isTracking ? (
              <Button 
                size="icon" 
                className="h-12 w-12 rounded-full shadow-lg bg-primary" 
                onClick={() => timeTracking.handleTimeAction()}
              >
                <Clock className="h-6 w-6" />
              </Button>
            ) : (
              <Button 
                size="icon" 
                className="h-12 w-12 rounded-full shadow-lg bg-red-500 text-white" 
                onClick={() => timeTracking.handleStop()}
              >
                <Clock className="h-6 w-6" />
              </Button>
            )}
            <Button 
              size="icon" 
              className="h-12 w-12 rounded-full shadow-lg bg-blue-500 text-white" 
              onClick={() => toast({
                title: "Neuer Termin",
                description: "Funktion zum Hinzufügen eines Termins"
              })}
            >
              <Calendar className="h-6 w-6" />
            </Button>
            <Button 
              size="icon" 
              className="h-12 w-12 rounded-full shadow-lg bg-green-500 text-white" 
              onClick={() => toast({
                title: "Neue Aufgabe",
                description: "Funktion zum Hinzufügen einer Aufgabe"
              })}
            >
              <ListTodo className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayDashboard;