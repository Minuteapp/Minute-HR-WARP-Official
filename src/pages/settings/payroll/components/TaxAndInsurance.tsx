
import React from 'react';
import { Card } from "@/components/ui/card";

const TaxAndInsurance: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1A1F2C]">Steuer & Sozialversicherung</h2>
        <p className="text-sm text-gray-500">Verwalten Sie steuerliche Aspekte und Sozialversicherungen</p>
      </div>

      <Card className="p-6 border-[#9b87f5]/40 border">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Keine Einstellungen konfiguriert.</p>
        </div>
      </Card>
    </div>
  );
};

export default TaxAndInsurance;
