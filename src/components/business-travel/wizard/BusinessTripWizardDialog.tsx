import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBusinessTravel } from "@/hooks/useBusinessTravel";
import { TripFormData } from "@/types/business-travel";
import { cn } from "@/lib/utils";
import { Loader2, Plane, Euro, FileText, CheckCircle, Check, ChevronLeft, ChevronRight } from "lucide-react";

import WizardStep1TripDetails from "./WizardStep1TripDetails";
import WizardStep2Budget from "./WizardStep2Budget";
import WizardStep3Expenses from "./WizardStep3Expenses";
import WizardStep4Review from "./WizardStep4Review";

interface BusinessTripWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeData?: {
    name: string;
    employeeId: string;
    department: string;
    supervisor: string;
  };
  isAdmin?: boolean;
  employees?: { id: string; name: string }[];
}

const steps = [
  { id: 1, label: "Reisedetails", icon: Plane },
  { id: 2, label: "Kosten & Budget", icon: Euro },
  { id: 3, label: "Spesen & Belege", icon: FileText },
  { id: 4, label: "Prüfung & Absenden", icon: CheckCircle },
];

const BusinessTripWizardDialog = ({
  open,
  onOpenChange,
  employeeData,
  isAdmin = false,
  employees = [],
}: BusinessTripWizardDialogProps) => {
  const { requestTrip, isSubmitting } = useBusinessTravel();
  const [currentStep, setCurrentStep] = useState(1);

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<TripFormData>({
    defaultValues: {
      purpose: "",
      purpose_type: "customer_meeting",
      start_date: "",
      end_date: "",
      destination: "",
      destination_address: "",
      transport: "plane",
      hotel_required: false,
      hotel_details: "",
      cost_coverage: false,
      cost_center: "",
      advance_payment: 0,
      notes: "",
      employee_name: employeeData?.name || "",
      employee_id: employeeData?.employeeId || "",
      department: employeeData?.department || "",
      supervisor: employeeData?.supervisor || "",
      title: "",
      trip_type: "domestic",
      priority: "normal",
      advance_requested: false,
      wizard_expenses: [],
    },
  });

  const handleClose = () => {
    reset();
    setCurrentStep(1);
    onOpenChange(false);
  };

  const onSubmit = async (data: TripFormData) => {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    if (endDate < startDate) {
      alert("Das Enddatum muss nach dem Startdatum liegen.");
      return;
    }

    try {
      const success = await requestTrip(data);
      if (success) {
        handleClose();
      }
    } catch (error) {
      console.error("Error submitting business trip request:", error);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const title = watch("title");
    const destination = watch("destination");
    const startDate = watch("start_date");
    const endDate = watch("end_date");
    const purpose = watch("purpose");

    if (currentStep === 1) {
      return title && destination && startDate && endDate && purpose;
    }
    if (currentStep === 2) {
      return true; // Budget step is optional
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) handleClose();
      else onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plane className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Neue Geschäftsreise erstellen</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Reiseantrag mit KI-Unterstützung und automatischer Budgetprüfung
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between px-4 py-4 bg-muted/30 rounded-lg my-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-1 font-medium hidden md:block",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-8 md:w-16 h-0.5 mx-2",
                      isCompleted ? "bg-green-500" : "bg-muted"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-1 py-2">
          {currentStep === 1 && (
            <WizardStep1TripDetails
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
              isAdmin={isAdmin}
              employees={employees}
            />
          )}
          {currentStep === 2 && (
            <WizardStep2Budget
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />
          )}
          {currentStep === 3 && (
            <WizardStep3Expenses
              setValue={setValue}
              watch={watch}
            />
          )}
          {currentStep === 4 && (
            <WizardStep4Review
              watch={watch}
              register={register}
            />
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="pt-4 border-t gap-2">
          <div className="flex-1">
            {currentStep > 1 && (
              <Button variant="ghost" onClick={handleBack} disabled={isSubmitting}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Zurück
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Abbrechen
          </Button>
          {currentStep < 4 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Weiter
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird eingereicht...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Reiseantrag absenden
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessTripWizardDialog;
