
import { useState } from "react";
import { CompanyData } from "./types";
import { CompanyTable } from "./components/CompanyTable";
import { DeleteCompanyDialog } from "./components/DeleteCompanyDialog";

interface CompanyListProps {
  companies: CompanyData[] | undefined;
  isLoading: boolean;
  onEditCompany: (companyId: string) => void;
  onDeactivateCompany: (companyId: string) => void;
  onDeleteCompany?: (companyId: string) => void;
  onLoginAsCompany?: (companyId: string) => void;
}

export const CompanyList = ({ 
  companies, 
  isLoading, 
  onEditCompany, 
  onDeactivateCompany,
  onDeleteCompany,
  onLoginAsCompany
}: CompanyListProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (companyId: string) => {
    setCompanyToDelete(companyId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (companyToDelete && onDeleteCompany) {
      setIsDeleting(true);
      
      // Dialog sofort schließen
      setDeleteDialogOpen(false);
      
      try {
        await onDeleteCompany(companyToDelete);
      } catch (error) {
        console.error("Error deleting company:", error);
      } finally {
        // Mit Verzögerung zurücksetzen, um UI-Updates zu ermöglichen
        setTimeout(() => {
          setIsDeleting(false);
          setCompanyToDelete(null);
        }, 100);
      }
    } else {
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    }
  };

  return (
    <div className="relative overflow-x-auto rounded-md shadow-md border border-primary/40">
      <CompanyTable 
        companies={companies}
        isLoading={isLoading}
        onEditCompany={onEditCompany}
        onDeactivateCompany={onDeactivateCompany}
        onDeleteClick={handleDeleteClick}
        onLoginAsCompany={onLoginAsCompany}
      />

      <DeleteCompanyDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
