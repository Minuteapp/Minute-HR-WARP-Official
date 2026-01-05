import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  TrendingDown, 
  Share2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'Verfügbar' | 'Normal' | 'Überlastet';
  totalTasks: number;
  openTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  workload: number;
  overdueTasks?: number;
  avatarColor: string;
}

interface AdjustmentOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  reduction: number;
  description: string;
  details?: string[];
  warning?: string;
  recommended?: boolean;
}

interface WorkloadAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
}

export const WorkloadAdjustDialog = ({ 
  open, 
  onOpenChange, 
  member 
}: WorkloadAdjustDialogProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  if (!member) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const adjustmentOptions: AdjustmentOption[] = [
    {
      id: 'deadlines',
      title: 'Deadlines verlängern',
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      reduction: 15,
      description: '3 Aufgaben um 1 Woche verschieben',
      details: [
        'Onboarding-Unterlagen: +7 Tage',
        'Mitarbeitergespräche: +5 Tage',
        'Gehaltsanpassungen: +7 Tage'
      ]
    },
    {
      id: 'hours',
      title: 'Wochenarbeitszeit erhöhen',
      icon: <Clock className="h-5 w-5 text-orange-500" />,
      reduction: 10,
      description: 'Für 2 Wochen auf 42h/Woche',
      warning: 'Erfordert Zustimmung'
    },
    {
      id: 'priority',
      title: 'Priorisierung anpassen',
      icon: <TrendingDown className="h-5 w-5 text-purple-500" />,
      reduction: 20,
      description: 'Niedrig-priorisierte Aufgaben pausieren'
    },
    {
      id: 'delegate',
      title: 'Teilaufgaben delegieren',
      icon: <Share2 className="h-5 w-5 text-green-500" />,
      reduction: 25,
      description: 'Teilbereiche an andere Teammitglieder',
      recommended: true
    }
  ];

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const totalReduction = adjustmentOptions
    .filter(opt => selectedOptions.includes(opt.id))
    .reduce((sum, opt) => sum + opt.reduction, 0);

  const newWorkload = Math.max(0, member.workload - totalReduction);
  const targetReached = newWorkload <= 90;

  const handleApply = () => {
    console.log('Anpassungen anwenden:', { selectedOptions, newWorkload });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Workload anpassen</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Wählen Sie Anpassungsoptionen, um die Auslastung zu reduzieren.
          </p>
        </DialogHeader>

        <div className="space-y-5">
          {/* Mitarbeiter Card */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className={cn('text-white', member.avatarColor)}>
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-muted-foreground">{member.role}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Aktuelle Auslastung</div>
                <div className={cn(
                  'text-2xl font-bold',
                  member.workload > 100 ? 'text-red-600' :
                  member.workload >= 80 ? 'text-orange-600' :
                  'text-green-600'
                )}>
                  {member.workload}%
                </div>
              </div>
            </div>
          </Card>

          {/* KI-Analyse */}
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500 rounded-lg shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">KI-Analyse</h4>
                <p className="text-sm text-muted-foreground">
                  {member.name} ist mit <span className="font-semibold text-red-600">{member.workload}%</span> deutlich überlastet. 
                  Empfohlenes Ziel: <span className="font-semibold">≤ 90%</span>. 
                  Die beste Option ist <span className="font-semibold">Teilaufgaben delegieren</span>, 
                  da andere Teammitglieder Kapazität haben.
                </p>
              </div>
            </div>
          </Card>

          {/* Anpassungsoptionen */}
          <div>
            <h3 className="font-medium mb-3">Anpassungsoptionen wählen</h3>
            <div className="grid grid-cols-2 gap-3">
              {adjustmentOptions.map((option) => (
                <Card
                  key={option.id}
                  className={cn(
                    'p-4 cursor-pointer transition-all',
                    selectedOptions.includes(option.id) 
                      ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' 
                      : 'hover:border-muted-foreground/50'
                  )}
                  onClick={() => toggleOption(option.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span className="font-medium text-sm">{option.title}</span>
                    </div>
                    {option.recommended && (
                      <Badge className="text-xs bg-green-500 hover:bg-green-600">Empfohlen</Badge>
                    )}
                  </div>
                  
                  <div className="text-lg font-bold text-green-600 mb-1">
                    -{option.reduction}%
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {option.description}
                  </p>

                  {option.details && (
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {option.details.map((detail, i) => (
                        <li key={i}>• {detail}</li>
                      ))}
                    </ul>
                  )}

                  {option.warning && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{option.warning}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Vorschau der Anpassung */}
          {selectedOptions.length > 0 && (
            <Card className={cn(
              'p-4',
              targetReached ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
            )}>
              <div className="flex items-start gap-3">
                <CheckCircle2 className={cn(
                  'h-5 w-5 mt-0.5',
                  targetReached ? 'text-green-600' : 'text-orange-600'
                )} />
                <div>
                  <h4 className={cn(
                    'font-medium mb-2',
                    targetReached ? 'text-green-800' : 'text-orange-800'
                  )}>
                    Vorschau der Anpassung
                  </h4>
                  <div className="flex items-center gap-3 text-sm mb-2">
                    <span>
                      <span className="text-muted-foreground">Aktuell:</span>{' '}
                      <span className="font-semibold">{member.workload}%</span>
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span>
                      <span className="text-muted-foreground">Nach Anpassung:</span>{' '}
                      <span className={cn(
                        'font-semibold',
                        targetReached ? 'text-green-600' : 'text-orange-600'
                      )}>
                        {newWorkload}%
                      </span>
                    </span>
                  </div>
                  {targetReached ? (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Ziel-Auslastung erreicht (≤ 90%)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Weitere Anpassungen nötig für Ziel ≤ 90%</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            className="bg-orange-500 hover:bg-orange-600"
            onClick={handleApply}
            disabled={selectedOptions.length === 0}
          >
            Anpassung anwenden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
