import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Rocket, Building2, Users, Calendar, Settings } from 'lucide-react';
import { useState } from 'react';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
  onImportDefaults: (options: { absenceTypes: boolean; departments: boolean }) => Promise<void>;
  isImporting: boolean;
}

export const WelcomeStep = ({ onNext, onSkip, onImportDefaults, isImporting }: WelcomeStepProps) => {
  const [importAbsenceTypes, setImportAbsenceTypes] = useState(true);
  const [importDepartments, setImportDepartments] = useState(false);

  const handleContinue = async () => {
    if (importAbsenceTypes || importDepartments) {
      await onImportDefaults({
        absenceTypes: importAbsenceTypes,
        departments: importDepartments,
      });
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Rocket className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Willkommen bei Ihrem neuen HR-System!</h2>
        <p className="text-muted-foreground mt-2">
          Lassen Sie uns Ihre Firma in wenigen Schritten einrichten.
        </p>
      </div>

      {/* What we'll set up */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-sm font-medium">Standorte</p>
        </Card>
        <Card className="text-center p-4">
          <Settings className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-sm font-medium">Abteilungen</p>
        </Card>
        <Card className="text-center p-4">
          <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-sm font-medium">Teams</p>
        </Card>
        <Card className="text-center p-4">
          <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-sm font-medium">Module</p>
        </Card>
      </div>

      {/* Default data import options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Deutsche Standard-Stammdaten</CardTitle>
          <CardDescription>
            Optional können wir vorkonfigurierte Stammdaten für Sie anlegen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="absenceTypes"
              checked={importAbsenceTypes}
              onCheckedChange={(checked) => setImportAbsenceTypes(checked as boolean)}
            />
            <div>
              <Label htmlFor="absenceTypes" className="font-medium cursor-pointer">
                Abwesenheitstypen importieren
              </Label>
              <p className="text-sm text-muted-foreground">
                Urlaub, Krankheit, Elternzeit, Sonderurlaub, Homeoffice, etc.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="departments"
              checked={importDepartments}
              onCheckedChange={(checked) => setImportDepartments(checked as boolean)}
            />
            <div>
              <Label htmlFor="departments" className="font-medium cursor-pointer">
                Standard-Abteilungen importieren
              </Label>
              <p className="text-sm text-muted-foreground">
                Geschäftsführung, Personal, IT, Vertrieb, Marketing, etc.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onSkip}>
          Setup überspringen
        </Button>
        <Button onClick={handleContinue} disabled={isImporting}>
          {isImporting ? 'Wird importiert...' : 'Setup starten'}
        </Button>
      </div>
    </div>
  );
};
