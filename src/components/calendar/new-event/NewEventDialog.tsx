
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { NewEvent } from "@/types/calendar";
import { toast } from "sonner";
import { useNewEventDialog } from "./useNewEventDialog";
import EventFormHeader from "./EventFormHeader";
import EventBasicInfoSection from "./EventBasicInfoSection";
import EventDateTimeSection from "./EventDateTimeSection";
import EventTypeSection from "./EventTypeSection";
import EventDescriptionSection from "./EventDescriptionSection";
import EventParticipantsSection from "./EventParticipantsSection";
import EventLocationSection from "./EventLocationSection";
import EventFormActions from "./EventFormActions";
import EventColorPicker from "./EventColorPicker";
import EventDocumentsSection from "./EventDocumentsSection";

interface NewEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newEvent: NewEvent;
  onNewEventChange: (event: NewEvent) => void;
  onSave: () => void;
}

const NewEventDialog = ({
  isOpen,
  onClose,
  newEvent,
  onNewEventChange,
  onSave
}: NewEventDialogProps) => {
  const {
    startDate,
    endDate,
    address,
    isSaving,
    setIsSaving,
    handleStartDateChange,
    handleEndDateChange,
    handleAddressChange,
    handleTitleChange,
    handleDescriptionChange,
    handleTypeChange,
    handleColorChange,
    handleAllDayChange,
    handleAddParticipant,
    handleRemoveParticipant,
    handleAddDocuments,
    handleRemoveDocument,
    handleChangeDocumentType
  } = useNewEventDialog({
    isOpen,
    onClose,
    newEvent,
    onNewEventChange,
    onSave
  });

  const handleSave = async () => {
    if (!newEvent.title) {
      toast.error("Bitte geben Sie einen Titel ein");
      return;
    }

    try {
      setIsSaving(true);
      
      if (endDate <= startDate) {
        toast.error("Die Endzeit muss nach der Startzeit liegen");
        setIsSaving(false);
        return;
      }
      
      if (!newEvent.color) {
        toast.error("Bitte wählen Sie eine Farbe für den Termin");
        setIsSaving(false);
        return;
      }
      
      await onSave();
      setIsSaving(false);
      onClose();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      setIsSaving(false);
      toast.error("Der Termin konnte nicht gespeichert werden");
    }
  };

  // Überprüfen, ob der Termintyp Dokumente unterstützen sollte
  const isDocumentSupportedType = [
    'interview', 
    'training', 
    'project', 
    'external', 
    'onboarding', 
    'contract'
  ].includes(newEvent.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-3xl sm:max-w-3xl md:max-w-4xl border border-[#3B44F6]">
        <EventFormHeader />

        <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
          <EventBasicInfoSection 
            title={newEvent.title} 
            onTitleChange={handleTitleChange} 
          />

          <EventDateTimeSection
            startDate={startDate}
            endDate={endDate}
            isAllDay={newEvent.isAllDay || false}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            onAllDayChange={handleAllDayChange}
          />

          <EventLocationSection 
            address={address} 
            onAddressChange={handleAddressChange} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EventTypeSection 
              type={newEvent.type} 
              onTypeChange={handleTypeChange} 
            />
            
            <EventColorPicker
              selectedColor={newEvent.color || "blue"}
              onColorChange={handleColorChange}
            />
          </div>

          <EventParticipantsSection 
            participants={newEvent.participants || []}
            onAddParticipant={handleAddParticipant}
            onRemoveParticipant={handleRemoveParticipant}
          />

          <EventDescriptionSection 
            description={newEvent.description} 
            onDescriptionChange={handleDescriptionChange} 
          />

          {isDocumentSupportedType && (
            <EventDocumentsSection
              documents={newEvent.documents || []}
              documentTypes={newEvent.documentTypes || []}
              onAddDocuments={handleAddDocuments}
              onRemoveDocument={handleRemoveDocument}
              onChangeDocumentType={handleChangeDocumentType}
            />
          )}

          <EventFormActions 
            onCancel={onClose} 
            onSave={handleSave}
            disabled={isSaving}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewEventDialog;
