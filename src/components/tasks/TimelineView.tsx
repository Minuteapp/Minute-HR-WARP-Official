interface TimelineViewProps {
  projects: any[];
}

export const TimelineView = ({ projects }: TimelineViewProps) => {
  const months = ['Okt 2025', 'Nov 2025', 'Dez 2025', 'Jan 2026', 'Feb 2026', 'Mrz 2026'];

  const getProjectBarStyle = (projectId: string) => {
    switch (projectId) {
      case '1':
        return { left: '0%', width: '50%', bgClass: 'bg-blue-600' };
      case '2':
        return { left: '0%', width: '33.33%', bgClass: 'bg-blue-600' };
      case '3':
        return { left: '8.33%', width: '91.67%', bgClass: 'bg-blue-400' };
      default:
        return { left: '0%', width: '50%', bgClass: 'bg-blue-500' };
    }
  };

  const getMilestonePositions = (projectId: string) => {
    switch (projectId) {
      case '1':
        return [
          { position: '8%', status: 'completed' },
          { position: '25%', status: 'active' },
          { position: '42%', status: 'planned' }
        ];
      case '2':
        return [
          { position: '5%', status: 'completed' },
          { position: '20%', status: 'active' },
          { position: '30%', status: 'planned' }
        ];
      case '3':
        return [
          { position: '40%', status: 'active' },
          { position: '75%', status: 'planned' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Timeline-Ansicht 2025-2026</h3>
        <p className="text-sm text-gray-600">Visualisierung aller Projekte und Meilensteine auf einer Zeitachse</p>
      </div>

      {/* Timeline Header */}
      <div className="flex items-center gap-4 mb-6 pb-3 border-b">
        <div className="w-48 text-sm font-medium text-gray-700">Projekt</div>
        <div className="flex-1 grid grid-cols-6 gap-2">
          {months.map((month) => (
            <div key={month} className="text-xs text-gray-600 text-center font-medium">{month}</div>
          ))}
        </div>
      </div>

      {/* Timeline Rows */}
      <div className="space-y-6">
        {projects.map((project) => {
          const barStyle = getProjectBarStyle(project.id);
          const milestones = getMilestonePositions(project.id);
          
          return (
            <div key={project.id} className="flex items-center gap-4">
              <div className="w-48">
                <div className="font-medium text-sm text-gray-900">{project.title}</div>
                <div className="text-xs text-gray-500 mt-1">{project.status}</div>
              </div>

              <div className="flex-1 relative h-10">
                {/* Timeline grid background */}
                <div className="absolute inset-0 grid grid-cols-6 gap-2">
                  {months.map((_, idx) => (
                    <div key={idx} className="border-r border-gray-100 last:border-r-0" />
                  ))}
                </div>

                {/* Project bar */}
                <div 
                  className={`absolute top-2 h-6 ${barStyle.bgClass} rounded-lg flex items-center px-3`}
                  style={{ left: barStyle.left, width: barStyle.width }}
                >
                  <span className="text-white text-xs font-medium">{project.progress}%</span>
                  
                  {/* Milestone dots on the bar */}
                  {milestones.map((milestone, idx) => (
                    <div
                      key={idx}
                      className={`absolute h-4 w-4 rounded-full border-2 ${
                        milestone.status === 'completed' 
                          ? 'bg-green-500 border-green-600' 
                          : milestone.status === 'active'
                          ? 'bg-blue-300 border-blue-400'
                          : 'bg-white border-gray-300'
                      }`}
                      style={{ 
                        left: milestone.position, 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        marginLeft: '-8px'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend - Updated according to design */}
      <div className="mt-8 pt-4 border-t flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 bg-blue-700 rounded" />
          <span className="text-gray-600">In Arbeit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 bg-blue-400 rounded" />
          <span className="text-gray-600">Planung</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-gray-600">Abgeschlossener Meilenstein</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full border-2 border-blue-500" />
          <span className="text-gray-600">Aktueller Meilenstein</span>
        </div>
      </div>
    </div>
  );
};
