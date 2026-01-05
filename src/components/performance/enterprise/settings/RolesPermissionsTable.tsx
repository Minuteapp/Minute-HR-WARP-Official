import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const RolesPermissionsTable = () => {
  const roles = [
    { 
      role: 'Mitarbeiter', 
      permissions: 'Eigene Performance einsehen, Selbstbewertung, Feedback geben' 
    },
    { 
      role: 'Teamleiter', 
      permissions: 'Team-Performance einsehen, Reviews durchführen, Ziele setzen' 
    },
    { 
      role: 'HR', 
      permissions: 'Alle Performance-Daten, Reports erstellen, Einstellungen verwalten' 
    },
    { 
      role: 'Geschäftsführung', 
      permissions: 'Unternehmens-KPIs, Abteilungsvergleiche, strategische Insights' 
    },
    { 
      role: 'Admin/Superadmin', 
      permissions: 'Vollzugriff, System-Einstellungen, Benutzer-Verwaltung' 
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Rollen & Berechtigungen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {roles.map((item, index) => (
            <div 
              key={index} 
              className="flex items-start justify-between py-2 border-b last:border-0"
            >
              <span className="font-medium text-foreground">{item.role}</span>
              <span className="text-sm text-muted-foreground text-right max-w-[60%]">
                {item.permissions}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
