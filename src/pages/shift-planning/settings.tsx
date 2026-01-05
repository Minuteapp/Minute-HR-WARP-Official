
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import RuleSettings from '@/components/shift-planning/RuleSettings';

const ShiftPlanningSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("rules");

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate('/shift-planning')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Schichtplanung - Einstellungen</h1>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="rules">Gesetzliche & tarifliche Regeln</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
          <TabsTrigger value="permissions">Zugriffsberechtigungen</TabsTrigger>
          <TabsTrigger value="integration">Integrationen</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4 mt-6">
          <RuleSettings />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4 mt-6">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-medium mb-4">Benachrichtigungseinstellungen</h2>
            <p className="text-gray-500">
              Konfigurieren Sie, wie und wann Benachrichtigungen für Schichtänderungen, -zuweisungen und -tausche gesendet werden.
            </p>
            {/* Benachrichtigungseinstellungen würden hier kommen */}
          </div>
        </TabsContent>
        
        <TabsContent value="permissions" className="space-y-4 mt-6">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-medium mb-4">Zugriffsberechtigungen</h2>
            <p className="text-gray-500">
              Legen Sie fest, welche Benutzerrollen Zugriff auf welche Funktionen der Schichtplanung haben.
            </p>
            {/* Berechtigungseinstellungen würden hier kommen */}
          </div>
        </TabsContent>
        
        <TabsContent value="integration" className="space-y-4 mt-6">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-medium mb-4">Integrationen</h2>
            <p className="text-gray-500">
              Verbinden Sie die Schichtplanung mit anderen Systemen wie DATEV, SAP oder Personio.
            </p>
            {/* Integrationseinstellungen würden hier kommen */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShiftPlanningSettings;
