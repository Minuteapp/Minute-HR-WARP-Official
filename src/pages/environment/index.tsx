import { Routes, Route } from 'react-router-dom';
import EnvironmentDashboard from './dashboard';
import EnergyConsumption from './energy-consumption';
import CarbonFootprint from './carbon-footprint';
import WasteManagement from './waste-management';
import WaterConsumption from './water-consumption';
import SupplyChain from './supply-chain';
import SustainabilityReports from './sustainability-reports';
import EmployeeEngagement from './employee-engagement';
import GreenInitiatives from './initiatives';
import InitiativeDetails from './initiative-details';
import EnvironmentAnalytics from './analytics';
import { EnvironmentMainTabs } from '@/components/environment/EnvironmentMainTabs';

const EnvironmentPage = () => {
  return (
    <Routes>
      <Route index element={<EnvironmentMainTabs />} />
      <Route path="energy" element={<EnergyConsumption />} />
      <Route path="carbon" element={<CarbonFootprint />} />
      <Route path="waste" element={<WasteManagement />} />
      <Route path="water" element={<WaterConsumption />} />
      <Route path="supply-chain" element={<SupplyChain />} />
      <Route path="initiatives/*" element={<GreenInitiatives />} />
      <Route path="initiative/:id" element={<InitiativeDetails />} />
      <Route path="reports" element={<SustainabilityReports />} />
      <Route path="engagement" element={<EmployeeEngagement />} />
      <Route path="analytics" element={<EnvironmentAnalytics />} />
    </Routes>
  );
};

export default EnvironmentPage;