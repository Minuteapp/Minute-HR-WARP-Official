import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { SettingsSidebar } from "./SettingsSidebar";
import { GeneralSettings } from "./GeneralSettings";
import { PoliciesSettings } from "./PoliciesSettings";
import { WorkingTimeRulesSettings } from "./WorkingTimeRulesSettings";
import { DSGVOSettings } from "./DSGVOSettings";
import { TrainingSettings } from "./TrainingSettings";
import { NotificationSettings } from "./NotificationSettings";

export const SettingsTab = () => {
  const [activeSection, setActiveSection] = useState("general");

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return <GeneralSettings />;
      case "policies":
        return <PoliciesSettings />;
      case "workingTime":
        return <WorkingTimeRulesSettings />;
      case "dsgvo":
        return <DSGVOSettings />;
      case "training":
        return <TrainingSettings />;
      case "notifications":
        return <NotificationSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  const handleSave = () => {
    // TODO: Implementiere Speicherlogik
    console.log("Settings saved");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Compliance Einstellungen</h2>
        <p className="text-sm text-muted-foreground">Konfiguration des Compliance-Moduls</p>
      </div>

      {/* Main Content */}
      <div className="flex border rounded-lg bg-card min-h-[600px]">
        {/* Sidebar */}
        <SettingsSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Content Area */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>

      {/* Footer with Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};
