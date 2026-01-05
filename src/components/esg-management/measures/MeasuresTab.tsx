import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, Loader2, Leaf } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MeasuresKPICards } from './MeasuresKPICards';
import { MeasureCard, Measure } from './MeasureCard';
import { PortfolioSummaryCard } from './PortfolioSummaryCard';
import { MeasureDetailsDialog } from './MeasureDetailsDialog';
import { MeasureUpdateDialog } from './MeasureUpdateDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';

type FilterType = 'all' | 'in-progress' | 'planned' | 'completed';

export const MeasuresTab = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState('co2');
  const [selectedMeasure, setSelectedMeasure] = useState<Measure | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  // Lade Maßnahmen aus der Datenbank
  const { data: measuresData = [], isLoading } = useQuery({
    queryKey: ['esg-measures'],
    queryFn: async () => {
      const { data: measures } = await supabase
        .from('esg_measures')
        .select('*')
        .order('created_at', { ascending: false });

      if (!measures || measures.length === 0) {
        return [];
      }

      return measures.map((m: any) => ({
        id: m.id,
        title: m.title || m.name,
        description: m.description || '',
        status: m.status || 'planned',
        priority: m.priority || 'medium',
        co2Reduction: m.co2_reduction ? `-${m.co2_reduction} t/Jahr` : '-',
        costSavings: m.cost_savings ? `+€${m.cost_savings.toLocaleString('de-DE')}/Jahr` : '€0',
        investment: m.investment ? `€${m.investment.toLocaleString('de-DE')}` : '€0',
        roi: m.roi || '-',
        responsible: m.responsible || '-',
        location: m.location || '-',
        startDate: m.start_date ? new Date(m.start_date).toLocaleDateString('de-DE') : '-',
        targetDate: m.target_date ? new Date(m.target_date).toLocaleDateString('de-DE') : '-',
        progress: m.progress || 0,
      })) as Measure[];
    }
  });

  const filterCounts = {
    all: measuresData.length,
    'in-progress': measuresData.filter((m) => m.status === 'in-progress').length,
    planned: measuresData.filter((m) => m.status === 'planned').length,
    completed: measuresData.filter((m) => m.status === 'completed').length,
  };

  const filteredMeasures = measuresData.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const handleDetails = (measure: Measure) => {
    setSelectedMeasure(measure);
    setDetailsOpen(true);
  };

  const handleUpdate = (measure: Measure) => {
    setSelectedMeasure(measure);
    setUpdateOpen(true);
  };

  const handleSaveUpdate = (measureId: string, progress: number, statusUpdate: string, nextSteps: string) => {
    console.log('Update saved:', { measureId, progress, statusUpdate, nextSteps });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Maßnahmen-Portfolio</h2>
            <p className="text-sm text-muted-foreground">
              Nachhaltigkeitsmaßnahmen planen, umsetzen und tracken
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (measuresData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Maßnahmen-Portfolio</h2>
            <p className="text-sm text-muted-foreground">
              Nachhaltigkeitsmaßnahmen planen, umsetzen und tracken
            </p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Neue Maßnahme
          </Button>
        </div>

        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Leaf className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Keine Maßnahmen vorhanden</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Erstellen Sie Ihre erste Nachhaltigkeitsmaßnahme, um CO₂-Reduktionen zu planen und zu tracken.
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Erste Maßnahme erstellen
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Maßnahmen-Portfolio</h2>
          <p className="text-sm text-muted-foreground">
            Nachhaltigkeitsmaßnahmen planen, umsetzen und tracken
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Neue Maßnahme
        </Button>
      </div>

      {/* KPI Cards */}
      <MeasuresKPICards />

      {/* Filter & Sort */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Alle ({filterCounts.all})
          </Button>
          <Button
            variant={filter === 'in-progress' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('in-progress')}
            className={filter === 'in-progress' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            In Umsetzung ({filterCounts['in-progress']})
          </Button>
          <Button
            variant={filter === 'planned' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('planned')}
            className={filter === 'planned' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Geplant ({filterCounts.planned})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Abgeschlossen ({filterCounts.completed})
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Sortieren: CO₂-Impact
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background border">
            <DropdownMenuItem onClick={() => setSortBy('co2')}>CO₂-Impact</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('savings')}>Kostenersparnis</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('roi')}>ROI</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('progress')}>Fortschritt</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Measure Cards */}
      <div className="space-y-4">
        {filteredMeasures.map((measure) => (
          <MeasureCard
            key={measure.id}
            measure={measure}
            onDetails={handleDetails}
            onUpdate={handleUpdate}
          />
        ))}
      </div>

      {/* Portfolio Summary */}
      <PortfolioSummaryCard />

      {/* Dialogs */}
      <MeasureDetailsDialog
        measure={selectedMeasure}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
      <MeasureUpdateDialog
        measure={selectedMeasure}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        onSave={handleSaveUpdate}
      />
    </div>
  );
};
