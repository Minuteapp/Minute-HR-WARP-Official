import { motion } from 'framer-motion';
import { Project } from '@/types/project.types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProjectHeatmapProps {
  projects: Project[];
}

export const ProjectHeatmap = ({ projects }: ProjectHeatmapProps) => {
  // Generiere Daten für die letzten 7 Tage
  const generateHeatmapData = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simuliere Aktivitätslevel (0-4)
      const activityLevel = Math.floor(Math.random() * 5);
      const projectCount = Math.floor(Math.random() * 8) + 1;
      
      days.push({
        date: date,
        dayName: date.toLocaleDateString('de-DE', { weekday: 'short' }),
        dayNumber: date.getDate(),
        activityLevel,
        projectCount,
        completed: Math.floor(Math.random() * 3),
        started: Math.floor(Math.random() * 2)
      });
    }
    
    return days;
  };

  const heatmapData = generateHeatmapData();

  const getActivityColor = (level: number) => {
    const colors = [
      'bg-muted/30',           // 0 - keine Aktivität
      'bg-green-200',          // 1 - wenig
      'bg-green-300',          // 2 - mittel
      'bg-green-500',          // 3 - hoch
      'bg-green-700'           // 4 - sehr hoch
    ];
    return colors[level];
  };

  const getActivityIntensity = (level: number) => {
    const intensities = ['Keine', 'Wenig', 'Mittel', 'Hoch', 'Sehr hoch'];
    return intensities[level];
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Projekt-Aktivität der letzten 7 Tage</h3>
        <p className="text-sm text-muted-foreground">
          Visualisierung der täglichen Projektaktivitäten
        </p>
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {heatmapData.map((day, index) => (
            <motion.div
              key={day.date.toISOString()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-xs text-muted-foreground mb-1">
                {day.dayName}
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`w-full h-16 rounded-lg border-2 border-background ${getActivityColor(day.activityLevel)} 
                          cursor-pointer transition-all duration-200 hover:border-primary/30 relative group`}
                title={`${day.dayNumber}. - ${getActivityIntensity(day.activityLevel)} Aktivität`}
              >
                <div className="flex flex-col items-center justify-center h-full text-xs font-medium">
                  <div>{day.dayNumber}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {day.projectCount}
                  </div>
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Card className="p-2 text-xs whitespace-nowrap shadow-lg">
                    <div className="font-medium">{day.date.toLocaleDateString('de-DE')}</div>
                    <div>Projekte: {day.projectCount}</div>
                    <div>Abgeschlossen: {day.completed}</div>
                    <div>Gestartet: {day.started}</div>
                    <div>Aktivität: {getActivityIntensity(day.activityLevel)}</div>
                  </Card>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Legende */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Weniger</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`}
              />
            ))}
          </div>
          <span className="text-muted-foreground">Mehr</span>
        </div>
      </div>

      {/* Zusammenfassung */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {heatmapData.reduce((sum, day) => sum + day.completed, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Abgeschlossen</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {heatmapData.reduce((sum, day) => sum + day.started, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Gestartet</div>
          </div>
        </Card>
      </div>
    </div>
  );
};