import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Plus } from "lucide-react";
import { HealthProgram } from "@/integrations/supabase/hooks/useEmployeeHealth";

interface HealthProgramsCardProps {
  programs?: HealthProgram[];
}

export const HealthProgramsCard = ({ programs }: HealthProgramsCardProps) => {
  const activePrograms = programs?.filter(p => p.participation_status === 'participant') || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Gesundheitsprogramme
          {activePrograms.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activePrograms.length} {activePrograms.length === 1 ? 'Programm' : 'Programme'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activePrograms.length === 0 ? (
          <p className="text-muted-foreground">Keine aktiven Programme</p>
        ) : (
          <div className="space-y-3">
            {activePrograms.map((program) => (
              <div key={program.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{program.program_name}</h4>
                    <p className="text-sm text-muted-foreground">{program.program_type}</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-700 border-green-200">
                    Teilnehmer
                  </Badge>
                </div>
                {program.schedule_details && (
                  <div className="text-sm text-muted-foreground pt-2 border-t">
                    <span className="font-medium">Zeitplan: </span>
                    {program.schedule_details}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Weitere Programme entdecken
        </Button>
      </CardContent>
    </Card>
  );
};
