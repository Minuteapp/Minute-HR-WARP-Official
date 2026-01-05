import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, CheckCheck } from 'lucide-react';
import { ReadReceipt } from '@/hooks/useReadReceipts';

interface ReadReceiptAvatarsProps {
  receipts: ReadReceipt[];
  showCheckmarks?: boolean;
}

export const ReadReceiptAvatars = ({
  receipts,
  showCheckmarks = true,
}: ReadReceiptAvatarsProps) => {
  if (receipts.length === 0) {
    return showCheckmarks ? (
      <Check className="h-3 w-3 text-muted-foreground" />
    ) : null;
  }

  const displayedReceipts = receipts.slice(0, 3);
  const remainingCount = receipts.length - 3;

  return (
    <div className="flex items-center gap-1">
      {showCheckmarks && receipts.length > 0 && (
        <CheckCheck className="h-3 w-3 text-primary" />
      )}
      <div className="flex -space-x-2">
        {displayedReceipts.map((receipt) => (
          <TooltipProvider key={receipt.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-5 w-5 border-2 border-background">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {receipt.profile?.full_name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Gelesen von {receipt.profile?.full_name || 'Unbekannt'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {remainingCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-5 w-5 border-2 border-background">
                  <AvatarFallback className="text-xs bg-muted">
                    +{remainingCount}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  und {remainingCount} weitere{remainingCount > 1 ? '' : 'r'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};
