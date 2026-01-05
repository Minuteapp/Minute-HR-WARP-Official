
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { NewEvent, EventDocumentType } from "@/types/calendar";
import EventFormHeader from './new-event/EventFormHeader';
import EventBasicInfoSection from './new-event/EventBasicInfoSection';
import EventDateTimeSection from './new-event/EventDateTimeSection';
import EventLocationSection from './new-event/EventLocationSection';
import EventDescriptionSection from './new-event/EventDescriptionSection';
import EventParticipantsSection from './new-event/EventParticipantsSection';
import EventFormActions from './new-event/EventFormActions';
import EventTypeSection from './new-event/EventTypeSection';
import EventDocumentsSection from './new-event/EventDocumentsSection';
import { useToast } from "@/hooks/use-toast";

interface NewEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newEvent: NewEvent;
  onNewEventChange: (event: NewEvent) => void;
  onSave: () => Promise<boolean>;
}

const NewEventDialog = ({
  isOpen,
  onClose,
  newEvent,
  onNewEventChange,
  onSave,
}: NewEventDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentTypes, setDocumentTypes] = useState<EventDocumentType[]>([]);
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState<Date>(
    newEvent.start ? new Date(newEvent.start) : new Date()
  );
  const [endDate, setEndDate] = useState<Date>(
    newEvent.end ? new Date(newEvent.end) : new Date(Date.now() + 60 * 60 * 1000)
  );

  const handleValueChange = (key: keyof NewEvent, value: any) => {
    onNewEventChange({ ...newEvent, [key]: value });
  };

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
    handleValueChange('start', date.toISOString());
  };

  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
    handleValueChange('end', date.toISOString());
  };

  const handleAllDayChange = (checked: boolean) => {
    handleValueChange('isAllDay', checked);
  };

  const handleSave = async () => {
    if (!newEvent.title.trim()) {
      toast({
        title: "Ungültige Eingabe",
        description: "Bitte geben Sie einen Titel ein.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Füge die Dokumente zum Event hinzu
    onNewEventChange({
      ...newEvent,
      documents,
      documentTypes
    });

    const success = await onSave();
    setIsSubmitting(false);
    
    if (success) {
      setDocuments([]);
      setDocumentTypes([]);
      onClose();
    }
  };

  const handleAddDocuments = (files: File[]) => {
    setDocuments(prev => [...prev, ...files]);
    
    // Füge für jedes neue Dokument einen Standardtyp hinzu
    const newTypes = files.map(() => 'other' as EventDocumentType);
    setDocumentTypes(prev => [...prev, ...newTypes]);
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
    setDocumentTypes(prev => prev.filter((_, i) => i !== index));
  };

  const handleChangeDocumentType = (index: number, type: EventDocumentType) => {
    setDocumentTypes(prev => {
      const updated = [...prev];
      updated[index] = type;
      return updated;
    });
  };

  // Funktion zur Bestimmung, ob Dokumentupload angezeigt werden soll
  const shouldShowDocuments = () => {
    const documentRelevantTypes = ['meeting', 'interview', 'training', 'onboarding', 'contract'];
    return documentRelevantTypes.includes(newEvent.type);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neuer Termin</DialogTitle>
          <DialogDescription className="sr-only">Formular zum Anlegen eines neuen Termins</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <EventFormHeader />

          <EventTypeSection
            type={newEvent.type}
            onTypeChange={(value) => handleValueChange('type', value)}
          />

          <EventBasicInfoSection
            title={newEvent.title}
            onTitleChange={(e) => handleValueChange('title', e.target.value)}
            color={newEvent.color}
            onColorChange={(value) => handleValueChange('color', value)}
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
            address={newEvent.address || ''}
            onAddressChange={(value) => handleValueChange('address', value)}
          />

          <EventDescriptionSection
            description={newEvent.description || ''}
            onDescriptionChange={(value) => handleValueChange('description', value.target.value)}
          />

          <EventParticipantsSection
            participants={newEvent.participants || []}
            onAddParticipant={(value) => {
              const currentParticipants = newEvent.participants || [];
              handleValueChange('participants', [...currentParticipants, value]);
            }}
            onRemoveParticipant={(index) => {
              const participants = [...(newEvent.participants || [])];
              participants.splice(index, 1);
              handleValueChange('participants', participants);
            }}
          />

          {shouldShowDocuments() && (
            <EventDocumentsSection
              documents={documents}
              documentTypes={documentTypes}
              onAddDocuments={handleAddDocuments}
              onRemoveDocument={handleRemoveDocument}
              onChangeDocumentType={handleChangeDocumentType}
            />
          )}

          <EventFormActions
            onCancel={onClose}
            onSave={handleSave}
            disabled={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewEventDialog;
