
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Archive, ArrowLeft, Search, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-device-type';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import TaskDetailDialog from '@/components/dialogs/TaskDetailDialog';
import type { Task } from '@/types/tasks';
import { useTasksStore } from '@/stores/useTasksStore';
import { TaskList } from '@/components/tasks/TaskList';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ArchivedTasksPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Archivierte Aufgaben
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const { tasks, isLoading, updateTask, deleteTask } = useTasksStore();
  
  // Daten laden
  useEffect(() => {
    // Archivierte Aufgaben laden
    const loadArchivedTasks = async () => {
      try {
        // Aufgaben mit Status "archived" aus der DB holen
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('status', 'archived');
        
        if (error) throw error;
        
        // Daten in die typsichere Task-Struktur konvertieren
        const typedTasks = (data || []).map(item => ({
          ...item, 
          status: item.status as Task['status'],
          priority: item.priority as 'high' | 'medium' | 'low'
        }));
        
        setArchivedTasks(typedTasks);
      } catch (err) {
        console.error('Fehler beim Laden archivierter Aufgaben:', err);
        toast.error('Fehler beim Laden archivierter Aufgaben');
      }
    };
    
    loadArchivedTasks();
  }, []);

  const handleBackClick = () => {
    navigate('/tasks');
  };

  // Diese Funktion erwartet eine Task-ID (String)
  const handleTaskClick = (taskId: string) => {
    const task = archivedTasks.find(task => task.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsDetailOpen(true);
    }
  };

  const handleRestoreTask = async (taskId: string) => {
    try {
      // Aufgabe auf Status "todo" zurücksetzen
      const success = await updateTask(taskId, { status: 'todo' });
      
      if (success) {
        // Aus archivierten Aufgaben entfernen
        setArchivedTasks(current => current.filter(task => task.id !== taskId));
        toast.success('Aufgabe erfolgreich wiederhergestellt');
        setIsDetailOpen(false);
      }
      return success;
    } catch (error) {
      console.error('Fehler beim Wiederherstellen:', error);
      toast.error('Fehler beim Wiederherstellen der Aufgabe');
      return false;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      if (window.confirm('Möchten Sie diese Aufgabe in den Papierkorb verschieben?')) {
        const success = await deleteTask(taskId);
        if (success) {
          // Aus archivierten Aufgaben entfernen
          setArchivedTasks(current => current.filter(task => task.id !== taskId));
          toast.success('Aufgabe in den Papierkorb verschoben');
          setIsDetailOpen(false);
        }
        return success;
      }
      return false;
    } catch (error) {
      console.error('Fehler beim Verschieben in den Papierkorb:', error);
      toast.error('Fehler beim Verschieben in den Papierkorb');
      return false;
    }
  };

  // Filtere Aufgaben basierend auf der Suchquery
  const filteredTasks = archivedTasks.filter(task => 
    searchQuery.trim() === '' || 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const mobileContent = (
    <div className="flex-1 flex flex-col bg-[#EEF2FF] min-h-screen">
      <div className="bg-[#2c3ad1] py-4 px-4 border-b">
        <div className="flex justify-center items-center">
          <img 
            src="/lovable-uploads/840a513c-5bfd-4036-af4a-70103e900e87.png" 
            alt="Minute Logo" 
            className="h-8 w-auto"
            style={{ filter: 'brightness(0) invert(1)', objectFit: 'contain' }}
          />
        </div>
      </div>
      <main className="flex-1 p-4">
        <div className="bg-white rounded-xl shadow-lg p-4 mb-16">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <Button variant="ghost" size="sm" onClick={handleBackClick}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
              <h2 className="text-lg font-semibold">Archivierte Aufgaben</h2>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Archivierte Aufgaben suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {isLoading ? (
              <div className="text-center p-4">Lade Aufgaben...</div>
            ) : filteredTasks.length > 0 ? (
              <div className="space-y-2">
                {filteredTasks.map(task => (
                  <div 
                    key={task.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      {/* Hier die ID (task.id) übergeben statt der ganzen Task */}
                      <div className="flex-1" onClick={() => handleTaskClick(task.id)}>
                        <h3 className="font-medium">{task.title}</h3>
                        {task.description && <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>}
                      </div>
                      <div className="flex space-x-2 ml-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleRestoreTask(task.id)}
                          title="Wiederherstellen"
                        >
                          <RotateCcw className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDeleteTask(task.id)}
                          title="In den Papierkorb verschieben"
                        >
                          <Archive className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <DashboardContainer
                icon={<Archive className="h-6 w-6 text-gray-400" />}
                title="Keine archivierten Aufgaben"
              >
                <p className="text-sm text-gray-500 text-center mt-2">
                  Es wurden noch keine Aufgaben archiviert.
                </p>
              </DashboardContainer>
            )}
          </div>
        </div>
      </main>
      
      {selectedTask && (
        <TaskDetailDialog
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          task={selectedTask}
          readOnly={true}
        />
      )}
    </div>
  );

  const desktopContent = (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleBackClick}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900">Archivierte Aufgaben</h1>
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Archivierte Aufgaben suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="text-center p-8 bg-white rounded-lg border">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="border rounded-lg bg-white overflow-hidden">
              <div className="p-4">
                <TaskList 
                  tasks={filteredTasks}
                  onTaskClick={handleTaskClick}
                  onTaskComplete={() => Promise.resolve(false)} // Deaktiviert
                  onTaskDelete={handleDeleteTask}
                  customActions={(task) => (
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => { 
                          e.stopPropagation();
                          handleRestoreTask(task.id);
                        }}
                        title="Wiederherstellen"
                      >
                        <RotateCcw className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
                        title="In den Papierkorb verschieben"
                      >
                        <Archive className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border">
              <Archive className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Keine archivierten Aufgaben</h3>
              <p className="text-sm text-gray-500">Es wurden noch keine Aufgaben archiviert.</p>
            </div>
          )}
        </div>
      </main>

      {selectedTask && (
        <TaskDetailDialog
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          task={selectedTask}
          readOnly={true}
        />
      )}
    </div>
  );

  return isMobile ? mobileContent : desktopContent;
};

export default ArchivedTasksPage;
