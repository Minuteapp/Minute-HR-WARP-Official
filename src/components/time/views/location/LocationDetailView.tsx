import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building2, Users, Monitor, DollarSign, Shield, Download, ChevronDown, MapPin, Building } from "lucide-react";
import LocationOverviewTab from "./LocationOverviewTab";
import LocationDepartmentsTab from "./LocationDepartmentsTab";
import LocationEmployeesTab from "./LocationEmployeesTab";
import LocationInfrastructureTab from "./LocationInfrastructureTab";
import LocationCostsTab from "./LocationCostsTab";
import LocationComplianceTab from "./LocationComplianceTab";

interface LocationDetailViewProps {
  location: {
    name: string;
    address: string;
    employees: number;
    active: number;
    weekHours: string;
    activityRate: number;
  };
  onBack: () => void;
}

const LocationDetailView = ({ location, onBack }: LocationDetailViewProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{location.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location.address}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            Dieser Monat
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger 
            value="overview" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
          >
            <Building className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger 
            value="departments" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
          >
            <Building className="h-4 w-4" />
            Abteilungen
          </TabsTrigger>
          <TabsTrigger 
            value="employees" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
          >
            <Users className="h-4 w-4" />
            Mitarbeiter
          </TabsTrigger>
          <TabsTrigger 
            value="infrastructure" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
          >
            <Monitor className="h-4 w-4" />
            Infrastruktur
          </TabsTrigger>
          <TabsTrigger 
            value="costs" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Kosten
          </TabsTrigger>
          <TabsTrigger 
            value="compliance" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
          >
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <LocationOverviewTab location={location} />
        </TabsContent>
        <TabsContent value="departments" className="mt-6">
          <LocationDepartmentsTab />
        </TabsContent>
        <TabsContent value="employees" className="mt-6">
          <LocationEmployeesTab location={location} />
        </TabsContent>
        <TabsContent value="infrastructure" className="mt-6">
          <LocationInfrastructureTab />
        </TabsContent>
        <TabsContent value="costs" className="mt-6">
          <LocationCostsTab />
        </TabsContent>
        <TabsContent value="compliance" className="mt-6">
          <LocationComplianceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LocationDetailView;
