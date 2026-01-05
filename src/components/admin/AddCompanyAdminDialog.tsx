
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminCreateForm } from "./companies/hooks/useAdminCreateForm";
import { AdminCreateForm } from "./companies/components/AdminCreateForm";

interface AddCompanyAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAdmin: (email: string, name: string, phone: string, position: string, salutation: string, password?: string, createDirectly?: boolean) => void;
  companyName: string;
}

const AddCompanyAdminDialog: React.FC<AddCompanyAdminDialogProps> = ({ 
  open, 
  onOpenChange, 
  onAddAdmin, 
  companyName 
}: AddCompanyAdminDialogProps) => {
  const { 
    formData, 
    errors, 
    isSubmitting, 
    handleChange, 
    handleSelectChange,
    handleCheckboxChange,
    handleSubmit, 
    handleCancel 
  } = useAdminCreateForm({
    onAddAdmin,
    onClose: () => onOpenChange(false)
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Administrator hinzufügen (Version 2.0)</DialogTitle>
          <DialogDescription>
            Fügen Sie einen neuen Administrator für {companyName} hinzu. Neu: Direktes Erstellen mit Passwort für Tests verfügbar.
          </DialogDescription>
        </DialogHeader>

        <AdminCreateForm
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          handleCheckboxChange={handleCheckboxChange}
          handleSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddCompanyAdminDialog;
