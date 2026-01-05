import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WizardStep1 } from './WizardStep1';
import { WizardStep2 } from './WizardStep2';
import { WizardStep3 } from './WizardStep3';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateBudgetWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export interface BudgetFormData {
  name: string;
  level: string;
  budgetType: string;
  period: string;
  startDate: string;
  endDate: string;
  department: string;
  amount: number;
  currency: string;
  costCenter: string;
  responsiblePerson: string;
  approver: string;
  description: string;
  distribution: {
    personnel: number;
    operations: number;
    investments: number;
    other: number;
  };
  notificationsEnabled: boolean;
  autoUpdate: boolean;
  tags: string;
}

export const CreateBudgetWizard: React.FC<CreateBudgetWizardProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<BudgetFormData>({
    name: '',
    level: 'department',
    budgetType: 'annual',
    period: '',
    startDate: '',
    endDate: '',
    department: '',
    amount: 0,
    currency: 'EUR',
    costCenter: '',
    responsiblePerson: '',
    approver: '',
    description: '',
    distribution: {
      personnel: 65,
      operations: 20,
      investments: 10,
      other: 5,
    },
    notificationsEnabled: true,
    autoUpdate: false,
    tags: '',
  });

  const updateFormData = (data: Partial<BudgetFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('budget_plans').insert({
        name: formData.name,
        level: formData.level,
        budget_type: formData.budgetType,
        period: formData.period,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        total_amount: formData.amount,
        cost_center: formData.costCenter,
        responsible_person: formData.responsiblePerson,
        approver: formData.approver,
        description: formData.description,
        distribution: formData.distribution,
        notifications_enabled: formData.notificationsEnabled,
        auto_update: formData.autoUpdate,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        status: 'draft',
      });

      if (error) throw error;

      toast({
        title: 'Budget erstellt',
        description: 'Das Budget wurde erfolgreich erstellt.',
      });

      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error creating budget:', error);
      toast({
        title: 'Fehler',
        description: 'Das Budget konnte nicht erstellt werden.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      level: 'department',
      budgetType: 'annual',
      period: '',
      startDate: '',
      endDate: '',
      department: '',
      amount: 0,
      currency: 'EUR',
      costCenter: '',
      responsiblePerson: '',
      approver: '',
      description: '',
      distribution: {
        personnel: 65,
        operations: 20,
        investments: 10,
        other: 5,
      },
      notificationsEnabled: true,
      autoUpdate: false,
      tags: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neues Budget erstellen</DialogTitle>
          <p className="text-sm text-muted-foreground">Schritt {currentStep} von 3</p>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex gap-1 mb-6">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full ${
                step <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <WizardStep1 formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 2 && (
          <WizardStep2 formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 3 && (
          <WizardStep3 formData={formData} updateFormData={updateFormData} />
        )}

        {/* Footer Buttons */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            Zurück
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Abbrechen
            </Button>
            {currentStep < 3 ? (
              <Button onClick={handleNext}>Weiter</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Wird erstellt...' : '+ Budget erstellen'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
