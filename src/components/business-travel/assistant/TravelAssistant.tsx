import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import { useBusinessTravel } from "@/hooks/useBusinessTravel";
import { AssistantStepData, TripFormData } from "@/types/business-travel";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AssistantProgress from "./AssistantProgress";
import DestinationStep from "./steps/DestinationStep";
import PurposeStep from "./steps/PurposeStep";
import TransportStep from "./steps/TransportStep";
import DatesStep from "./steps/DatesStep";
import AccommodationStep from "./steps/AccommodationStep";
import TravelersStep from "./steps/TravelersStep";
import BudgetStep from "./steps/BudgetStep";
import DocumentsStep from "./steps/DocumentsStep";
import SummaryStep from "./steps/SummaryStep";

interface TravelAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TravelAssistant: React.FC<TravelAssistantProps> = ({ open, onOpenChange }) => {
  const { requestTrip, isSubmitting } = useBusinessTravel();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AssistantStepData>({});
  const [savingAsDraft, setSavingAsDraft] = useState(false);

  // Get current user's employee data
  const { data: currentEmployee } = useQuery({
    queryKey: ['current-employee', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, department')
        .eq('user_id', user.id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!user?.id
  });

  const employeeName = currentEmployee 
    ? `${currentEmployee.first_name || ''} ${currentEmployee.last_name || ''}`.trim()
    : user?.email?.split('@')[0] || 'Unbekannt';
  
  const employeeId = currentEmployee?.id || user?.id || '';
  const department = currentEmployee?.department || 'Allgemein';

  const steps = [
    { id: 'destination', title: 'Reiseziel', component: DestinationStep },
    { id: 'purpose', title: 'Reisezweck', component: PurposeStep },
    { id: 'transport', title: 'Transport', component: TransportStep },
    { id: 'dates', title: 'Zeitraum', component: DatesStep },
    { id: 'accommodation', title: 'Unterkunft', component: AccommodationStep },
    { id: 'travelers', title: 'Mitreisende', component: TravelersStep },
    { id: 'budget', title: 'Budget', component: BudgetStep },
    { id: 'documents', title: 'Dokumente', component: DocumentsStep },
    { id: 'summary', title: 'Zusammenfassung', component: SummaryStep }
  ];

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (data: Partial<AssistantStepData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    try {
      const tripData: TripFormData = {
        purpose: formData.purpose || '',
        purpose_type: formData.purpose_type || 'customer_meeting',
        start_date: formData.start_date || '',
        end_date: formData.end_date || '',
        destination: formData.destination || '',
        destination_address: formData.destination_address || '',
        transport: formData.transport || 'car',
        hotel_required: formData.hotel_required || false,
        hotel_details: formData.hotel_details,
        cost_coverage: true,
        cost_center: formData.cost_center,
        budget_id: formData.budget_id,
        project_id: formData.project_id,
        estimated_cost: formData.estimated_cost,
        notes: '',
        employee_name: employeeName,
        employee_id: employeeId,
        department: department,
        supervisor: 'Manager',
        fellow_travelers: formData.fellow_travelers
      };

      const success = await requestTrip(tripData);
      if (success) {
        setFormData({});
        setCurrentStep(0);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error submitting trip request:', error);
    }
  };

  const handleSaveAsDraft = async () => {
    setSavingAsDraft(true);
    setTimeout(() => {
      setSavingAsDraft(false);
      onOpenChange(false);
    }, 1000);
  };

  const closeAssistant = () => {
    setFormData({});
    setCurrentStep(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reise beantragen</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <AssistantProgress steps={steps} currentStep={currentStep} />
          
          <div className="mt-6">
            <CurrentStepComponent 
              data={formData} 
              updateData={updateFormData} 
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              {currentStep > 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Zurück
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {currentStep < steps.length - 1 ? (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleSaveAsDraft}
                    disabled={isSubmitting || savingAsDraft}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Als Entwurf speichern
                  </Button>
                  
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    Weiter
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={closeAssistant}
                    disabled={isSubmitting}
                  >
                    Abbrechen
                  </Button>
                  
                  <Button 
                    type="button" 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Reiseantrag absenden
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TravelAssistant;
