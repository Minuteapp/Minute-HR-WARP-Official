import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Armchair, CheckCircle2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { WorkplaceErgonomics } from "@/integrations/supabase/hooks/useEmployeeHealth";

interface WorkplaceErgonomicsCardProps {
  ergonomics?: WorkplaceErgonomics;
}

export const WorkplaceErgonomicsCard = ({ ergonomics }: WorkplaceErgonomicsCardProps) => {
  if (!ergonomics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Armchair className="h-5 w-5" />
            Ergonomie am Arbeitsplatz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Keine Ergonomie-Analyse verfügbar</p>
        </CardContent>
      </Card>
    );
  }

  const equipmentItems = [
    { label: 'Ergonomischer Bürostuhl', checked: ergonomics.ergonomic_chair },
    { label: 'Höhenverstellbarer Schreibtisch', checked: ergonomics.height_adjustable_desk },
    { label: 'Externe Tastatur & Maus', checked: ergonomics.external_keyboard_mouse },
    { 
      label: ergonomics.monitor_size 
        ? `${ergonomics.monitor_size} Monitor (höhenverstellbar)` 
        : 'Monitor (höhenverstellbar)', 
      checked: ergonomics.adjustable_monitor 
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Armchair className="h-5 w-5" />
          Ergonomie am Arbeitsplatz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {ergonomics.last_analysis_date && (
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Letzte Ergonomie-Analyse</h4>
              {ergonomics.analysis_result === 'passed' && (
                <Badge className="bg-green-500/10 text-green-700 border-green-200">
                  Bestanden
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium">Datum: </span>
                {format(new Date(ergonomics.last_analysis_date), 'dd. MMMM yyyy', { locale: de })}
              </p>
              {ergonomics.analysis_provider && (
                <p>
                  <span className="font-medium">Anbieter: </span>
                  {ergonomics.analysis_provider}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-medium">Ausstattung</h4>
          <div className="space-y-2">
            {equipmentItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 
                  className={`h-5 w-5 ${
                    item.checked ? 'text-green-600' : 'text-muted-foreground'
                  }`} 
                />
                <span className={`text-sm ${!item.checked && 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" className="w-full">
          <Calendar className="h-4 w-4 mr-2" />
          Neue Ergonomie-Beratung anfordern
        </Button>
      </CardContent>
    </Card>
  );
};
