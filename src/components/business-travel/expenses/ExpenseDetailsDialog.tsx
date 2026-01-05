import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Calendar,
  Tag,
  Store,
  Plane,
  FileText,
  Download,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ExpenseDetailsDialogProps {
  expenseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpenseDetailsDialog({
  expenseId,
  open,
  onOpenChange,
}: ExpenseDetailsDialogProps) {
  // Fetch expense details
  const { data: expense, isLoading } = useQuery({
    queryKey: ["expense-details", expenseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_trip_expenses")
        .select(`
          *,
          business_trips (
            id,
            employee_name,
            department,
            destination
          )
        `)
        .eq("id", expenseId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: open && !!expenseId,
  });

  // Fetch expense history
  const { data: history = [] } = useQuery({
    queryKey: ["expense-history", expenseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_history")
        .select("*")
        .eq("expense_id", expenseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: open && !!expenseId,
  });

  const getStatusBadge = () => {
    if (!expense) return null;
    
    if (expense.approved === true) {
      return (
        <Badge className="bg-green-500/20 text-green-700 border-green-500/30 text-base px-3 py-1">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Genehmigt
        </Badge>
      );
    }
    if (expense.ai_status === 'rejected') {
      return (
        <Badge variant="destructive" className="text-base px-3 py-1">
          <XCircle className="h-4 w-4 mr-1" />
          Abgelehnt
        </Badge>
      );
    }
    if (expense.ai_status === 'warning') {
      return (
        <Badge className="bg-orange-500/20 text-orange-700 border-orange-500/30 text-base px-3 py-1">
          <AlertCircle className="h-4 w-4 mr-1" />
          Warnung
        </Badge>
      );
    }
    if (expense.ai_status === 'processed') {
      return (
        <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30 text-base px-3 py-1">
          <Sparkles className="h-4 w-4 mr-1" />
          KI-geprüft
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30 text-base px-3 py-1">
        <Clock className="h-4 w-4 mr-1" />
        Ausstehend
      </Badge>
    );
  };

  const getHistoryIcon = (action: string) => {
    if (action.includes("Genehmigt")) return <CheckCircle2 className="h-3 w-3 text-green-500" />;
    if (action.includes("Abgelehnt")) return <XCircle className="h-3 w-3 text-red-500" />;
    if (action.includes("KI")) return <Sparkles className="h-3 w-3 text-blue-500" />;
    return <Clock className="h-3 w-3 text-muted-foreground" />;
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <div className="flex items-center justify-center py-8">
            Lade Details...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!expense) return null;

  const expenseNumber = expense.expense_number || `EXP-${expense.id.slice(0, 5).toUpperCase()}`;
  const netAmount = expense.net_amount || (expense.amount ? expense.amount / 1.19 : 0);
  const vatAmount = expense.vat_amount || (expense.amount ? expense.amount - netAmount : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Beleg-Details: {expenseNumber}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {expense.description || "Keine Beschreibung"}
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-150px)]">
          <div className="space-y-4 pr-4">
            {/* Status Card */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  {getStatusBadge()}
                  {expense.ai_confidence !== null && expense.ai_confidence !== undefined && (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{expense.ai_confidence}% KI-Konfidenz</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Employee Info */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{expense.business_trips?.employee_name || "Unbekannt"}</p>
                <p className="text-sm text-muted-foreground">{expense.business_trips?.department || "-"}</p>
              </div>
            </div>

            {/* Date & Category Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Datum</p>
                  <p className="font-medium">
                    {expense.expense_date
                      ? format(new Date(expense.expense_date), "d. MMMM yyyy", { locale: de })
                      : "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Kategorie</p>
                  <p className="font-medium">{expense.category || "-"}</p>
                </div>
              </div>
            </div>

            {/* Vendor */}
            {expense.vendor_name && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Store className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Händler/Dienstleister</p>
                  <p className="font-medium">{expense.vendor_name}</p>
                </div>
              </div>
            )}

            {/* Associated Trip */}
            {expense.business_trip_id && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Plane className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Zugeordnete Reise</p>
                  <p className="font-medium">
                    TR-{expense.business_trip_id.slice(0, 5).toUpperCase()}
                    {expense.business_trips?.destination && ` - ${expense.business_trips.destination}`}
                  </p>
                </div>
              </div>
            )}

            {/* Amount Breakdown */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Betragszusammensetzung</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nettobetrag</span>
                    <span>{netAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MwSt. ({expense.vat_rate || 19}%)</span>
                    <span>{vatAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Gesamtbetrag</span>
                    <span>{(expense.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Receipt Preview */}
            {expense.receipt_file_name && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Beleg-Vorschau</h4>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-red-500" />
                      <div>
                        <p className="font-medium">{expense.receipt_file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.file_size_kb ? `${expense.file_size_kb} KB` : "Unbekannte Größe"}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Analysis */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">KI-Analyse</h4>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">OCR erkannt</Badge>
                  <Badge variant="secondary">MwSt. validiert</Badge>
                  <Badge variant="secondary">Datum erkannt</Badge>
                  <Badge variant="secondary">Kategorie zugewiesen</Badge>
                </div>
              </CardContent>
            </Card>

            {/* History Timeline */}
            {history.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Verlauf</h4>
                  <div className="space-y-3">
                    {history.map((entry, index) => (
                      <div key={entry.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                            {getHistoryIcon(entry.action)}
                          </div>
                          {index < history.length - 1 && (
                            <div className="w-0.5 h-full bg-border mt-1" />
                          )}
                        </div>
                        <div className="pb-3">
                          <p className="font-medium text-sm">{entry.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.actor_name} • {format(new Date(entry.created_at), "d. MMM yyyy, HH:mm", { locale: de })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
