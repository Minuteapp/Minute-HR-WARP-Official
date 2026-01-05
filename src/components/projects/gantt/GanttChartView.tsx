
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

interface GanttChartViewProps {
  loading: boolean;
  selectedProjectData: any;
}

export const GanttChartView = ({ loading, selectedProjectData }: GanttChartViewProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!selectedProjectData) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Kein Projekt ausgewählt</h3>
        <p className="text-gray-500">Wählen Sie ein Projekt aus, um das Gantt-Chart anzuzeigen.</p>
      </div>
    );
  }

  // Vereinfachte Gantt-Chart-Darstellung
  const tasks = [
    { name: "Projektplanung", start: 0, duration: 20, progress: 100 },
    { name: "Design Phase", start: 15, duration: 30, progress: 80 },
    { name: "Entwicklung", start: 35, duration: 45, progress: 60 },
    { name: "Testing", start: 70, duration: 20, progress: 30 },
    { name: "Deployment", start: 85, duration: 15, progress: 0 }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">{selectedProjectData.name}</h3>
          
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{task.name}</span>
                  <span className="text-xs text-gray-500">{task.progress}%</span>
                </div>
                
                <div className="relative">
                  {/* Timeline Background */}
                  <div className="w-full h-6 bg-gray-100 rounded relative">
                    {/* Task Duration Bar */}
                    <div 
                      className="absolute h-6 bg-blue-200 rounded"
                      style={{ 
                        left: `${task.start}%`, 
                        width: `${task.duration}%` 
                      }}
                    />
                    
                    {/* Progress Bar */}
                    <div 
                      className="absolute h-6 bg-blue-500 rounded"
                      style={{ 
                        left: `${task.start}%`, 
                        width: `${(task.duration * task.progress) / 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Gesamtdauer: 100 Tage</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Fortschritt: {selectedProjectData.progress || 0}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
