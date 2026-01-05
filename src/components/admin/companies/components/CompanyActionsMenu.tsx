
import { Button } from "@/components/ui/button";
import { MoreHorizontal, LogIn, ExternalLink } from "lucide-react";
import { useTenantContext } from "@/hooks/useTenantContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export interface CompanyActionsMenuProps {
  companyId: string;
  companyName?: string;
  companySlug?: string;
  isActive?: boolean;
  onEdit?: (companyId: string) => void;
  onDeactivate?: (companyId: string) => void;
  onDelete?: (companyId: string) => void;
  onViewDetails?: (companyId: string) => void;
  onEditCompany?: (companyId: string) => void;
  onDeactivateCompany?: (companyId: string) => void;
  onDeleteClick?: (companyId: string) => void;
  onLoginAsCompany?: (companyId: string) => void;
  stopPropagation?: boolean;
}

export const CompanyActionsMenu = ({
  companyId,
  companyName,
  companySlug,
  isActive = true,
  onEdit,
  onDeactivate,
  onDelete,
  onViewDetails,
  onEditCompany,
  onDeactivateCompany,
  onDeleteClick,
  onLoginAsCompany,
  stopPropagation = false
}: CompanyActionsMenuProps) => {
  const { setTenantContext } = useTenantContext();
  
  // Determine which handlers to use (support both naming conventions)
  const handleEdit = onEditCompany || onEdit;
  const handleDeactivate = onDeactivateCompany || onDeactivate;
  const handleDelete = onDeleteClick || onDelete;

  const handleOpenPortal = async () => {
    console.log('🚀 Portal öffnen clicked for company:', { companyId, companyName });
    
    if (!companyName) {
      console.error('❌ Company name is missing');
      return;
    }

    // Setze Tenant-Kontext und navigiere zu /employees
    await setTenantContext(companyId, companyName, '/employees');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => stopPropagation && e.stopPropagation()}
          className="hover:bg-gray-100"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="shadow-md">
        {onViewDetails && (
          <DropdownMenuItem onClick={(e) => {
            stopPropagation && e.stopPropagation();
            onViewDetails(companyId);
          }}>
            Details anzeigen
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={(e) => {
          stopPropagation && e.stopPropagation();
          handleOpenPortal();
        }}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Portal öffnen
        </DropdownMenuItem>
        
        {onLoginAsCompany && isActive && (
          <DropdownMenuItem onClick={(e) => {
            stopPropagation && e.stopPropagation();
            onLoginAsCompany(companyId);
          }} className="text-blue-600">
            <LogIn className="mr-2 h-4 w-4" />
            Login als Firma
          </DropdownMenuItem>
        )}
        
        {handleEdit && (
          <DropdownMenuItem onClick={(e) => {
            stopPropagation && e.stopPropagation();
            handleEdit(companyId);
          }}>
            Bearbeiten
          </DropdownMenuItem>
        )}
        
        {handleDeactivate && (
          <DropdownMenuItem 
            onClick={(e) => {
              stopPropagation && e.stopPropagation();
              handleDeactivate(companyId);
            }}
            className={isActive ? "text-orange-600" : "text-green-600"}
          >
            {isActive ? "Deaktivieren" : "Aktivieren"}
          </DropdownMenuItem>
        )}
        
        {handleDelete && (
          <DropdownMenuItem 
            onClick={(e) => {
              stopPropagation && e.stopPropagation();
              handleDelete(companyId);
            }}
            className="text-red-600"
          >
            Löschen
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
