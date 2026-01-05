
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarbonFootprintForm } from "./components/CarbonFootprintForm";
import { EnergyConsumptionForm } from "./components/EnergyConsumptionForm";
import { WasteManagementForm } from "./components/WasteManagementForm";
import { Card } from "@/components/ui/card";
import { Leaf, Sun, Recycle } from "lucide-react";
import { EnvironmentDashboard } from "./components/EnvironmentDashboard";

const EnvironmentSettings = () => {
  return (
    <div className="w-full p-6">
      <h1 className="text-3xl font-bold mb-6">Umwelt & Nachhaltigkeit</h1>
      
      <EnvironmentDashboard />
      
      <Tabs defaultValue="carbon" className="mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="carbon" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            CO2-Bilanz
          </TabsTrigger>
          <TabsTrigger value="energy" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Energieverbrauch
          </TabsTrigger>
          <TabsTrigger value="waste" className="flex items-center gap-2">
            <Recycle className="h-4 w-4" />
            Abfallmanagement
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="carbon" className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">CO2-Bilanz erfassen</h2>
          <CarbonFootprintForm />
        </TabsContent>
        
        <TabsContent value="energy" className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Energieverbrauch erfassen</h2>
          <EnergyConsumptionForm />
        </TabsContent>
        
        <TabsContent value="waste" className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Abfallmanagement erfassen</h2>
          <WasteManagementForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnvironmentSettings;
