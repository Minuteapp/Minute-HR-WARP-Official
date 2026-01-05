
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CompanyAdmin } from "../types";
import { AdminEditForm } from "./AdminEditForm";
import { useEditAdminForm } from "../hooks/useEditAdminForm";

interface EditAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: CompanyAdmin | null;
  onSave: (adminId: string, data: { name: string; phone: string; position: string; salutation: string; }) => Promise<void>;
  companyName: string;
}

export const EditAdminDialog: React.FC<EditAdminDialogProps> = ({
  open,
  onOpenChange,
  admin,
  onSave,
  companyName
}) => {
  const { 
    formData, 
    isSubmitting, 
    handleChange, 
    handleSelectChange, 
    handleSubmit 
  } = useEditAdminForm({
    admin,
    onSave,
    onClose: () => onOpenChange(false)
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Administrator bearbeiten</DialogTitle>
          <DialogDescription>
            Bearbeiten Sie die Daten des Administrators für {companyName}.
          </DialogDescription>
        </DialogHeader>
        
        <AdminEditForm
          admin={admin}
          formData={formData}
          isSubmitting={isSubmitting}
          onSelectChange={handleSelectChange}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
