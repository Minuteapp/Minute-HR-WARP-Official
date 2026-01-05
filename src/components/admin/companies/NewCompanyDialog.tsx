
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewCompanyForm } from "./NewCompanyForm";
import { CompanyFormData } from "./types";

interface NewCompanyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: CompanyFormData) => Promise<void>;
  isSubmitting: boolean;
}

export const NewCompanyDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting
}: NewCompanyDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Neue Firma anlegen</DialogTitle>
        </DialogHeader>
        <NewCompanyForm 
          onSubmit={onSubmit} 
          onCancel={() => onOpenChange(false)} 
          isSubmitting={isSubmitting} 
        />
      </DialogContent>
    </Dialog>
  );
};
