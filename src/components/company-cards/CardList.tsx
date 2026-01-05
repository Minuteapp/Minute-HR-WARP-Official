import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  CreditCard, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Lock, 
  Unlock, 
  Settings,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CardDetailDialog } from "./CardDetailDialog";
import { CardBlockDialog } from "./CardBlockDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { Skeleton } from "@/components/ui/skeleton";

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

const statusConfig = {
  active: { label: "Aktiv", variant: "default" as const, className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  blocked: { label: "Gesperrt", variant: "destructive" as const, className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  expired: { label: "Abgelaufen", variant: "secondary" as const, className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
  pending: { label: "Ausstehend", variant: "outline" as const, className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" }
};

export const CardList = () => {
  const { tenantCompany } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCard, setSelectedCard] = useState<CompanyCard | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  // Lade Karten aus der Datenbank
  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['company-cards', tenantCompany?.id],
    queryFn: async () => {
      if (!tenantCompany?.id) return [];
      
      const { data, error } = await supabase
        .from('company_cards')
        .select('*')
        .eq('company_id', tenantCompany.id);
      
      if (error) {
        console.error('Error fetching company cards:', error);
        return [];
      }
      
      // Transformiere Datenbank-Format zu UI-Format
      return (data || []).map(card => ({
        id: card.id,
        cardNumber: card.card_number || '**** **** **** ****',
        holderName: card.holder_name || 'Unbekannt',
        department: card.department || 'Nicht zugewiesen',
        cardType: card.card_type || 'Business Card',
        monthlyLimit: card.monthly_limit || 0,
        currentUsage: card.current_usage || 0,
        validUntil: card.valid_until || 'N/A',
        status: (card.status as 'active' | 'blocked' | 'expired' | 'pending') || 'pending'
      }));
    },
    enabled: !!tenantCompany?.id
  });

  const filteredCards = cards.filter(card => {
    const matchesSearch = 
      card.holderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.cardNumber.includes(searchQuery) ||
      card.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || card.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (card: CompanyCard) => {
    setSelectedCard(card);
    setShowDetailDialog(true);
  };

  const handleBlockCard = (card: CompanyCard) => {
    setSelectedCard(card);
    setShowBlockDialog(true);
  };

  if (!tenantCompany?.id) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Bitte wählen Sie eine Firma aus, um Karten anzuzeigen.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Filter */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche nach Name, Kartennummer oder Abteilung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="blocked">Gesperrt</SelectItem>
              <SelectItem value="expired">Abgelaufen</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabelle */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Karte</TableHead>
              <TableHead>Inhaber</TableHead>
              <TableHead>Abteilung</TableHead>
              <TableHead>Limit / Nutzung</TableHead>
              <TableHead>Gültig bis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCards.map((card) => {
              const usagePercent = (card.currentUsage / card.monthlyLimit) * 100;
              const status = statusConfig[card.status];
              
              return (
                <TableRow key={card.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{card.cardNumber}</div>
                        <div className="text-xs text-muted-foreground">{card.cardType}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{card.holderName}</TableCell>
                  <TableCell>{card.department}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {card.currentUsage.toLocaleString('de-DE')} € / {card.monthlyLimit.toLocaleString('de-DE')} €
                      </div>
                      <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${usagePercent > 80 ? 'bg-destructive' : usagePercent > 60 ? 'bg-yellow-500' : 'bg-primary'}`}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{card.validUntil}</TableCell>
                  <TableCell>
                    <Badge className={status.className}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(card)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Details anzeigen
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Limit anpassen
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleBlockCard(card)}
                          className={card.status === 'blocked' ? 'text-green-600' : 'text-destructive'}
                        >
                          {card.status === 'blocked' ? (
                            <>
                              <Unlock className="h-4 w-4 mr-2" />
                              Entsperren
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 mr-2" />
                              Sperren
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredCards.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Keine Karten gefunden
          </div>
        )}
      </CardContent>

      {/* Dialoge */}
      {selectedCard && (
        <>
          <CardDetailDialog 
            card={selectedCard} 
            open={showDetailDialog} 
            onOpenChange={setShowDetailDialog} 
          />
          <CardBlockDialog 
            card={selectedCard} 
            open={showBlockDialog} 
            onOpenChange={setShowBlockDialog} 
          />
        </>
      )}
    </Card>
  );
};
