
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TimeModels from "./TimeModels";
import WorkTimeRegulations from "./WorkTimeRegulations";
import AbsenceSettings from "./AbsenceSettings";
import { TimeModelCard, AbsenceRulesCard } from "@/components/settings/time/TimeSettingsCards";

const TimeSettingsPageComponent = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate("/settings")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">Arbeitszeit & Abwesenheiten</h1>
        </div>
      </div>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="models">Arbeitszeitmodelle</TabsTrigger>
          <TabsTrigger value="regulations">Gesetzliche Zeiten</TabsTrigger>
          <TabsTrigger value="absence">Abwesenheiten</TabsTrigger>
          <TabsTrigger value="shift" onClick={() => navigate("/shift-planning/settings")}>Schichtplanung</TabsTrigger>
        </TabsList>
        
        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Arbeitszeitmodelle</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeModelCard />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="regulations" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Arbeitszeit-Regularien</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkTimeRegulations />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="absence" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Abwesenheitseinstellungen</CardTitle>
            </CardHeader>
            <CardContent>
              <AbsenceRulesCard />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeSettingsPageComponent;
