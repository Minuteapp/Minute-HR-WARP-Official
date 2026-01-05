import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { usePermissionContext } from "@/contexts/PermissionContext";

// Import components for each payroll setting category
import GeneralSettings from "./components/GeneralSettings";
import PayrollStatements from "./components/PayrollStatements";
import BonusAllowances from "./components/BonusAllowances";
import TaxDeductions from "./components/TaxDeductions";
import ApprovalWorkflows from "./components/ApprovalWorkflows";
import PayrollNotifications from "./components/PayrollNotifications";
import PayrollIntegrations from "./components/PayrollIntegrations";
import RoleVisibility from "./components/RoleVisibility";

export default function PayrollSettingsPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissionContext();

  // Check if user has permission to access payroll settings
  const canViewPayroll = hasPermission('payroll', 'view');
  const isHRManager = hasPermission('payroll', 'manage');
  const isAdmin = hasPermission('system', 'admin');

  if (!canViewPayroll) {
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
            <h1 className="text-2xl font-semibold">Lohn & Gehalt</h1>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Sie haben keine Berechtigung, auf die Lohn- und Gehaltseinstellungen zuzugreifen.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-2xl font-semibold">Lohn & Gehalt</h1>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="statements">Abrechnung</TabsTrigger>
          <TabsTrigger value="bonuses">Zuschläge</TabsTrigger>
          <TabsTrigger value="taxes">Abzüge</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
          <TabsTrigger value="integrations">Integrationen</TabsTrigger>
          {(isHRManager || isAdmin) && (
            <TabsTrigger value="roles">Rollen</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="statements">
          <PayrollStatements />
        </TabsContent>

        <TabsContent value="bonuses">
          <BonusAllowances />
        </TabsContent>

        <TabsContent value="taxes">
          <TaxDeductions />
        </TabsContent>

        <TabsContent value="workflows">
          <ApprovalWorkflows />
        </TabsContent>

        <TabsContent value="notifications">
          <PayrollNotifications />
        </TabsContent>

        <TabsContent value="integrations">
          <PayrollIntegrations />
        </TabsContent>

        {(isHRManager || isAdmin) && (
          <TabsContent value="roles">
            <RoleVisibility />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}