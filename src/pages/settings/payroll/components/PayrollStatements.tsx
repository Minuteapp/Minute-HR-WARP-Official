
import React from 'react';
import { Card } from "@/components/ui/card";

const PayrollStatements: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Gehaltsabrechnungen</h2>
        <p className="text-sm text-gray-500">Verwalten Sie Gehaltsabrechnungen und Lohndokumente</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Keine Abrechnungen vorhanden.</p>
        </div>
      </Card>
    </div>
  );
};

export default PayrollStatements;
