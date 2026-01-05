
import { useState } from 'react';
import { UserPlus, Archive, Upload, Users2, Zap, Settings, Edit, Sparkles, Search, Trash2, FileText, ChevronDown, RefreshCw, Download, User, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import AddEmployeeDialog from '../dialogs/AddEmployeeDialog';
import AddEmployeeDialogMobile from '../dialogs/AddEmployeeDialogMobile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import EmployeeFilters from './EmployeeFilters';
import EmployeeListTable from './EmployeeListTable';
import { Employee } from '@/types/employee.types';
import { Input } from '../ui/input';
import { useTenant } from '@/contexts/TenantContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useIsMobile } from '@/components/ui/use-mobile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from '../ui/card';

const EmployeeList = () => {
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { tenantCompany, isSuperAdmin } = useTenant();
  const { currentCompany } = useCompany();
  const isMobile = useIsMobile();
  
  // Superadmins können immer Mitarbeiter anlegen
  const canAddEmployees = true;
  
  // Company ID aus user_roles laden
  const { data: userRole } = useQuery({
    queryKey: ['user-role-company'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('company_id, role')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });
  
  // Company ID: Priorisiere tenantCompany, dann currentCompany, dann userRole
  const companyId = tenantCompany?.id || currentCompany?.id || userRole?.company_id;

  const { data: employees = [], refetch, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees', companyId, tenantCompany?.id],
    queryFn: async () => {
      console.log('🔍 Fetching employees for company:', {
        companyId,
        tenantCompanyId: tenantCompany?.id,
        isSuperAdmin
      });
      
      let query = supabase
        .from('employees')
        .select('*')
        .eq('archived', false);
      
      // KRITISCH: Filter nach company_id wenn vorhanden
      if (companyId) {
        console.log('🔒 Filtering employees by company_id:', companyId);
        query = query.eq('company_id', companyId);
      } else {
        console.warn('⚠️ No companyId found - showing all employees (SuperAdmin fallback)');
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching employees:', error);
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Mitarbeiter konnten nicht geladen werden: " + error.message,
        });
        throw error;
      }
      
      console.log(`✅ Loaded ${data.length} employees for company ${companyId}`);
      
      return data.map(employee => ({
        ...employee,
        status: employee.status === 'active' ? 'active' : 'inactive'
      } as Employee));
    },
    enabled: !!companyId || isSuperAdmin // Query nur ausführen wenn companyId vorhanden oder SuperAdmin
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Company ID wird bereits oben definiert

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // ✅ VERWENDE RPC-Funktion für jeden Mitarbeiter
        let successCount = 0;
        let errorCount = 0;
        
        for (const row of jsonData as any[]) {
          const fullName = `${row.firstName || ''} ${row.lastName || ''}`.trim();
          
          try {
            const { error } = await supabase.rpc(
              'create_employee_without_company_id',
              {
                p_first_name: row.firstName || 'Unbekannt',
                p_last_name: row.lastName || '',
                p_name: fullName || null,
                p_email: row.email || null,
                p_position: row.position || null,
                p_department: row.department || null,
                p_team: row.team || null,
                p_employee_number: row.employeeNumber || null,
                p_employment_type: row.employmentType || 'full_time',
                p_start_date: row.startDate || null,
                p_onboarding_required: false,
                p_company_id: companyId
              }
            );
            
            if (error) throw error;
            successCount++;
          } catch (err) {
            console.error('❌ Fehler beim Import von Mitarbeiter:', fullName, err);
            errorCount++;
          }
        }

        toast({
          title: errorCount > 0 ? "Import teilweise erfolgreich" : "Erfolg",
          description: `${successCount} Mitarbeiter importiert${errorCount > 0 ? `, ${errorCount} fehlgeschlagen` : ''}.`,
          variant: errorCount > 0 ? "destructive" : "default"
        });
        
        queryClient.invalidateQueries({ queryKey: ['employees'] });
      };
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim Import",
        description: error.message,
      });
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employee_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTeam = teamFilter === 'all' || employee.team === teamFilter;
    const matchesEmploymentType = employmentTypeFilter === 'all' || employee.employment_type === employmentTypeFilter;
    const matchesLocation = locationFilter === 'all' || employee.location === locationFilter;
    const matchesPosition = positionFilter === 'all' || employee.position === positionFilter;

    return matchesSearch && matchesTeam && matchesEmploymentType && matchesLocation && matchesPosition;
  });

  const handleExportToExcel = () => {
    const exportData = filteredEmployees.map(emp => ({
      Name: emp.name,
      'Mitarbeiternummer': emp.employee_number || '',
      Team: emp.team || '',
      Position: emp.position || '',
      Beschäftigung: emp.employment_type ? 
        emp.employment_type === 'full_time' ? 'Vollzeit' :
        emp.employment_type === 'part_time' ? 'Teilzeit' :
        emp.employment_type === 'temporary' ? 'Befristet' :
        emp.employment_type === 'freelance' ? 'Freiberuflich' :
        'Praktikant' : '',
      Email: emp.email || '',
      Status: emp.status === 'active' ? 'Aktiv' : 'Inaktiv'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mitarbeiter");
    XLSX.writeFile(wb, "Mitarbeiterliste.xlsx");
  };

  const clearFilters = () => {
    setTeamFilter('all');
    setEmploymentTypeFilter('all');
    setSearchQuery('');
  };

  // Aktive Mitarbeiter zählen (nicht archivierte)
  const activeEmployeeCount = employees.filter(emp => !emp.archived).length;

  // Mobile Ansicht
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 pb-6">
        {/* Header */}
        <div className="bg-white px-3 py-2 border-b sticky top-0 z-10">
          <div className="flex items-center gap-1.5 mb-2">
            <Users2 className="w-4 h-4 text-primary" />
            <h1 className="text-[11px] font-semibold">Mitarbeiterverwaltung</h1>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="bg-gray-700 text-white text-[8px] px-1.5 py-0.5 h-4">
              Vorschau
            </Badge>
            
            <Select defaultValue="hr">
              <SelectTrigger className="w-16 h-5 text-[9px] bg-purple-50 border-purple-200">
                <div className="flex items-center gap-1">
                  <User className="h-2.5 w-2.5 text-purple-600" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="ghost" size="icon" className="h-5 w-5 flex-shrink-0">
              <Settings className="h-3 w-3" />
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1 justify-start text-[10px] h-6 px-2"
            >
              <Edit className="h-2.5 w-2.5 mr-1" />
              Profil bearbeiten
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2.5">
          {/* Title and Count */}
          <div className="flex items-baseline gap-1.5">
            <h2 className="text-[15px] font-bold">Mitarbeiter</h2>
            <span className="text-[10px] text-gray-600">{activeEmployeeCount.toLocaleString()}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <FileText className="h-3.5 w-3.5" />
            </Button>
            <Button 
              className="flex-1 h-8 bg-primary text-white text-xs"
              onClick={() => setShowAddEmployee(true)}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Mitarbeiter hinzufügen
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
            <Input
              placeholder="Suche nach Name, Email, Mitarbeiternr. oder Team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-white h-8 text-[11px]"
            />
          </div>

          {/* Filters */}
          <div className="space-y-1.5">
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-full bg-white h-8 text-[11px]">
                <SelectValue placeholder="Alle Teams" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="all">Alle Teams</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Allgemein">Allgemein</SelectItem>
              </SelectContent>
            </Select>

            <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
              <SelectTrigger className="w-full bg-white h-8 text-[11px]">
                <SelectValue placeholder="Alle Arten" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="all">Alle Arten</SelectItem>
                <SelectItem value="full_time">Vollzeit</SelectItem>
                <SelectItem value="part_time">Teilzeit</SelectItem>
                <SelectItem value="temporary">Befristet</SelectItem>
                <SelectItem value="freelance">Freiberuflich</SelectItem>
                <SelectItem value="intern">Praktikant</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full bg-white h-8 text-[11px]">
                <SelectValue placeholder="Alle Standorte" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="all">Alle Standorte</SelectItem>
                <SelectItem value="Berlin">Berlin</SelectItem>
                <SelectItem value="München">München</SelectItem>
                <SelectItem value="Hamburg">Hamburg</SelectItem>
                <SelectItem value="Frankfurt">Frankfurt</SelectItem>
              </SelectContent>
            </Select>

            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-full bg-white h-8 text-[11px]">
                <SelectValue placeholder="Alle Positionen" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="all">Alle Positionen</SelectItem>
                <SelectItem value="Entwickler">Entwickler</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Designer">Designer</SelectItem>
                <SelectItem value="Analyst">Analyst</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Refresh and Download Icons */}
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refetch()}>
              <RefreshCw className="h-3.5 w-3.5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExportToExcel}>
              <Download className="h-3.5 w-3.5 text-gray-600" />
            </Button>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-1.5 flex items-start gap-1.5">
            <Zap className="h-3 w-3 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-[9px] text-blue-800 leading-tight">
              <p className="font-medium">Optimierte Darstellung für {filteredEmployees.length.toLocaleString()} Mitarbeiter • Seite 1 von {Math.ceil(filteredEmployees.length / 50)}</p>
              <p>• Zeige 1-{Math.min(50, filteredEmployees.length)} von {filteredEmployees.length.toLocaleString()}</p>
            </div>
          </div>

          {/* Employee Cards */}
          <div className="space-y-2">
            {filteredEmployees.length === 0 ? (
              <Card className="p-5 text-center">
                <p className="text-gray-500 text-xs">Keine Mitarbeiter gefunden</p>
              </Card>
            ) : (
              filteredEmployees.slice(0, 50).map((employee) => (
                <Link key={employee.id} to={`/employees/profile/${employee.id}`}>
                  <Card className="p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-2.5">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-gray-600">
                          {employee.first_name?.[0]}{employee.last_name?.[0]}
                        </span>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1.5">
                          <div>
                            <h3 className="font-semibold text-[13px] leading-tight">{employee.name}</h3>
                            <p className="text-[9px] text-gray-600 mt-0.5">{employee.team || 'Kein Team'}</p>
                          </div>
                          <Badge className={`text-[8px] px-1.5 py-0.5 h-3.5 flex items-center ${
                            employee.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {employee.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                          <div>
                            <p className="text-gray-500 text-[9px]">Mitarbeiternr.</p>
                            <p className="font-medium">{employee.employee_number || '00001'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-[9px]">Team</p>
                            <p className="font-medium">{employee.team || 'Allgemein'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-[9px]">Position</p>
                            <p className="font-medium">{employee.position || 'Mitarbeiter'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-[9px]">Beschäftigung</p>
                            <Badge variant="secondary" className="text-[8px] px-1.5 py-0.5 bg-blue-50 text-blue-700 h-3.5 flex items-center">
                              {employee.employment_type === 'full_time' ? 'Vollzeit' :
                               employee.employment_type === 'part_time' ? 'Teilzeit' :
                               employee.employment_type === 'temporary' ? 'Befristet' :
                               employee.employment_type === 'freelance' ? 'Freiberuflich' :
                               'Praktikant'}
                            </Badge>
                          </div>
                        </div>
                        
                        {employee.email && (
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-600">
                            <Mail className="h-2.5 w-2.5" />
                            <span>{employee.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
        
        {/* Mobile Add Employee Dialog */}
        <AddEmployeeDialogMobile
          open={showAddEmployee}
          onOpenChange={setShowAddEmployee}
          onSuccess={() => refetch()}
          companyId={companyId}
        />
      </div>
    );
  }

  // Desktop Ansicht
  return (
    <div className="min-h-screen px-4 py-6">
      <div className="w-full max-w-full bg-white rounded-lg shadow-lg border border-primary/40">
        <div className="p-6 border-b">
          {/* Header mit Mitarbeiterverwaltung */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users2 className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Mitarbeiterverwaltung</h1>
              
            </div>
          </div>

          {/* Mitarbeiter Count und Action Buttons */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Mitarbeiter</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                {employees.length.toLocaleString('de-DE')} Mitarbeiter
              </span>
            </div>
            <div className="flex gap-2">
              <Link to="/employees/archived">
                <Button variant="outline" size="sm">
                  <Archive className="w-4 h-4 mr-2" />
                  Archiv
                </Button>
              </Link>
              <div className="relative">
                <Input
                  type="file"
                  id="excel-upload"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                />
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('excel-upload')?.click()}
                  disabled={!canAddEmployees}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Mitarbeitertabelle
                </Button>
              </div>
              <Button 
                size="sm"
                onClick={() => setShowAddEmployee(true)}
                disabled={!canAddEmployees}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Mitarbeiter hinzufügen
              </Button>
            </div>
          </div>
          
          <EmployeeFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            teamFilter={teamFilter}
            setTeamFilter={setTeamFilter}
            employmentTypeFilter={employmentTypeFilter}
            setEmploymentTypeFilter={setEmploymentTypeFilter}
            onExport={handleExportToExcel}
            onClearFilters={clearFilters}
          />

        </div>
        
        <div className="px-6 pb-6">
          {employees.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Keine Mitarbeiter gefunden.</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Keine Mitarbeiter gefunden, die den Filterkriterien entsprechen.</p>
            </div>
          ) : (
            <EmployeeListTable employees={filteredEmployees} />
          )}
        </div>
      </div>
      
      <AddEmployeeDialog 
        open={showAddEmployee} 
        onOpenChange={setShowAddEmployee}
        companyId={companyId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['employees'] });
        }} 
      />
    </div>
  );
};

export default EmployeeList;
