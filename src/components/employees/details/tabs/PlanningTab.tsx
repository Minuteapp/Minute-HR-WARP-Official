import { Card } from "@/components/ui/card";
import { Calendar, Users, Clock, TrendingUp, Info } from "lucide-react";
import { Employee } from "@/types/employee.types";

interface PlanningTabProps {
  employee: Employee;
}

export const PlanningTab = ({ employee }: PlanningTabProps) => {
  return (
    <div className="space-y-6">
      {/* Top Row - Wochenplanung & Team-Kapazität */}
      <div className="grid grid-cols-2 gap-6">
        {/* Meine Wochenplanung */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Meine Wochenplanung</span>
            </h3>
          </div>
          
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">Keine Wochenplanung vorhanden</p>
            <p className="text-xs text-muted-foreground">
              Die Wochenplanung wird aus dem Zeiterfassungsmodul übernommen.
            </p>
          </div>
        </Card>

        {/* Team-Kapazität */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>Team-Kapazität</span>
          </h3>
          
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">Keine Kapazitätsdaten verfügbar</p>
            <p className="text-xs text-muted-foreground">
              Team-Kapazitäten werden nach Erfassung von Arbeitszeiten berechnet.
            </p>
          </div>
        </Card>
      </div>

      {/* Geplante Abwesenheiten */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>Geplante Abwesenheiten</span>
          </h3>
        </div>
        
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Keine geplanten Abwesenheiten</p>
          <p className="text-xs text-muted-foreground">
            Geplante Abwesenheiten werden aus dem Abwesenheitsmodul geladen.
          </p>
        </div>
      </Card>

      {/* Ressourcenplanung & Forecast */}
      <Card className="p-6 bg-purple-50/50 border-purple-200">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <span>Ressourcenplanung & Forecast</span>
        </h3>
        
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-purple-300 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Keine Prognosedaten verfügbar</p>
          <p className="text-xs text-muted-foreground">
            Forecasts werden basierend auf historischen Daten erstellt.
          </p>
        </div>

        <div className="mt-4 p-3 bg-purple-100 border border-purple-200 rounded-lg flex items-start gap-2">
          <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Sobald ausreichend Daten vorhanden sind, werden hier KI-basierte Empfehlungen angezeigt.
          </p>
        </div>
      </Card>

      {/* Schichtplanung */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>Schichtplanung</span>
          </h3>
        </div>
        
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Keine Schichtarbeit konfiguriert</p>
          <p className="text-xs text-muted-foreground">
            Bei Bedarf können Schichtmodelle durch HR eingerichtet werden.
          </p>
        </div>
      </Card>
    </div>
  );
};
