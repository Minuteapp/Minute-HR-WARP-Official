import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { WorkTimeModel } from "@/integrations/supabase/hooks/useEmployeeRemoteWork";

interface FlexibleWorkTimeCardProps {
  workTimeModel?: WorkTimeModel;
}

export const FlexibleWorkTimeCard = ({ workTimeModel }: FlexibleWorkTimeCardProps) => {
  if (!workTimeModel) return null;

  const getModelTypeLabel = (type: string) => {
    switch (type) {
      case 'gleitzeit':
        return 'Gleitzeit';
      case '4_day_week':
        return '4-Tage-Woche';
      case 'flexible':
        return 'Flexible Arbeitszeit';
      case 'fixed':
        return 'Feste Arbeitszeit';
      default:
        return type;
    }
  };

  return (
    <Card className="bg-green-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 text-white rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Flexible Arbeitszeitmodelle</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {workTimeModel.description}
              </p>
            </div>
          </div>
          <Badge className="bg-green-500 text-white">
            {workTimeModel.badge_label || getModelTypeLabel(workTimeModel.model_type)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4">
          <div className="text-lg font-semibold mb-1">
            {workTimeModel.model_name}
          </div>
          <div className="text-sm text-muted-foreground">
            Arbeitszeitmodell
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Kernarbeitszeit</div>
            <div className="text-sm font-medium">
              {workTimeModel.core_hours_start} - {workTimeModel.core_hours_end}
            </div>
            <div className="text-xs text-muted-foreground mt-1">(Anwesenheitspflicht)</div>
          </div>
          
          <div className="bg-white rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Gleitzeit-Rahmen</div>
            <div className="text-sm font-medium">
              {workTimeModel.flex_time_start} - {workTimeModel.flex_time_end}
            </div>
            <div className="text-xs text-muted-foreground mt-1">(Erlaubter Zeitraum)</div>
          </div>
          
          <div className="bg-white rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Zeitkonto (aktuell)</div>
            <div className={`text-sm font-medium ${workTimeModel.overtime_balance_current >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {workTimeModel.overtime_balance_current >= 0 ? '+' : ''}{workTimeModel.overtime_balance_current.toFixed(1)} Stunden
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {workTimeModel.overtime_balance_current >= 0 ? '(Überstunden)' : '(Minusstunden)'}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Zeitkonto Max.</div>
            <div className="text-sm font-medium">
              ±{workTimeModel.overtime_balance_max.toFixed(0)} Stunden
            </div>
            <div className="text-xs text-muted-foreground mt-1">(Obergrenze)</div>
          </div>
        </div>
        
        {workTimeModel.available_models && workTimeModel.available_models.length > 0 && (
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">Verfügbare Modelle</h4>
            <ul className="space-y-2">
              {workTimeModel.available_models.map((model: any, index: number) => (
                <li key={index} className="text-sm flex items-center gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span className={model.active ? 'font-medium' : ''}>
                    {model.name}
                    {model.active && <span className="text-xs text-muted-foreground ml-1">(aktuell aktiv)</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
