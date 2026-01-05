
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { ReportFormData } from "@/types/business-travel";
import { useBusinessTravel } from "@/hooks/useBusinessTravel";
import { Loader2, FileText } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface ReportFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  existingReport?: {
    content: string;
    success_rating: number;
    feedback: string;
  } | null;
}

const ReportFormDialog = ({ 
  open, 
  onOpenChange, 
  tripId,
  existingReport 
}: ReportFormDialogProps) => {
  const { submitReport, isSubmitting } = useBusinessTravel();
  const [successRating, setSuccessRating] = useState(existingReport?.success_rating || 7);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReportFormData>({
    defaultValues: existingReport || {
      content: '',
      success_rating: 7,
      feedback: ''
    }
  });

  const onSubmit = async (data: ReportFormData) => {
    const formData: ReportFormData = {
      ...data,
      success_rating: successRating
    };

    const success = await submitReport(formData);
    
    if (success) {
      reset();
      onOpenChange(false);
    }
  };

  const handleDialogClose = () => {
    if (!isSubmitting) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {existingReport ? "Reisebericht bearbeiten" : "Reisebericht erstellen"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="content">Beschreibung der Dienstreise</Label>
            <Textarea 
              id="content" 
              placeholder="Beschreiben Sie den Verlauf und die Ergebnisse Ihrer Dienstreise..." 
              {...register("content", { required: "Beschreibung ist erforderlich" })}
              rows={6}
            />
            {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
          </div>
          
          <div className="space-y-4">
            <Label>Erfolgsbewertung</Label>
            <div className="space-y-2">
              <Slider
                value={[successRating]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setSuccessRating(value[0])}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Nicht erfolgreich (1)</span>
                <span>Sehr erfolgreich (10)</span>
              </div>
              <div className="text-center font-semibold">
                {successRating}/10
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback & Verbesserungsvorschläge</Label>
            <Textarea 
              id="feedback"
              placeholder="Was lief gut, was hätte besser laufen können? Haben Sie Vorschläge für zukünftige Reisen?"
              {...register("feedback", { required: "Feedback ist erforderlich" })}
              rows={4}
            />
            {errors.feedback && <p className="text-sm text-red-500">{errors.feedback.message}</p>}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleDialogClose} disabled={isSubmitting}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Bericht speichern
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportFormDialog;
