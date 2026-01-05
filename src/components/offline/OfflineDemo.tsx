import React from 'react';
import { useOfflineData } from '@/hooks/useOfflineData';
import { useOfflineManager } from '@/hooks/useOfflineManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { OfflineDataStatus } from './OfflineDataStatus';
import { DataFreshnessChip } from './DataFreshnessChip';

export const OfflineDemo = () => {
  const { data, create, update, remove } = useOfflineData('calendar_events');
  const { isOnline, pendingOperations, conflicts } = useOfflineManager();

  const addTestEvent = async () => {
    await create({
      title: `Test Event ${Date.now()}`,
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString(),
      description: 'Offline erstellt'
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Offline Demo</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <OfflineDataStatus status={isOnline ? 'synced' : 'pending'} />
          <span className="text-sm">
            {pendingOperations} ausstehend • {conflicts} Konflikte
          </span>
        </div>

        <Button onClick={addTestEvent}>
          Test Event erstellen
        </Button>

        <div className="space-y-2">
          {data.slice(0, 3).map((event: any) => (
            <div key={event.id} className="flex items-center justify-between p-2 border rounded">
              <span>{event.title}</span>
              <div className="flex gap-2">
                <OfflineDataStatus status={event._offlineStatus} showText={false} />
                <DataFreshnessChip lastUpdated={event._lastModified} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};