
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TimeEntry } from '@/types/time-tracking.types';
import { useTimeTrackingForm } from "@/hooks/useTimeTrackingForm";
import { useIsMobile } from "@/hooks/use-device-type";
import TimeTrackingForm from "../time-tracking/TimeTrackingForm";
import MobileTimeTrackingForm from "../time-tracking/MobileTimeTrackingForm";
import ManualTimeEntryForm from "../time-tracking/ManualTimeEntryForm";
import { Play, Clock, X } from "lucide-react";

interface TimeTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "start" | "end" | "manual";
  existingEntry?: TimeEntry;
  onSuccess?: (data?: any) => void;
}

const TimeTrackingDialog = ({ 
  open, 
  onOpenChange, 
  mode, 
  existingEntry,
  onSuccess 
}: TimeTrackingDialogProps) => {
  const isMobile = useIsMobile();
  const {
    formData,
    setFormData,
    selectedOfficeName,
    setSelectedOfficeName,
    handleSubmit,
    breaks,
    setBreaks,
    calculateTotalBreakMinutes,
    calculateWorkTime,
    formatMinutesToTime
  } = useTimeTrackingForm({
    mode,
    existingEntry,
    onSuccess,
    onClose: () => onOpenChange(false)
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile 
        ? "p-0 h-[100vh] max-h-[100vh] m-0 rounded-none w-full [&>button]:hidden" 
        : "sm:max-w-[600px] bg-white border-0 flex flex-col max-h-[90vh] p-0 overflow-hidden rounded-2xl [&>button]:hidden"
      }>
        {/* Gradient Header */}
        {!isMobile && (mode === "start" || mode === "manual") && (
          <div className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-6 py-5 relative">
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                {mode === "manual" ? (
                  <Clock className="h-6 w-6 text-[#6366F1]" />
                ) : (
                  <Play className="h-6 w-6 text-[#6366F1] ml-0.5" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {mode === "manual" ? "Zeit manuell erfassen" : "Zeiterfassung starten"}
                </h2>
                <p className="text-white/70 text-sm">
                  {mode === "manual" 
                    ? "Erfassen Sie einen Zeiteintrag nachträglich mit allen Details"
                    : "Erfassen Sie Ihre Arbeitszeit mit allen relevanten Details"
                  }
                </p>
              </div>
            </div>
          </div>
        )}
        {!isMobile && mode === "end" && (
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Vorschau</div>
              <h2 className="text-2xl font-semibold text-slate-800">Zeiterfassung</h2>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        )}
        {isMobile ? (
          mode === 'manual' ? (
            <ManualTimeEntryForm
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              onClose={() => onOpenChange(false)}
              selectedOfficeName={selectedOfficeName}
              setSelectedOfficeName={setSelectedOfficeName}
            />
          ) : (
            <MobileTimeTrackingForm
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              onClose={() => onOpenChange(false)}
              selectedOfficeName={selectedOfficeName}
              setSelectedOfficeName={setSelectedOfficeName}
            />
          )
        ) : (
          <TimeTrackingForm
            mode={mode}
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            onClose={() => onOpenChange(false)}
            selectedOfficeName={selectedOfficeName}
            setSelectedOfficeName={setSelectedOfficeName}
            breaks={breaks}
            onBreaksChange={setBreaks}
            calculateTotalBreakMinutes={calculateTotalBreakMinutes}
            calculateWorkTime={calculateWorkTime}
            formatMinutesToTime={formatMinutesToTime}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TimeTrackingDialog;
