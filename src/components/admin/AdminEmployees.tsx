
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAdminEmployees } from "./employees/useAdminEmployees";
import { EmployeeSearchBar } from "./employees/EmployeeSearchBar";
import { EmployeeTable } from "./employees/EmployeeTable";
import { EmployeeDialog } from "./employees/EmployeeDialog";

export const AdminEmployees = () => {
  const {
    employees,
    isLoading,
    searchQuery,
    setSearchQuery,
    companyFilter,
    setCompanyFilter,
    companies,
    openDialog,
    setOpenDialog,
    selectedEmployee,
    handleEditEmployee,
    handleDeactivateEmployee,
    handleAddEmployee
  } = useAdminEmployees();

  return (
    <Card className="p-6 border-primary/30 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Mitarbeiterübersicht</h2>
          <p className="text-sm text-muted-foreground">
            Verwaltung aller Mitarbeiter im System
          </p>
        </div>
        <Button onClick={handleAddEmployee} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Neuer Mitarbeiter
        </Button>
      </div>

      <div className="mb-4">
        <EmployeeSearchBar 
          value={searchQuery} 
          onChange={setSearchQuery}
          companyFilter={companyFilter}
          onCompanyFilterChange={setCompanyFilter}
          companies={companies}
        />
        {companyFilter && (
          <p className="text-sm text-muted-foreground mt-2">
            Zeige Mitarbeiter von: <strong>{companies.find(c => c.id === companyFilter)?.name || 'Unbekannt'}</strong>
          </p>
        )}
      </div>
      
      <EmployeeTable
        employees={employees}
        isLoading={isLoading}
        onEdit={handleEditEmployee}
        onDeactivate={handleDeactivateEmployee}
      />

      <EmployeeDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        employee={selectedEmployee}
        companyId={companyFilter}
      />
    </Card>
  );
};
