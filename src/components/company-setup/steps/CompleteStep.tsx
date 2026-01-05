import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ArrowRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CompleteStepProps {
  onFinish: () => void;
}

export const CompleteStep = ({ onFinish }: CompleteStepProps) => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    onFinish();
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">Glückwunsch!</h2>
        <p className="text-muted-foreground mt-2">
          Ihre Firma ist erfolgreich eingerichtet.
        </p>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Was Sie jetzt tun können:</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">Mitarbeiter einladen</p>
                  <p className="text-sm text-muted-foreground">
                    Laden Sie Ihr Team zur Plattform ein
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">Zeiterfassung starten</p>
                  <p className="text-sm text-muted-foreground">
                    Beginnen Sie mit der Arbeitszeiterfassung
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium">Module erkunden</p>
                  <p className="text-sm text-muted-foreground">
                    Entdecken Sie alle Funktionen der Plattform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="h-auto py-4"
          onClick={() => navigate('/employees')}
        >
          <div className="text-center">
            <p className="font-medium">Mitarbeiterverwaltung</p>
            <p className="text-xs text-muted-foreground">Team einladen</p>
          </div>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4"
          onClick={() => navigate('/settings')}
        >
          <div className="text-center">
            <p className="font-medium">Einstellungen</p>
            <p className="text-xs text-muted-foreground">Weitere Konfiguration</p>
          </div>
        </Button>
      </div>

      {/* Main CTA */}
      <Button 
        onClick={handleGoToDashboard}
        className="w-full h-12 text-lg"
        size="lg"
      >
        <Home className="h-5 w-5 mr-2" />
        Zum Dashboard
        <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </div>
  );
};
