import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Play, GitBranch, Mail, FileText, Database, Calendar, DollarSign, Filter, GitMerge, HelpCircle } from 'lucide-react';
import type { WorkflowNode } from '../tabs/BuilderTab';

interface CanvasNodeProps {
  node: WorkflowNode;
  isSelected: boolean;
  onClick: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  'Event': Zap,
  'Zeitplan': Clock,
  'Manuell': Play,
  'Webhook': GitBranch,
  'Benachrichtigung': Mail,
  'Genehmigung': GitMerge,
  'Task erstellen': FileText,
  'Datensatz ändern': Database,
  'Kalendereintrag': Calendar,
  'Payroll starten': DollarSign,
  'Bedingung (IF)': GitBranch,
  'Filter': Filter,
};

export const CanvasNode: React.FC<CanvasNodeProps> = ({ node, isSelected, onClick }) => {
  const Icon = iconMap[node.label] || HelpCircle;

  const getTypeBadge = () => {
    switch (node.type) {
      case 'trigger':
        return <Badge className="bg-blue-100 text-blue-700 text-xs">Trigger</Badge>;
      case 'action':
        return <Badge className="bg-green-100 text-green-700 text-xs">Aktion</Badge>;
      case 'condition':
        return <Badge className="bg-orange-100 text-orange-700 text-xs">Bedingung</Badge>;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        w-full max-w-md p-4 rounded-lg border-2 cursor-pointer transition-all
        ${isSelected 
          ? 'border-primary bg-primary/5 shadow-md' 
          : 'border-border bg-background hover:border-primary/50'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`
          h-10 w-10 rounded-lg flex items-center justify-center
          ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}
        `}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {getTypeBadge()}
          </div>
          <p className="font-medium text-foreground mt-1">{node.label}</p>
        </div>
      </div>
    </div>
  );
};
