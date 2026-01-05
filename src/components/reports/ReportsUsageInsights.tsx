
// Ich füge eine minimale Implementierung hinzu, um die Fehler zu beheben
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const ReportsUsageInsights = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Berichtsnutzung & Erkenntnisse</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nutzungsstatistiken</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Überblick</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              Überblick-Inhalt
            </TabsContent>
            <TabsContent value="details">
              Details-Inhalt
            </TabsContent>
            <TabsContent value="trends">
              Trends-Inhalt
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsUsageInsights;
