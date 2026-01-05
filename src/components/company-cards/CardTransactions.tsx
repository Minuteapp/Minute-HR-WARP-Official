import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Search, Download, CreditCard, ArrowUpRight, ArrowDownLeft, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  id: string;
  date: string;
  cardNumber: string;
  holderName: string;
  merchant: string;
  category: string;
  amount: number;
  status: 'completed' | 'pending' | 'declined';
}

const statusConfig = {
  completed: { label: "Abgeschlossen", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  pending: { label: "Ausstehend", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  declined: { label: "Abgelehnt", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" }
};

const categoryColors: Record<string, string> = {
  "Büromaterial": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Marketing": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Reisen": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  "Bewirtung": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "Software": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  "Kraftstoff": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Unterkunft": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

export const CardTransactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['card-transactions', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      // Query card_transactions if table exists, otherwise return empty
      const { data, error } = await supabase
        .from('card_transactions')
        .select('*')
        .eq('company_id', companyId)
        .order('transaction_date', { ascending: false });
      
      if (error) {
        console.log('card_transactions table may not exist:', error.message);
        return [];
      }
      
      return (data || []).map((tx: any) => ({
        id: tx.id,
        date: new Date(tx.transaction_date).toLocaleString('de-DE'),
        cardNumber: tx.card_number || '**** ****',
        holderName: tx.holder_name || 'Unbekannt',
        merchant: tx.merchant || '',
        category: tx.category || 'Sonstiges',
        amount: tx.amount || 0,
        status: tx.status || 'completed'
      })) as Transaction[];
    },
    enabled: !!companyId
  });

  const categories = [...new Set(transactions.map(t => t.category))];

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.holderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.cardNumber.includes(searchQuery);
    const matchesCategory = categoryFilter === "all" || tx.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Filter */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche nach Händler, Name oder Karte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="completed">Abgeschlossen</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
              <SelectItem value="declined">Abgelehnt</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Zusammenfassung */}
        <div className="flex items-center justify-between p-4 mb-4 rounded-lg bg-muted/50">
          <div className="text-sm text-muted-foreground">
            {filteredTransactions.length} Transaktionen
          </div>
          <div className="font-medium">
            Summe: <span className={totalAmount < 0 ? 'text-destructive' : 'text-green-600'}>
              {totalAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
            </span>
          </div>
        </div>

        {/* Tabelle */}
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Keine Transaktionen vorhanden</p>
            <p className="text-sm text-muted-foreground mt-1">Kartentransaktionen werden hier angezeigt</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Karte</TableHead>
                <TableHead>Händler</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => {
                const status = statusConfig[tx.status] || statusConfig.completed;
                const categoryColor = categoryColors[tx.category] || "bg-gray-100 text-gray-700";
                
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{tx.cardNumber}</div>
                          <div className="text-xs text-muted-foreground">{tx.holderName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{tx.merchant}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={categoryColor}>{tx.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`flex items-center justify-end gap-1 font-medium ${tx.amount < 0 ? 'text-destructive' : 'text-green-600'}`}>
                        {tx.amount < 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                        {Math.abs(tx.amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={status.className}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
