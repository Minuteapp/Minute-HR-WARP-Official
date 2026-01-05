import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Receipt, 
  Calculator, 
  Car, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  MapPin,
  Euro,
  Camera
} from "lucide-react";
import AdvancedExpenseForm from "./AdvancedExpenseForm";
import ExpenseApprovalWorkflow from "./ExpenseApprovalWorkflow";
import ExpenseReportsTab from "./ExpenseReportsTab";
import MileageCalculator from "./MileageCalculator";
import PerDiemCalculator from "./PerDiemCalculator";
import ExpenseCategoriesTab from "./ExpenseCategoriesTab";
import PerDiemTab from "./PerDiemTab";
import CompanyCardsTab from "./CompanyCardsTab";
import ExpenseWorkflowTab from "./ExpenseWorkflowTab";

interface ExpenseManagementTabProps {
  tripId?: string;
}

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  approval_status: 'approved' | 'in_review' | 'rejected' | 'draft' | 'paid';
  expense_date: string;
  receipt_upload_path?: string;
  mileage_km?: number;
}

const ExpenseManagementTab = ({ tripId }: ExpenseManagementTabProps) => {
  const [activeExpenseTab, setActiveExpenseTab] = useState("overview");
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const { user } = useAuth();

  // KRITISCH: Echte Expenses aus DB mit company_id Filter
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', tripId, user?.id],
    queryFn: async () => {
      if (!tripId || !user?.id) return [];

      // WICHTIG: RLS Policy auf expenses table erzwingt automatisch company_id Filter
      const { data, error } = await supabase
        .from('travel_expenses')
        .select('*')
        .eq('travel_request_id', tripId)
        .order('expense_date', { ascending: false });

      if (error) {
        console.error('Error loading expenses:', error);
        return [];
      }

      return data as Expense[];
    },
    enabled: !!tripId && !!user?.id
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_review": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-green-100 text-green-800">Genehmigt</Badge>;
      case "in_review": return <Badge className="bg-yellow-100 text-yellow-800">In Prüfung</Badge>;
      case "rejected": return <Badge className="bg-red-100 text-red-800">Abgelehnt</Badge>;
      case "paid": return <Badge className="bg-blue-100 text-blue-800">Ausgezahlt</Badge>;
      default: return <Badge variant="outline">Entwurf</Badge>;
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const approvedExpenses = expenses.filter(e => e.approval_status === 'approved');
  const inReviewExpenses = expenses.filter(e => e.approval_status === 'in_review');
  const draftExpenses = expenses.filter(e => e.approval_status === 'draft');

  if (!tripId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Receipt className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Reise ausgewählt</h3>
          <p className="text-gray-500 text-center">
            Bitte wählen Sie eine Geschäftsreise aus, um die Spesen zu verwalten.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <div className="text-center">
            <Clock className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Lade Spesen...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Spesenabrechnung</h3>
          <p className="text-muted-foreground">
            Vollständige Erfassung und Verwaltung Ihrer Reisekosten
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsExpenseFormOpen(true)}
          >
            <Camera className="mr-2 h-4 w-4" />
            Beleg scannen
          </Button>
          <Button onClick={() => setIsExpenseFormOpen(true)}>
            <Receipt className="mr-2 h-4 w-4" />
            Neue Ausgabe
          </Button>
        </div>
      </div>

      <Tabs value={activeExpenseTab} onValueChange={setActiveExpenseTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="categories">Kategorien</TabsTrigger>
          <TabsTrigger value="per-diem">Per-Diem</TabsTrigger>
          <TabsTrigger value="mileage">Kilometer</TabsTrigger>
          <TabsTrigger value="cards">Firmenkarten</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="reports">Berichte</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Kosten-Übersicht */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Gesamtkosten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  <Euro className="h-5 w-5 mr-1" />
                  {totalExpenses.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {expenses.length} Ausgaben erfasst
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Genehmigt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  €{approvedExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {approvedExpenses.length} Ausgabe(n) genehmigt
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Prüfung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  €{inReviewExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {inReviewExpenses.length} Ausgabe(n) in Prüfung
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Entwürfe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">
                  €{draftExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {draftExpenses.length} Entwurf/Entwürfe gespeichert
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ausgaben-Liste */}
          <Card>
            <CardHeader>
              <CardTitle>Aktuelle Ausgaben</CardTitle>
              <CardDescription>
                Alle erfassten Ausgaben für diese Geschäftsreise
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Receipt className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Noch keine Ausgaben erfasst. Klicken Sie auf "Neue Ausgabe", um zu beginnen.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div 
                      key={expense.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(expense.approval_status)}
                        <div>
                          <h4 className="font-medium">{expense.description}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="secondary">{expense.category}</Badge>
                            <span>{expense.expense_date}</span>
                            {expense.mileage_km && (
                              <span className="flex items-center gap-1">
                                <Car className="h-3 w-3" />
                                {expense.mileage_km} km
                              </span>
                            )}
                            {expense.receipt_upload_path && (
                              <span className="flex items-center gap-1">
                                <Upload className="h-3 w-3" />
                                Beleg
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold">
                            {expense.amount.toFixed(2)} {expense.currency}
                          </p>
                          {getStatusBadge(expense.approval_status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <ExpenseCategoriesTab />
        </TabsContent>

        <TabsContent value="per-diem">
          <PerDiemTab />
        </TabsContent>

        <TabsContent value="mileage">
          <MileageCalculator tripId={tripId} />
        </TabsContent>

        <TabsContent value="cards">
          <CompanyCardsTab />
        </TabsContent>

        <TabsContent value="workflow">
          <ExpenseWorkflowTab />
        </TabsContent>

        <TabsContent value="reports">
          <ExpenseReportsTab tripId={tripId} />
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export & Integration</CardTitle>
              <CardDescription>
                Exportieren Sie Ihre Spesendaten für die Buchhaltung und Lohnabrechnung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Als PDF exportieren
                </Button>
                <Button variant="outline" className="justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  Excel Export
                </Button>
                <Button variant="outline" className="justify-start">
                  <Calculator className="mr-2 h-4 w-4" />
                  DATEV Export
                </Button>
                <Button variant="outline" className="justify-start">
                  <Euro className="mr-2 h-4 w-4" />
                  Lohn & Gehalt Integration
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Automatische Integration</h4>
                <p className="text-sm text-blue-800">
                  Genehmigte Spesen werden automatisch in die nächste Gehaltsabrechnung übertragen. 
                  Sie erhalten eine Benachrichtigung, sobald die Auszahlung verarbeitet wurde.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AdvancedExpenseForm
        open={isExpenseFormOpen}
        onOpenChange={setIsExpenseFormOpen}
        tripId={tripId}
      />
    </div>
  );
};

export default ExpenseManagementTab;
