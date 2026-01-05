
import { Routes, Route } from "react-router-dom";
import BusinessTravelAdminPage from "./admin/index";
import { TravelManagement } from "@/components/TravelManagement";

const EmployeeBusinessTravelPage = () => {
  return <TravelManagement />;
};

const BusinessTravelPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/admin" element={<BusinessTravelAdminPage />} />
        <Route path="/*" element={<EmployeeBusinessTravelPage />} />
      </Routes>
    </div>
  );
};

export default BusinessTravelPage;
