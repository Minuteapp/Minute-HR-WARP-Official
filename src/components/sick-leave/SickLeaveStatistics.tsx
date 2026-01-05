import { Card } from '@/components/ui/card';
import { Activity, TrendingDown, Calendar, TrendingUp, Inbox } from 'lucide-react';

const KPICard = ({ title, value, icon, subtitle, iconColor }: any) => (
  <Card className="p-4">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold mb-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className={`p-2 rounded-lg ${iconColor}`}>{icon}</div>
    </div>
  </Card>
);

export const SickLeaveStatistics = () => {
  // Echte Daten aus Datenbank - zunächst leere Arrays
  const teamAnalysisData: { name: string; value: number }[] = [];
  const heatmapData: { week: string; days: number[] }[] = [];

  const getHeatmapColor = (value: number) => {
    if (value === 0) return 'bg-gray-100';
    if (value === 1) return 'bg-blue-200';
    if (value === 2) return 'bg-blue-400';
    if (value === 3) return 'bg-blue-600';
    return 'bg-blue-800';
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard 
          title="Gesamt 2025" 
          value="0" 
          subtitle="Mein Team" 
          icon={<Activity className="w-5 h-5 text-purple-600" />} 
          iconColor="bg-purple-50" 
        />
        <KPICard 
          title="Wiederkehrend" 
          value="0" 
          subtitle="Mitarbeitende (>3 Fälle)" 
          icon={<TrendingDown className="w-5 h-5 text-red-600" />} 
          iconColor="bg-red-50" 
        />
        <KPICard 
          title="Saisonale Spitze" 
          value="-" 
          subtitle="Keine Daten" 
          icon={<Calendar className="w-5 h-5 text-orange-600" />} 
          iconColor="bg-orange-50" 
        />
        <KPICard 
          title="KI-Prognose" 
          value="-" 
          subtitle="Keine Daten" 
          icon={<TrendingUp className="w-5 h-5 text-purple-600" />} 
          iconColor="bg-purple-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Krankheitsverteilung nach Kalenderwoche */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Krankheitsverteilung nach Kalenderwoche</h3>
            <TrendingDown className="w-4 h-4 text-gray-400" />
          </div>

          {heatmapData.length > 0 ? (
            <>
              <div className="space-y-2">
                <div className="grid grid-cols-8 gap-1 text-xs text-gray-500 mb-2">
                  <div></div>
                  <div className="text-center">Mo</div>
                  <div className="text-center">Di</div>
                  <div className="text-center">Mi</div>
                  <div className="text-center">Do</div>
                  <div className="text-center">Fr</div>
                  <div className="text-center">Sa</div>
                  <div className="text-center">So</div>
                </div>

                {heatmapData.map((week, idx) => (
                  <div key={idx} className="grid grid-cols-8 gap-1">
                    <div className="text-xs text-gray-600 flex items-center">{week.week}</div>
                    {week.days.map((value, dayIdx) => (
                      <div
                        key={dayIdx}
                        className={`aspect-square rounded ${getHeatmapColor(value)}`}
                        title={`${value} Krankmeldungen`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-600">Weniger</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded bg-gray-100" />
                  <div className="w-3 h-3 rounded bg-blue-200" />
                  <div className="w-3 h-3 rounded bg-blue-400" />
                  <div className="w-3 h-3 rounded bg-blue-600" />
                  <div className="w-3 h-3 rounded bg-blue-800" />
                </div>
                <span className="text-xs text-gray-600">Mehr</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Inbox className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Keine Daten vorhanden</p>
            </div>
          )}
        </Card>

        {/* Team-Analyse nach Bereich */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Team-Analyse nach Bereich</h3>
          </div>

          {teamAnalysisData.length > 0 ? (
            <div className="space-y-4">
              {teamAnalysisData.map((team, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{team.name}</span>
                    <span className="text-sm font-medium text-gray-900">{team.value} Tage</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${(team.value / 45) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Inbox className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Keine Daten vorhanden</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SickLeaveStatistics;