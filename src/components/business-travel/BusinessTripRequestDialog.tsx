
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useBusinessTravel } from "@/hooks/useBusinessTravel";
import { TripFormData } from "@/types/business-travel";
import { Loader2 } from "lucide-react";

// Import form sections
import EmployeeInfoSection from "./form/EmployeeInfoSection";
import TripDetailsSection from "./form/TripDetailsSection";
import AccommodationSection from "./form/AccommodationSection";
import CostManagementSection from "./form/CostManagementSection";
import AdditionalNotesSection from "./form/AdditionalNotesSection";

interface BusinessTripRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeData?: {
    name: string;
    employeeId: string;
    department: string;
    supervisor: string;
  };
}

const BusinessTripRequestDialog = ({ open, onOpenChange, employeeData }: BusinessTripRequestDialogProps) => {
  const { requestTrip, isSubmitting } = useBusinessTravel();
  const [hotelRequired, setHotelRequired] = useState(false);
  const [costCoverage, setCostCoverage] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<TripFormData>({
    defaultValues: {
      purpose: "",
      purpose_type: "customer_meeting",
      start_date: "",
      end_date: "",
      destination: "",
      destination_address: "",
      transport: "car",
      hotel_required: false,
      hotel_details: "",
      cost_coverage: false,
      cost_center: "",
      advance_payment: 0,
      notes: "",
      employee_name: employeeData?.name || "",
      employee_id: employeeData?.employeeId || "",
      department: employeeData?.department || "",
      supervisor: employeeData?.supervisor || ""
    }
  });

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
        reset();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error submitting business trip request:', error);
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) reset();
      onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Dienstreise beantragen</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Mitarbeiter-Informationen */}
            <EmployeeInfoSection register={register} />

            {/* Reisedetails */}
            <TripDetailsSection 
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
              getCurrentDate={getCurrentDate}
            />
            
            {/* Unterkunft */}
            <AccommodationSection 
              register={register}
              setValue={setValue}
              hotelRequired={hotelRequired}
              setHotelRequired={setHotelRequired}
            />

            {/* Kostenübernahme & Budget */}
            <CostManagementSection 
              register={register}
              setValue={setValue}
              costCoverage={costCoverage}
              setCostCoverage={setCostCoverage}
              errors={errors}
            />
            
            {/* Zusätzliche Hinweise */}
            <AdditionalNotesSection register={register} />
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird beantragt...
                </>
              ) : "Reise beantragen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessTripRequestDialog;
