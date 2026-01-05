import RecruitingKPICards from '../overview/RecruitingKPICards';
import PipelineConversionChart from '../overview/PipelineConversionChart';
import ConversionRateChart from '../overview/ConversionRateChart';
import EnterpriseRecruitingFilters from '../EnterpriseRecruitingFilters';

interface ExecutiveOverviewTabProps {
  selectedCountry: string;
  setSelectedCountry: (value: string) => void;
  selectedLocation: string;
  setSelectedLocation: (value: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (value: string) => void;
  onResetFilters: () => void;
}

const ExecutiveOverviewTab = ({
  selectedCountry,
  setSelectedCountry,
  selectedLocation,
  setSelectedLocation,
  selectedDepartment,
  setSelectedDepartment,
  onResetFilters,
}: ExecutiveOverviewTabProps) => {
  return (
    <div>
      <EnterpriseRecruitingFilters
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        onResetFilters={onResetFilters}
      />
      
      <RecruitingKPICards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineConversionChart />
        <ConversionRateChart />
      </div>
    </div>
  );
};

export default ExecutiveOverviewTab;
