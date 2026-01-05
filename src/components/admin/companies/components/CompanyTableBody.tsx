
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { CompanyData } from "../types";
import { CompanyStatusIndicator } from "./CompanyStatusIndicator";
import { CompanyActionsMenu } from "./CompanyActionsMenu";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { getSubscriptionBadgeVariant } from "../utils";

interface CompanyTableBodyProps {
  companies: CompanyData[] | undefined;
  isLoading: boolean;
  onEditCompany: (companyId: string) => void;
  onDeactivateCompany: (companyId: string) => void;
  onDeleteClick: (companyId: string) => void;
  onLoginAsCompany?: (companyId: string) => void;
}

export const CompanyTableBody = ({
  companies,
  isLoading,
  onEditCompany,
  onDeactivateCompany,
  onDeleteClick,
  onLoginAsCompany
}: CompanyTableBodyProps) => {
  const navigate = useNavigate();

  const handleRowClick = (companyId: string) => {
    // Validiere die companyId vor der Navigation
    if (!companyId || companyId === 'undefined' || companyId === 'null') {
      console.error("Invalid companyId for navigation:", companyId);
      return;
    }
    
    console.log("Navigating to company details for ID:", companyId);
    navigate(`/admin/companies/${companyId}`);
  };

  if (isLoading) {
    return (
      <TableBody>
        {[...Array(5)].map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center">
            Keine Firmen gefunden
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {companies.map((company) => {
        // Verwende id falls company_id nicht verfügbar ist
        const companyId = company.company_id || (company as any).id;
        
        return (
        <TableRow 
          key={companyId}
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => handleRowClick(companyId)}
        >
          <TableCell className="font-medium">{company.company_name}</TableCell>
          <TableCell>{company.employee_count || 0}</TableCell>
          <TableCell>
            <Badge variant={getSubscriptionBadgeVariant(company.subscription_status)}>
              {company.subscription_status || 'Free'}
            </Badge>
          </TableCell>
          <TableCell>
            <CompanyStatusIndicator isActive={company.is_active ?? true} />
          </TableCell>
          <TableCell className="text-right">
            <CompanyActionsMenu 
              companyId={companyId}
              companyName={company.company_name}
              companySlug={company.slug}
              isActive={company.is_active ?? true}
              onEditCompany={() => onEditCompany(companyId)}
              onDeactivateCompany={() => onDeactivateCompany(companyId)}
              onDeleteClick={() => onDeleteClick(companyId)}
              onViewDetails={() => handleRowClick(companyId)}
              onLoginAsCompany={onLoginAsCompany ? () => onLoginAsCompany(companyId) : undefined}
              stopPropagation={true}
            />
          </TableCell>
        </TableRow>
        );
      })}
    </TableBody>
  );
};
