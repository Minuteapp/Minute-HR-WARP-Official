
import React from 'react';
import { Card } from "@/components/ui/card";

const PayrollPeriods: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Abrechnungsperioden</h2>
        <p className="text-sm text-gray-500">Verwalten Sie Abrechnungszeiträume und -zyklen</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Keine Abrechnungsperioden definiert.</p>
        </div>
      </Card>
    </div>
  );
};

export default PayrollPeriods;
