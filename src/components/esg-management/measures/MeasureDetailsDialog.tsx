import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { User, MapPin, Calendar } from 'lucide-react';
import { Measure } from './MeasureCard';

interface MeasureDetailsDialogProps {
  measure: Measure | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MeasureDetailsDialog: React.FC<MeasureDetailsDialogProps> = ({
  measure,
  open,
  onOpenChange,
}) => {
  if (!measure) return null;

  const isNegativeSavings = measure.costSavings.startsWith('-') || measure.costSavings.startsWith('€-');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{measure.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metric Boxes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 mb-1">CO₂-Reduktion</p>
              <p className="text-2xl font-bold text-green-600">{measure.co2Reduction}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-700 mb-1">Kostenersparnis</p>
              <p className={`text-2xl font-bold ${isNegativeSavings ? 'text-blue-600' : 'text-purple-600'}`}>
                {measure.costSavings}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 mb-1">Investition</p>
              <p className="text-2xl font-bold text-blue-600">{measure.investment}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 mb-1">ROI</p>
              <p className="text-2xl font-bold text-red-600">{measure.roi}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Beschreibung</h4>
            <p className="text-sm text-muted-foreground">{measure.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Verantwortlich</p>
                <p className="text-sm font-medium">{measure.responsible}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Standort</p>
                <p className="text-sm font-medium">{measure.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Start</p>
                <p className="text-sm font-medium">{measure.startDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Ziel-Datum</p>
                <p className="text-sm font-medium">{measure.targetDate}</p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Fortschritt</span>
              <span className="text-sm font-bold text-green-600">{measure.progress}%</span>
            </div>
            <Progress value={measure.progress} className="h-3" />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            Projekt bearbeiten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
