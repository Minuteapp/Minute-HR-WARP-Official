import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmployeeTimeOverview from "./EmployeeTimeOverview";
import EmployeeTimeEntries from "./EmployeeTimeEntries";
import EmployeeTimeProjects from "./EmployeeTimeProjects";
import EmployeeTimeVacation from "./EmployeeTimeVacation";

interface EmployeeTimeDetailViewProps {
  employeeId: string;
  onBack: () => void;
}

type DetailTab = 'overview' | 'timetracking' | 'projects' | 'vacation';

const EmployeeTimeDetailView = ({ employeeId, onBack }: EmployeeTimeDetailViewProps) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  // Mitarbeiterdaten aus employeeId ableiten (keine Mock-Daten)
  const employee = {
    name: '',
    role: '',
    employeeId: employeeId,
    initials: employeeId.substring(0, 2).toUpperCase()
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'timetracking':
        return <EmployeeTimeEntries />;
      case 'projects':
        return <EmployeeTimeProjects />;
      case 'vacation':
        return <EmployeeTimeVacation />;
      default:
        return <EmployeeTimeOverview />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-12 w-12 bg-purple-600">
            <AvatarFallback className="bg-purple-600 text-white">
              {employee.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{employee.name}</h2>
            <p className="text-sm text-gray-600">{employee.role} · {employee.employeeId}</p>
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
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button 
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Übersicht
          </button>
          <button 
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'timetracking' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('timetracking')}
          >
            Zeiterfassung
          </button>
          <button 
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'projects' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('projects')}
          >
            Projekte
          </button>
          <button 
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vacation' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('vacation')}
          >
            Urlaub
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default EmployeeTimeDetailView;
