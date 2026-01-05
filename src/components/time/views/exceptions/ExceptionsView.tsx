import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import ExceptionCard, { type Exception } from './ExceptionCard';
import ExceptionDetailDialog from './ExceptionDetailDialog';

const mockExceptions: Exception[] = [];

const ExceptionsView = () => {
  const [exceptions, setExceptions] = useState<Exception[]>(mockExceptions);
  const [selectedException, setSelectedException] = useState<Exception | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeCount = exceptions.filter(e => e.status === 'offen').length;

  const handleViewDetails = (exception: Exception) => {
    setSelectedException(exception);
    setDialogOpen(true);
  };

  const handleMarkResolved = (id: string) => {
    setExceptions(prev => 
      prev.map(e => e.id === id ? { ...e, status: 'gelöst' as const } : e)
    );
  };

  const openExceptions = exceptions.filter(e => e.status === 'offen');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Ausnahmen</h2>
        <Badge className="bg-red-500 text-white hover:bg-red-600">
          {activeCount} aktiv
        </Badge>
      </div>

      {/* Exception Cards */}
      <div className="space-y-4">
        {openExceptions.map(exception => (
          <ExceptionCard
            key={exception.id}
            exception={exception}
            onViewDetails={handleViewDetails}
            onMarkResolved={handleMarkResolved}
          />
        ))}

        {openExceptions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Keine offenen Ausnahmen vorhanden.
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <ExceptionDetailDialog
        exception={selectedException}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onMarkResolved={handleMarkResolved}
      />
    </div>
  );
};

export default ExceptionsView;
