import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Building } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DepartmentOverviewTab from "./department/DepartmentOverviewTab";
import DepartmentEmployeesTab from "./department/DepartmentEmployeesTab";
import DepartmentTeamsTab from "./department/DepartmentTeamsTab";
import DepartmentProjectsTab from "./department/DepartmentProjectsTab";
import DepartmentPerformanceTab from "./department/DepartmentPerformanceTab";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DepartmentDetailViewProps {
  departmentId: string;
  onBack: () => void;
}

type DetailTab = 'overview' | 'employees' | 'teams' | 'projects' | 'performance';

const DepartmentDetailView = ({ departmentId, onBack }: DepartmentDetailViewProps) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Abteilungsdaten aus der Datenbank laden
  const { data: department, isLoading } = useQuery({
    queryKey: ['department-details', departmentId],
    queryFn: async () => {
      // Versuche zuerst aus departments Tabelle
      const { data: deptData } = await supabase
        .from('departments')
        .select('*')
        .eq('id', departmentId)
        .single();
      
      if (deptData) {
        // Zähle Mitarbeiter in dieser Abteilung
        const { count: employeeCount } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('department', deptData.name);
        
        // Zähle Teams in dieser Abteilung
        const { count: teamCount } = await supabase
          .from('teams')
          .select('*', { count: 'exact', head: true })
          .eq('department_id', departmentId);
        
        return {
          name: deptData.name,
          employees: employeeCount || 0,
          teams: teamCount || 0
        };
      }
      
      // Fallback: Leere Struktur
      return {
        name: 'Abteilung',
        employees: 0,
        teams: 0
      };
    },
    enabled: !!departmentId
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'employees':
        return <DepartmentEmployeesTab />;
      case 'teams':
        return <DepartmentTeamsTab />;
      case 'projects':
        return <DepartmentProjectsTab />;
      case 'performance':
        return <DepartmentPerformanceTab />;
      default:
        return <DepartmentOverviewTab />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{department?.name || 'Abteilung'}</h2>
            <p className="text-sm text-muted-foreground">
              {department?.employees || 0} Mitarbeiter • {department?.teams || 0} Teams
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Heute</SelectItem>
              <SelectItem value="week">Diese Woche</SelectItem>
              <SelectItem value="month">Dieser Monat</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          <button 
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Übersicht
          </button>
          <button 
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'employees' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('employees')}
          >
            Mitarbeiter
          </button>
          <button 
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'teams' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('teams')}
          >
            Teams
          </button>
          <button 
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'projects' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('projects')}
          >
            Projekte
          </button>
          <button 
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'performance' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default DepartmentDetailView;
