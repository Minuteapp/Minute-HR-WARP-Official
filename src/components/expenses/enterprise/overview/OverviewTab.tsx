
import ExpensesKPICards from './ExpensesKPICards';
import EnterpriseAIAnalysisCard from './EnterpriseAIAnalysisCard';
import TopDepartmentsTable from './TopDepartmentsTable';
import GlobalDistributionChart from './GlobalDistributionChart';
import ExpensesTrendChart from './ExpensesTrendChart';
import CountryDistributionList from './CountryDistributionList';
import CategoriesOverview from './CategoriesOverview';
import SystemInfoCards from './SystemInfoCards';
import ExpensesSummarySection from './ExpensesSummarySection';
import VATOverviewCard from './VATOverviewCard';
import ValidationFooter from './ValidationFooter';
import DataSourceFooter from './DataSourceFooter';

const OverviewTab = () => {
  return (
    <div className="space-y-6">
      {/* KPI Cards - 2 Rows */}
      <ExpensesKPICards />
      
      {/* Enterprise AI Analysis */}
      <EnterpriseAIAnalysisCard />
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopDepartmentsTable />
        <div className="space-y-6">
          <GlobalDistributionChart />
          <CountryDistributionList />
        </div>
      </div>
      
      {/* Trend Chart */}
      <ExpensesTrendChart />
      
      {/* Categories Overview */}
      <CategoriesOverview />
      
      {/* System Info Cards */}
      <SystemInfoCards />
      
      {/* Expenses Summary with Breakdowns */}
      <ExpensesSummarySection />
      
      {/* VAT Overview */}
      <VATOverviewCard />
      
      {/* Validation Footer */}
      <ValidationFooter />
      
      {/* Data Source Footer */}
      <DataSourceFooter />
    </div>
  );
};

export default OverviewTab;
