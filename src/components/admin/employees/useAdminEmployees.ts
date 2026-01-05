
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/types/employee.types";
import { useTenantContext } from "@/hooks/useTenantContext";

interface Company {
  id: string;
  name: string;
}

export const useAdminEmployees = () => {
  const { toast } = useToast();
  const { tenantCompanyId, isInTenantMode } = useTenantContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const queryClient = useQueryClient();

  const { data: employees, isLoading } = useQuery({
    queryKey: ['admin-employees', companyFilter],
    queryFn: async () => {
      console.log('🔍 Firma:', companyFilter);
      
      // KRITISCH: Query nur ausführen wenn Firma gewählt
      if (!companyFilter) {
        console.warn("Kein Firmenfilter gesetzt - keine Mitarbeiter laden");
        return [];
      }

      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          companies!inner(name, id)
        `)
        .eq('company_id', companyFilter)
        .order('name');
      
      console.log('📊 Anzahl Mitarbeiter:', data?.length || 0);
      
      if (error) {
        toast({
          title: "Fehler beim Laden der Mitarbeiter",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      // Transformiere die Daten für die richtige Struktur
      const transformed = (data || []).map(emp => ({
        ...emp,
        company_name: emp.companies?.name || 'Unbekannte Firma',
        company_id: emp.companies?.id || emp.company_id
      })) as Employee[];
      
      return transformed;
    },
    enabled: !!companyFilter // Query nur ausführen wenn Filter gesetzt
  });

  // Firmen für das Filterdropdown abrufen und erste als Standard setzen
  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error("Error fetching companies:", error);
        return;
      }
      
      setCompanies(data || []);
      
      // KRITISCH: Setze erste Firma als Standard wenn noch keine gewählt
      if (data && data.length > 0 && !companyFilter) {
        setCompanyFilter(data[0].id);
      }
    };
    
    fetchCompanies();
  }, []);

  const filteredEmployees = employees?.filter(employee => {
    // Filter nach Suchbegriff
    const matchesSearch = 
      employee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.team?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenDialog(true);
  };

  const handleDeactivateEmployee = async (employeeId: string) => {
    const { error } = await supabase
      .from('employees')
      .update({ 
        archived: true,
        archived_at: new Date().toISOString(),
        status: 'inactive'
      })
      .eq('id', employeeId);

    if (error) {
      toast({
        title: "Fehler bei Deaktivierung",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Mitarbeiter deaktiviert",
      description: "Der Mitarbeiter wurde archiviert und deaktiviert."
    });
    queryClient.invalidateQueries({ queryKey: ['admin-employees', companyFilter] });
  };

  const handleAddEmployee = async () => {
    // Prüfe ob eine Firma ausgewählt ist
    if (!companyFilter) {
      toast({
        variant: "destructive",
        title: "Keine Firma ausgewählt",
        description: "Bitte wählen Sie zuerst eine Firma aus, bevor Sie einen Mitarbeiter anlegen."
      });
      return;
    }
    
    setSelectedEmployee(null);
    setOpenDialog(true);
  };

  return {
    employees: filteredEmployees,
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
  };
};
