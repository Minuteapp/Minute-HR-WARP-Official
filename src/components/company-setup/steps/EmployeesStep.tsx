import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { UserPlus, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmployeesStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const EmployeesStep = ({ onNext, onBack }: EmployeesStepProps) => {
  const { tenantCompany } = useTenant();
  const navigate = useNavigate();
  const [employeeCount, setEmployeeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const companyId = tenantCompany?.id;

  useEffect(() => {
    if (companyId) {
      loadEmployeeCount();
    }
  }, [companyId]);

  const loadEmployeeCount = async () => {
    if (!companyId) return;
    
    const { count } = await supabase
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId);

    setEmployeeCount(count || 0);
    setIsLoading(false);
  };

  const handleGoToEmployees = () => {
    navigate('/employees');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <UserPlus className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Mitarbeiter hinzufügen</h2>
        <p className="text-muted-foreground mt-2">
          Laden Sie Ihre Mitarbeiter zur Plattform ein.
        </p>
      </div>

      {/* Current status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Aktueller Stand
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-primary">{employeeCount}</div>
            <p className="text-muted-foreground">
              {employeeCount === 1 ? 'Mitarbeiter' : 'Mitarbeiter'} registriert
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={handleGoToEmployees}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Mitarbeiter einladen</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Zur Mitarbeiterverwaltung wechseln und Einladungen versenden
              </p>
              <Button variant="outline" className="w-full">
                Zur Mitarbeiterverwaltung
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Später erledigen</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sie können jederzeit über die Mitarbeiterverwaltung neue Mitarbeiter hinzufügen
              </p>
              <Button variant="ghost" className="w-full" onClick={onNext}>
                Schritt überspringen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <CardDescription className="text-center">
            <strong>Tipp:</strong> Sie können Mitarbeiter per E-Mail einladen oder manuell anlegen. 
            Eingeladene Mitarbeiter erhalten automatisch Zugang zur Plattform.
          </CardDescription>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Zurück
        </Button>
        <Button onClick={onNext}>
          Weiter
        </Button>
      </div>
    </div>
  );
};
