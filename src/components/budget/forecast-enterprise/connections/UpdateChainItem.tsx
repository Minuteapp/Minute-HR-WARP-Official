import React from 'react';
import { ArrowRight, UserPlus, Receipt, AlertTriangle, RefreshCw, TrendingUp, Bell } from 'lucide-react';

interface UpdateChainItemProps {
  triggerSource: string;
  triggerDescription: string;
  resultAction: string;
  resultDescription: string;
}

const getTriggerIcon = (source: string) => {
  if (source.toLowerCase().includes('einstellung')) return UserPlus;
  if (source.toLowerCase().includes('ausgabe')) return Receipt;
  if (source.toLowerCase().includes('projekt')) return AlertTriangle;
  return RefreshCw;
};

const getResultIcon = (action: string) => {
  if (action.toLowerCase().includes('forecast')) return TrendingUp;
  if (action.toLowerCase().includes('warnung')) return Bell;
  if (action.toLowerCase().includes('kosten')) return Receipt;
  return RefreshCw;
};

export const UpdateChainItem: React.FC<UpdateChainItemProps> = ({
  triggerSource,
  triggerDescription,
  resultAction,
  resultDescription
}) => {
  const TriggerIcon = getTriggerIcon(triggerSource);
  const ResultIcon = getResultIcon(resultAction);

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
      {/* Trigger */}
      <div className="flex items-center gap-3 flex-1">
        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <TriggerIcon className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-foreground">{triggerSource}</p>
          <p className="text-sm text-muted-foreground">{triggerDescription}</p>
        </div>
      </div>

      {/* Arrow */}
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
        <ArrowRight className="h-5 w-5 text-primary" />
      </div>

      {/* Result */}
      <div className="flex items-center gap-3 flex-1">
        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
          <ResultIcon className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="font-medium text-foreground">{resultAction}</p>
          <p className="text-sm text-muted-foreground">{resultDescription}</p>
        </div>
      </div>
    </div>
  );
};
