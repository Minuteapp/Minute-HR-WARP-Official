import EmployeeWelcomeCard from "./EmployeeWelcomeCard";
import EmployeeKPICards from "./EmployeeKPICards";
import CurrentPayslipCard from "./CurrentPayslipCard";
import EmployeeBenefitsSidebar from "./EmployeeBenefitsSidebar";
import PayslipsHistoryTable from "./PayslipsHistoryTable";
import QuickActionCards from "./QuickActionCards";

const EmployeePayrollView = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <EmployeeWelcomeCard />

      {/* KPI Cards */}
      <EmployeeKPICards />

      {/* Main Content: Current Payslip + Benefits Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CurrentPayslipCard />
        </div>
        <div className="lg:col-span-1">
          <EmployeeBenefitsSidebar />
        </div>
      </div>

      {/* Payslips History Table */}
      <PayslipsHistoryTable />

      {/* Quick Action Cards */}
      <QuickActionCards />
    </div>
  );
};

export default EmployeePayrollView;
