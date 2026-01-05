
import { useState, useEffect } from 'react';
import { NewEvent, EventDocumentType } from '@/types/calendar';

interface UseNewEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newEvent: NewEvent;
  onNewEventChange: (event: NewEvent) => void;
  onSave: () => void;
}

export const useNewEventDialog = ({
  newEvent,
  onNewEventChange,
  onSave
}: UseNewEventDialogProps) => {
  const [startDate, setStartDate] = useState<Date>(new Date(newEvent.start));
  const [endDate, setEndDate] = useState<Date>(new Date(newEvent.end));
  const [address, setAddress] = useState<string>(newEvent.location || "");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (newEvent.start) {
      setStartDate(new Date(newEvent.start));
    }
    if (newEvent.end) {
      setEndDate(new Date(newEvent.end));
    }
    setAddress(newEvent.location || "");
  }, [newEvent]);

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
    onNewEventChange({
      ...newEvent,
      start: date.toISOString()
    });
  };

  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
    onNewEventChange({
      ...newEvent,
      end: date.toISOString()
    });
  };

  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
    onNewEventChange({
      ...newEvent,
      location: newAddress
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNewEventChange({
      ...newEvent,
      title: e.target.value
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onNewEventChange({
      ...newEvent,
      description: e.target.value
    });
  };

  const handleTypeChange = (value: string) => {
    onNewEventChange({
      ...newEvent,
      type: value
    });
  };

  const handleColorChange = (color: string) => {
    onNewEventChange({
      ...newEvent,
      color: color
    });
  };

  const handleAllDayChange = (checked: boolean) => {
    if (checked) {
      const newStartDate = new Date(startDate);
      newStartDate.setHours(0, 0, 0, 0);
      
      const newEndDate = new Date(endDate);
      newEndDate.setHours(23, 59, 0, 0);
      
      setStartDate(newStartDate);
      setEndDate(newEndDate);
      
      onNewEventChange({
        ...newEvent,
        isAllDay: checked,
        start: newStartDate.toISOString(),
        end: newEndDate.toISOString()
      });
    } else {
      onNewEventChange({
        ...newEvent,
        isAllDay: checked
      });
    }
  };

  const handleAddParticipant = (participant: string) => {
    if (!participant.trim()) return;
    
    const newParticipants = [...(newEvent.participants || [])];
    if (!newParticipants.includes(participant)) {
      newParticipants.push(participant);
      
      onNewEventChange({
        ...newEvent,
        participants: newParticipants
      });
    }
  };

  const handleRemoveParticipant = (index: number) => {
    const newParticipants = [...(newEvent.participants || [])];
    newParticipants.splice(index, 1);
    
    onNewEventChange({
      ...newEvent,
      participants: newParticipants
    });
  };

  const handleAddDocuments = (files: File[]) => {
    const currentDocuments = newEvent.documents || [];
    const currentTypes = newEvent.documentTypes || [];
    
    // Hinzufügen neuer Dokumente und Standardtyp 'other' für neue Dokumente
    const updatedDocuments = [...currentDocuments, ...files];
    const updatedTypes = [...currentTypes, ...Array(files.length).fill('other' as EventDocumentType)];
    
    onNewEventChange({
      ...newEvent,
      documents: updatedDocuments,
      documentTypes: updatedTypes
    });
  };

  const handleRemoveDocument = (index: number) => {
    const updatedDocuments = [...(newEvent.documents || [])];
    const updatedTypes = [...(newEvent.documentTypes || [])];
    
    updatedDocuments.splice(index, 1);
    updatedTypes.splice(index, 1);
    
    onNewEventChange({
      ...newEvent,
      documents: updatedDocuments,
      documentTypes: updatedTypes
    });
  };

  const handleChangeDocumentType = (index: number, type: EventDocumentType) => {
    const updatedTypes = [...(newEvent.documentTypes || [])];
    updatedTypes[index] = type;
    
    onNewEventChange({
      ...newEvent,
      documentTypes: updatedTypes
    });
  };

  return {
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
  };
};
