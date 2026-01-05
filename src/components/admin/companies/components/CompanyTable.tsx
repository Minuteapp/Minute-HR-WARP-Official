
import { Table, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { CompanyData } from "../types";
import { CompanyTableBody } from "./CompanyTableBody";

interface CompanyTableProps {
  companies: CompanyData[] | undefined;
  isLoading: boolean;
  onEditCompany: (companyId: string) => void;
  onDeactivateCompany: (companyId: string) => void;
  onDeleteClick: (companyId: string) => void;
  onLoginAsCompany?: (companyId: string) => void;
}

export const CompanyTable = ({
  companies,
  isLoading,
  onEditCompany,
  onDeactivateCompany,
  onDeleteClick,
  onLoginAsCompany
}: CompanyTableProps) => {
  return (
    <Table>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Mitarbeiter</TableHead>
          <TableHead>Abo-Status</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <CompanyTableBody 
        companies={companies}
        isLoading={isLoading}
        onEditCompany={onEditCompany}
        onDeactivateCompany={onDeactivateCompany}
        onDeleteClick={onDeleteClick}
        onLoginAsCompany={onLoginAsCompany}
      />
    </Table>
  );
};
