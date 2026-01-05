import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCompanySetup } from '@/hooks/useCompanySetup';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { createDefaultMasterData } from '@/components/admin/companies/services/defaultDataService';
import { SetupStepIndicator } from './SetupStepIndicator';
import { WelcomeStep } from './steps/WelcomeStep';
import { LocationsStep } from './steps/LocationsStep';
import { DepartmentsStep } from './steps/DepartmentsStep';
import { TeamsStep } from './steps/TeamsStep';
import { EmployeesStep } from './steps/EmployeesStep';
import { ModulesStep } from './steps/ModulesStep';
import { CompleteStep } from './steps/CompleteStep';
import { Loader2 } from 'lucide-react';

export const CompanySetupWizard = () => {
  const { tenantCompany } = useTenant();
  const { toast } = useToast();
  const {
    currentStep,
    completedSteps,
    isLoading,
    completeStep,
    skipSetup,
    goToStep,
    steps,
  } = useCompanySetup();
  
  const [isImporting, setIsImporting] = useState(false);

  const companyId = tenantCompany?.id;

  const handleImportDefaults = async (options: { absenceTypes: boolean; departments: boolean }) => {
    if (!companyId) return;
    
    setIsImporting(true);
    try {
      await createDefaultMasterData(companyId, options);
      toast({
        title: 'Stammdaten importiert',
        description: 'Die Standard-Stammdaten wurden erfolgreich angelegt.',
      });
    } catch (error: any) {
      toast({
        title: 'Fehler beim Import',
        description: error.message || 'Die Stammdaten konnten nicht importiert werden.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Lade Setup-Wizard...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <WelcomeStep
            onNext={() => completeStep('welcome')}
            onSkip={skipSetup}
            onImportDefaults={handleImportDefaults}
            isImporting={isImporting}
          />
        );
      case 'locations':
        return (
          <LocationsStep
            onNext={() => completeStep('locations')}
            onBack={() => goToStep('welcome')}
          />
        );
      case 'departments':
        return (
          <DepartmentsStep
            onNext={() => completeStep('departments')}
            onBack={() => goToStep('locations')}
          />
        );
      case 'teams':
        return (
          <TeamsStep
            onNext={() => completeStep('teams')}
            onBack={() => goToStep('departments')}
          />
        );
      case 'employees':
        return (
          <EmployeesStep
            onNext={() => completeStep('employees')}
            onBack={() => goToStep('teams')}
          />
        );
      case 'modules':
        return (
          <ModulesStep
            onNext={() => completeStep('modules')}
            onBack={() => goToStep('employees')}
          />
        );
      case 'complete':
        return (
          <CompleteStep
            onFinish={() => {}}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Company Name Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">{tenantCompany?.name}</h1>
          <p className="text-muted-foreground">Firmen-Setup</p>
        </div>

        {/* Step Indicator */}
        {currentStep !== 'complete' && (
          <Card>
            <CardContent className="pt-6">
              <SetupStepIndicator
                steps={steps.filter(s => s !== 'complete')}
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={goToStep}
              />
            </CardContent>
          </Card>
        )}

        {/* Current Step Content */}
        <Card>
          <CardContent className="pt-6">
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanySetupWizard;
