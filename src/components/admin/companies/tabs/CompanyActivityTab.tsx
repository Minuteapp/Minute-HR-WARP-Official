import React from 'react';
import { CompanyDetails } from '../types';
import { Card, CardContent } from '@/components/ui/card';

interface CompanyActivityTabProps {
  company: CompanyDetails;
}

export const CompanyActivityTab: React.FC<CompanyActivityTabProps> = ({ company }) => {
  const activities = [
    {
      id: 1,
      type: 'created',
      label: 'Mandant erstellt',
      timestamp: company.created_at || '2025-10-17T18:56:57',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      type: 'login',
      label: 'Letzter Login',
      timestamp: '2025-10-17T16:56:57',
      color: 'bg-green-500'
    },
    {
      id: 3,
      type: 'status',
      label: 'Status: Active',
      timestamp: company.created_at || '2025-10-17T18:56:57',
      description: 'Aktueller Status',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Aktivitätsverlauf</h3>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${activity.color}`} />
                  {index !== activities.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border mt-2" style={{ minHeight: '40px' }} />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="font-medium text-sm">{activity.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString('de-DE', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  {activity.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
