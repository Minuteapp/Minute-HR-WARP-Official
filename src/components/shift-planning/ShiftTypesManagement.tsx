import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const shiftTypes = [
  {
    name: 'Frühschicht',
    time: '06:00:00 - 14:00:00',
    requirements: ['Grundqualifikation', 'Maschinenbedienung']
  },
  {
    name: 'Frühschicht',
    time: '06:00:00 - 14:00:00',
    requirements: ['Turbine A Zertifikat']
  },
  {
    name: 'Nachtschicht',
    time: '22:00:00 - 06:00:00',
    requirements: ['Nachtwache', 'Notfallprotokoll']
  },
  {
    name: 'Nachtschicht',
    time: '22:00:00 - 06:00:00',
    requirements: ['Überwachung', 'Systemkontrolle']
  },
  {
    name: 'Spätschicht',
    time: '14:00:00 - 22:00:00',
    requirements: ['Wartung', 'Qualitätskontrolle']
  },
  {
    name: 'Spätschicht',
    time: '14:00:00 - 22:00:00',
    requirements: ['Endkontrolle', 'Dokumentation']
  },
  {
    name: 'Teilzeit Nachmittag',
    time: '13:00:00 - 17:00:00',
    requirements: ['Büroarbeit', 'Administration']
  },
  {
    name: 'Teilzeit Vormittag',
    time: '08:00:00 - 12:00:00',
    requirements: ['Planung', 'Koordination']
  }
];

export const ShiftTypesManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Schichtarten verwalten</h2>
        <p className="text-gray-600 text-sm">
          Hier können Sie Schichtarten und ihre erforderlichen Skills konfigurieren.
        </p>
      </div>

      <div className="space-y-4">
        {shiftTypes.map((shift, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-sm">{shift.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{shift.time}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {shift.requirements.map((req, reqIndex) => (
                  <Badge key={reqIndex} variant="outline" className="text-xs">
                    {req}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};