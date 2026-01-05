
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, User, DollarSign, Calendar, MoreVertical, Lock, Unlock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface CorporateCardData {
  id: string;
  type: 'physical' | 'virtual';
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  status: 'active' | 'blocked';
  assignedTo: string;
  project?: string;
  monthlyLimit: number;
  currentSpend: number;
  lastTransactionDate: Date | null;
}

interface CorporateCardProps {
  card: CorporateCardData;
  onBlock?: (cardId: string) => void;
  onUnblock?: (cardId: string) => void;
  onViewDetails?: (cardId: string) => void;
}

const CorporateCard = ({ card, onBlock, onUnblock, onViewDetails }: CorporateCardProps) => {
  const [showCardNumber, setShowCardNumber] = useState(false);

  const usagePercent = card.monthlyLimit > 0 
    ? Math.round((card.currentSpend / card.monthlyLimit) * 100) 
    : 0;

  const getProgressColor = () => {
    if (usagePercent >= 90) return 'bg-red-500';
    if (usagePercent >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString('de-DE')}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const displayCardNumber = showCardNumber 
    ? card.cardNumber 
    : card.cardNumber.replace(/(\d{4})\s*(\d{4})\s*(\d{4})\s*(\d{4})/, '$1 **** **** $4');

  const isPhysical = card.type === 'physical';
  const gradientClass = isPhysical 
    ? 'bg-gradient-to-br from-purple-600 to-purple-800' 
    : 'bg-gradient-to-br from-blue-600 to-blue-800';

  return (
    <Card className="bg-card border-border overflow-hidden">
      {/* Card Header with Gradient */}
      <div className={`${gradientClass} text-white p-4`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs opacity-80 mb-1">
              {isPhysical ? 'Physische Karte' : 'Virtuelle Karte'}
            </p>
            <p className="text-lg font-semibold">{card.cardholderName}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            card.status === 'active' 
              ? 'bg-green-50/20 border border-green-300/50 text-green-100' 
              : 'bg-red-50/20 border border-red-300/50 text-red-100'
          }`}>
            {card.status === 'active' ? 'Aktiv' : 'Gesperrt'}
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <p className="font-mono text-lg tracking-wider">{displayCardNumber}</p>
            <button 
              onClick={() => setShowCardNumber(!showCardNumber)}
              className="text-white/70 hover:text-white"
            >
              {showCardNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs opacity-70">Gültig bis</p>
            <p className="text-sm font-medium">{card.expiryDate}</p>
          </div>
          {/* Card Chip */}
          <div className="w-10 h-6 bg-yellow-200/50 rounded flex items-center justify-center">
            <div className="w-6 h-4 bg-yellow-300/60 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Card Info Section */}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Zugeordnet zu:</span>
          <span className="font-medium text-foreground">{card.assignedTo}</span>
        </div>

        {card.project && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Projekt:</span>
            <span className="font-medium text-purple-600">{card.project}</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monatslimit</span>
            <span className="font-medium text-foreground">
              {formatCurrency(card.currentSpend)} / {formatCurrency(card.monthlyLimit)}
            </span>
          </div>
          <div className="relative">
            <Progress value={usagePercent} className="h-2 bg-muted" />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full ${getProgressColor()}`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">{usagePercent}% genutzt</p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Letzte Transaktion:</span>
          <span className="font-medium text-foreground">{formatDate(card.lastTransactionDate)}</span>
        </div>

        <div className="flex items-center gap-2 pt-2">
          {card.status === 'active' ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onBlock?.(card.id)}
              className="bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100"
            >
              <Lock className="h-3 w-3 mr-1" />
              Sperren
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onUnblock?.(card.id)}
              className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
            >
              <Unlock className="h-3 w-3 mr-1" />
              Entsperren
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails?.(card.id)}
            className="border-border"
          >
            Details
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-auto">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Transaktionen anzeigen</DropdownMenuItem>
              <DropdownMenuItem>Limit ändern</DropdownMenuItem>
              <DropdownMenuItem>Karte ersetzen</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default CorporateCard;
