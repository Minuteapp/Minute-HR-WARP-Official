import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, User, Building2, Calendar, DollarSign, TrendingUp } from "lucide-react";

interface CompanyCard {
  id: string;
  cardNumber: string;
  holderName: string;
  department: string;
  cardType: string;
  monthlyLimit: number;
  currentUsage: number;
  validUntil: string;
  status: 'active' | 'blocked' | 'expired' | 'pending';
}

interface CardDetailDialogProps {
  card: CompanyCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  active: { label: "Aktiv", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  blocked: { label: "Gesperrt", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  expired: { label: "Abgelaufen", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
  pending: { label: "Ausstehend", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" }
};

export const CardDetailDialog = ({ card, open, onOpenChange }: CardDetailDialogProps) => {
  const usagePercent = (card.currentUsage / card.monthlyLimit) * 100;
  const status = statusConfig[card.status];

  // Mock letzte Transaktionen
  const recentTransactions = [
    { date: "15.12.2024", description: "Amazon Business", amount: -234.50 },
    { date: "14.12.2024", description: "Lufthansa", amount: -890.00 },
    { date: "12.12.2024", description: "Hotel Marriott", amount: -345.00 },
    { date: "10.12.2024", description: "Tanken Shell", amount: -78.50 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Kartendetails
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Karten-Vorschau */}
          <div className="relative p-6 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <div className="absolute top-4 right-4">
              <Badge className={status.className}>{status.label}</Badge>
            </div>
            <div className="space-y-4">
              <div className="text-sm opacity-80">{card.cardType}</div>
              <div className="text-2xl font-mono tracking-wider">{card.cardNumber}</div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs opacity-70">Karteninhaber</div>
                  <div className="font-medium">{card.holderName}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-70">Gültig bis</div>
                  <div className="font-medium">{card.validUntil}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Karteninhaber</div>
                <div className="font-medium">{card.holderName}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Abteilung</div>
                <div className="font-medium">{card.department}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Monatliches Limit</div>
                <div className="font-medium">{card.monthlyLimit.toLocaleString('de-DE')} €</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Aktuelle Nutzung</div>
                <div className="font-medium">{card.currentUsage.toLocaleString('de-DE')} € ({usagePercent.toFixed(1)}%)</div>
              </div>
            </div>
          </div>

          {/* Nutzungsbalken */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Verfügbar</span>
              <span className="font-medium">{(card.monthlyLimit - card.currentUsage).toLocaleString('de-DE')} €</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${usagePercent > 80 ? 'bg-destructive' : usagePercent > 60 ? 'bg-yellow-500' : 'bg-primary'}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>

          <Separator />

          {/* Letzte Transaktionen */}
          <div>
            <h4 className="font-medium mb-3">Letzte Transaktionen</h4>
            <div className="space-y-2">
              {recentTransactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground w-20">{tx.date}</div>
                    <div className="font-medium">{tx.description}</div>
                  </div>
                  <div className={`font-medium ${tx.amount < 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {tx.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
