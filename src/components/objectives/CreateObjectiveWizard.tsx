import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useObjectiveFormWizard, useCreateObjective } from '@/hooks/useObjectives';
import { ObjectivesService } from '@/services/objectivesService';
import { BasicInfoStep } from './wizard/BasicInfoStep';
import { KeyResultsStep } from './wizard/KeyResultsStep';
import { ResourcesStep } from './wizard/ResourcesStep';
import { ApprovalStep } from './wizard/ApprovalStep';
import { Card } from '@/components/ui/card';

interface CreateObjectiveWizardProps {
  open: boolean;
  onClose: () => void;
}

export const CreateObjectiveWizard = ({ open, onClose }: CreateObjectiveWizardProps) => {
  const {
    formState,
    nextStep,
    prevStep,
    updateData,
    updateKeyResults,
    validateStep,
    resetForm,
    setSuggestions,
    setRiskAssessment,
    setSubmitting
  } = useObjectiveFormWizard();

  const createMutation = useCreateObjective();

  // Load AI suggestions when wizard opens
  useEffect(() => {
    if (open) {
      ObjectivesService.generateSuggestions({
        objective_type: formState.data.objective_type,
        period: formState.data.period_start && formState.data.period_end 
          ? { start: formState.data.period_start, end: formState.data.period_end }
          : undefined
      }).then(setSuggestions);
    }
  }, [open, formState.data.objective_type, formState.data.period_start, formState.data.period_end]);

  // Calculate risk assessment when resources are linked
  useEffect(() => {
    if (formState.currentStep >= 3 && formState.data.title) {
      // Mock risk calculation for wizard
      const mockObjective = {
        id: 'temp',
        ...formState.data,
        progress: 0,
        linked_budgets: formState.data.linked_budgets || [],
        linked_projects: formState.data.linked_projects || [],
        key_results: formState.data.key_results || []
      };

      // Simple risk calculation based on form data
      let riskScore = 30; // Base risk
      
      if (!formState.data.linked_budgets?.length) riskScore += 20;
      if (!formState.data.linked_projects?.length) riskScore += 15;
      if ((formState.data.key_results?.length || 0) > 5) riskScore += 15;
      if (formState.data.priority === 'critical') riskScore += 10;

      setRiskAssessment({
        score: Math.min(riskScore, 100),
        level: riskScore < 40 ? 'low' : riskScore < 70 ? 'medium' : 'high',
        factors: [
          {
            factor: 'Budgetplanung',
            impact: formState.data.linked_budgets?.length ? 0.2 : 0.7,
            description: formState.data.linked_budgets?.length 
              ? 'Budget ist verknüpft' 
              : 'Kein Budget verknüpft'
          },
          {
            factor: 'Projekt-Integration',
            impact: formState.data.linked_projects?.length ? 0.2 : 0.6,
            description: formState.data.linked_projects?.length 
              ? 'Projekte sind verknüpft' 
              : 'Keine Projekte verknüpft'
          },
          {
            factor: 'Komplexität',
            impact: (formState.data.key_results?.length || 0) > 5 ? 0.7 : 0.3,
            description: (formState.data.key_results?.length || 0) > 5 
              ? 'Viele Key Results erhöhen Komplexität' 
              : 'Überschaubare Anzahl Key Results'
          }
        ],
        recommendations: [
          !formState.data.linked_budgets?.length ? 'Budget verknüpfen empfohlen' : '',
          !formState.data.linked_projects?.length ? 'Relevante Projekte verknüpfen' : '',
          'Regelmäßige Statusupdates planen'
        ].filter(Boolean),
        confidence: 0.8
      });
    }
  }, [formState.currentStep, formState.data]);

  const handleNext = () => {
    if (validateStep(formState.currentStep)) {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(formState.currentStep)) return;

    setSubmitting(true);
    try {
      await createMutation.mutateAsync(formState.data as any);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating objective:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Basisdaten';
      case 2: return 'Key Results';
      case 3: return 'Ressourcen & Verlinkungen';
      case 4: return 'Genehmigungen & Automationen';
      default: return '';
    }
  };

  const renderStep = () => {
    switch (formState.currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={formState.data}
            validation={formState.validation}
            suggestions={formState.suggestions}
            onUpdate={updateData}
          />
        );
      case 2:
        return (
          <KeyResultsStep
            keyResults={formState.data.key_results || []}
            validation={formState.validation}
            suggestions={formState.suggestions}
            onUpdate={updateKeyResults}
          />
        );
      case 3:
        return (
          <ResourcesStep
            data={formState.data}
            riskAssessment={formState.riskAssessment}
            onUpdate={updateData}
          />
        );
      case 4:
        return (
          <ApprovalStep
            data={formState.data}
            onUpdate={updateData}
          />
        );
      default:
        return null;
    }
  };

  const progressPercentage = (formState.currentStep / formState.totalSteps) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            Neues Ziel erstellen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Schritt {formState.currentStep} von {formState.totalSteps}</span>
              <span>{Math.round(progressPercentage)}% abgeschlossen</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            
            {/* Step Indicators */}
            <div className="flex justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex flex-col items-center gap-2 ${
                    step <= formState.currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step < formState.currentStep
                        ? 'bg-primary text-primary-foreground'
                        : step === formState.currentStep
                        ? 'bg-primary/20 text-primary border-2 border-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step < formState.currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  <span className="text-xs text-center max-w-20">{getStepTitle(step)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                {getStepTitle(formState.currentStep)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formState.currentStep === 1 && 'Grundlegende Informationen zu Ihrem Ziel'}
                {formState.currentStep === 2 && 'Definieren Sie messbare Key Results'}
                {formState.currentStep === 3 && 'Verknüpfen Sie relevante Ressourcen und bewerten Sie Risiken'}
                {formState.currentStep === 4 && 'Konfigurieren Sie Genehmigungsworkflows und Automationen'}
              </p>
            </div>

            {renderStep()}
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={formState.currentStep === 1 || formState.isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>

            {formState.currentStep < formState.totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={formState.isSubmitting}
              >
                Weiter
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={formState.isSubmitting}
              >
                {formState.isSubmitting ? 'Erstelle...' : 'Ziel erstellen & aktivieren'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};