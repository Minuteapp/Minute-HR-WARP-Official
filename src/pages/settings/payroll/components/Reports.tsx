
import React from 'react';
import { Card } from "@/components/ui/card";

const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Berichte</h2>
        <p className="text-sm text-gray-500">Verwalten Sie Gehalts- und Abrechnungsberichte</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Keine Berichte verfügbar.</p>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
