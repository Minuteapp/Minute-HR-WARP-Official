import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface DataCategory {
  id: string;
  name: string;
  status: 'active' | 'deleted';
  retentionPeriod: string;
  recordCount: number;
}

interface DataInventoryCardProps {
  category: DataCategory;
}

export const DataInventoryCard: React.FC<DataInventoryCardProps> = ({ category }) => {
  const statusConfig = {
    active: {
      label: 'Aktiv',
      className: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
    },
    deleted: {
      label: 'Gelöscht',
      className: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    },
  };

  const status = statusConfig[category.status];

  return (
    <Card className="bg-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground">{category.name}</h4>
                <Badge variant="secondary" className={status.className}>
                  {status.label}
                </Badge>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Aufbewahrungsfrist:</span> {category.retentionPeriod}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Datensätze:</span> {category.recordCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
