
import { useState } from 'react';
import TeamExpensesFilterTabs from '../team-expenses/TeamExpensesFilterTabs';
import TeamExpensesSearchBar from '../team-expenses/TeamExpensesSearchBar';
import TeamExpensesStatsCards from '../team-expenses/TeamExpensesStatsCards';
import DivisionsTable from '../team-expenses/DivisionsTable';
import DepartmentsView from '../team-expenses/DepartmentsView';
import RegionView from '../team-expenses/RegionView';
import CategoryView from '../team-expenses/CategoryView';
import { toast } from 'sonner';

type FilterView = 'division' | 'department' | 'region' | 'category';

interface DivisionData {
  id: string;
  name: string;
  departmentCount: number;
  employees: number;
  locations: number;
  expenses: number;
  budget: number;
  deviation: number;
  avgPerEmployee: number;
}

interface DepartmentCardData {
  rank: number;
  name: string;
  leader: string;
  employees: number;
  locations: number;
  budget: number;
  avgPerEmployee: number;
  totalExpenses: number;
  budgetDeviation: number;
  travelPercentage: number;
}

interface BenchmarkData {
  department: string;
  current: number;
  industryBenchmark: number;
  target: number;
}

const TeamExpensesTab = () => {
  const [activeView, setActiveView] = useState<FilterView>('division');
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');

  // Empty state - no mock data
  const stats = {
    divisions: 0,
    departments: 0,
    employees: 0,
    totalExpenses: 0
  };

  const divisions: DivisionData[] = [];
  const departments: DepartmentCardData[] = [];
  const benchmarkData: BenchmarkData[] = [];

  const handleRefresh = () => {
    toast.info('Daten werden aktualisiert...');
  };

  const handleExport = () => {
    toast.info('Export wird vorbereitet...');
  };

  const handleViewDivision = (division: DivisionData) => {
    console.log('View division:', division);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'division':
        return (
          <DivisionsTable 
            divisions={divisions} 
            onViewDivision={handleViewDivision} 
          />
        );
      case 'department':
        return (
          <DepartmentsView 
            departments={departments} 
            benchmarkData={benchmarkData} 
          />
        );
      case 'region':
        return <RegionView />;
      case 'category':
        return <CategoryView />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <TeamExpensesFilterTabs 
        activeView={activeView} 
        onViewChange={setActiveView} 
      />

      {/* Search Bar */}
      <TeamExpensesSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        regionFilter={regionFilter}
        onRegionFilterChange={setRegionFilter}
        sizeFilter={sizeFilter}
        onSizeFilterChange={setSizeFilter}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      {/* Stats Cards */}
      <TeamExpensesStatsCards stats={stats} />

      {/* Content based on active view */}
      {renderContent()}
    </div>
  );
};

export default TeamExpensesTab;
