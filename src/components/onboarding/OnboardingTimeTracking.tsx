
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { timeTrackingService } from "@/services/timeTrackingService";
import { useToast } from "@/hooks/use-toast";
import TimeTrackingDialog from "@/components/dialogs/TimeTrackingDialog";
import { Play, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const OnboardingTimeTracking = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Query for active time entry
  const { data: activeEntry } = useQuery({
    queryKey: ['activeTimeEntry'],
    queryFn: timeTrackingService.getActiveTimeEntry,
    refetchInterval: 30000
  });

  const handleStartTracking = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Nicht angemeldet",
        description: "Bitte melden Sie sich an, um die Zeiterfassung zu nutzen.",
      });
      navigate('/auth/login');
      return;
    }

    if (activeEntry) {
      toast({
        variant: "destructive",
        title: "Aktive Zeiterfassung",
        description: "Es läuft bereits eine Zeiterfassung. Bitte beenden Sie diese zuerst.",
      });
      return;
    }

    try {
      await timeTrackingService.startTimeTracking({
        location: "office",
        project: "onboarding",
        note: "Started onboarding process",
        user_id: user.id,
        start_time: new Date().toISOString()
      });
      
      toast({
        title: "Zeiterfassung gestartet",
        description: "Ihre Arbeitszeit wird jetzt erfasst.",
      });
    } catch (error) {
      console.error('Error starting time tracking:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Zeiterfassung konnte nicht gestartet werden.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/40">
        <CardHeader>
          <CardTitle>Zeiterfassung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Einstempeln</h3>
                <p className="text-sm text-gray-500">
                  Starten Sie Ihre Zeiterfassung für den Onboarding-Prozess
                </p>
              </div>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Play className="mr-2 h-4 w-4" />
              Starten
            </Button>
          </div>
        </CardContent>
      </Card>

      <TimeTrackingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode="start"
      />
    </div>
  );
};

export default OnboardingTimeTracking;
