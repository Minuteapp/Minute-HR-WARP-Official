
import React from 'react';
import { Card } from "@/components/ui/card";

const Benefits: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Zusatzleistungen</h2>
        <p className="text-sm text-gray-500">Verwalten Sie Mitarbeitervorteile und Zusatzleistungen</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Keine Zusatzleistungen definiert.</p>
        </div>
      </Card>
    </div>
  );
};

export default Benefits;
