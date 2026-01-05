import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Euro,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Search,
  Download,
  Upload,
  Eye,
  Check,
  X,
  Sparkles,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExpenseUploadDialog } from "./ExpenseUploadDialog";
import { ExpenseDetailsDialog } from "./ExpenseDetailsDialog";

interface ExpenseAccountingTabProps {
  isAdmin?: boolean;
}

export function ExpenseAccountingTab({ isAdmin = false }: ExpenseAccountingTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  
  const itemsPerPage = 10;

  // Fetch expenses with related data
  const { data: expenses = [], isLoading, refetch } = useQuery({
    queryKey: ["business-trip-expenses"],
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const pending = expenses.filter(exp => exp.ai_status === 'pending' || !exp.approved).length;
    const approved = expenses.filter(exp => exp.approved === true).length;
    const rejected = expenses.filter(exp => exp.ai_status === 'rejected').length;
    const avgAmount = expenses.length > 0 ? total / expenses.length : 0;
    const aiRecognitionRate = expenses.length > 0 
      ? (expenses.filter(exp => exp.ai_confidence && exp.ai_confidence > 80).length / expenses.length) * 100 
      : 0;

    return {
      total,
      totalCount: expenses.length,
      pending,
      approved,
      approvedPercent: expenses.length > 0 ? (approved / expenses.length) * 100 : 0,
      rejected,
      rejectedPercent: expenses.length > 0 ? (rejected / expenses.length) * 100 : 0,
      avgAmount,
      aiRecognitionRate,
    };
  }, [expenses]);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        !searchQuery ||
        expense.business_trips?.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.expense_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && (expense.ai_status === 'pending' || !expense.approved)) ||
        (statusFilter === "approved" && expense.approved === true) ||
        (statusFilter === "rejected" && expense.ai_status === 'rejected') ||
        (statusFilter === "ai_processed" && expense.ai_status === 'processed') ||
        (statusFilter === "warning" && expense.ai_status === 'warning');

      const matchesDepartment =
        departmentFilter === "all" ||
        expense.business_trips?.department === departmentFilter;

      const matchesCategory =
        categoryFilter === "all" || expense.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesDepartment && matchesCategory;
    });
  }, [expenses, searchQuery, statusFilter, departmentFilter, categoryFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique departments and categories for filters
  const departments = useMemo(() => {
    const depts = new Set(expenses.map(exp => exp.business_trips?.department).filter(Boolean));
    return Array.from(depts);
  }, [expenses]);

  const categories = useMemo(() => {
    const cats = new Set(expenses.map(exp => exp.category).filter(Boolean));
    return Array.from(cats);
  }, [expenses]);

  const getStatusBadge = (expense: any) => {
    if (expense.approved === true) {
      return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Genehmigt</Badge>;
    }
    if (expense.ai_status === 'rejected') {
      return <Badge variant="destructive">Abgelehnt</Badge>;
    }
    if (expense.ai_status === 'warning') {
      return <Badge className="bg-orange-500/20 text-orange-700 border-orange-500/30">Warnung</Badge>;
    }
    if (expense.ai_status === 'processed') {
      return <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">KI-geprüft</Badge>;
    }
    return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">Ausstehend</Badge>;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedExpenses(paginatedExpenses.map(exp => exp.id));
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleSelectExpense = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedExpenses([...selectedExpenses, id]);
    } else {
      setSelectedExpenses(selectedExpenses.filter(expId => expId !== id));
    }
  };

  const handleApprove = async (expenseId: string) => {
    await supabase
      .from("business_trip_expenses")
      .update({ approved: true, approved_at: new Date().toISOString() })
      .eq("id", expenseId);
    
    await supabase.from("expense_history").insert({
      expense_id: expenseId,
      action: "Genehmigt",
      actor_name: "Admin",
      actor_type: "user",
    });
    
    refetch();
  };

  const handleReject = async (expenseId: string) => {
    await supabase
      .from("business_trip_expenses")
      .update({ ai_status: 'rejected' })
      .eq("id", expenseId);
    
    await supabase.from("expense_history").insert({
      expense_id: expenseId,
      action: "Abgelehnt",
      actor_name: "Admin",
      actor_type: "user",
    });
    
    refetch();
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">
              {isAdmin ? "Spesenabrechnung - Alle Mitarbeiter" : "Meine Spesenabrechnung"}
            </h2>
            {isAdmin && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Admin-Ansicht
              </Badge>
            )}
            <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
              {stats.aiRecognitionRate.toFixed(0)}% KI-Erkennungsrate
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie {stats.totalCount} Belege mit KI-gestützter Erkennung
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Beleg hochladen
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Euro className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</p>
                <p className="text-sm text-muted-foreground">{stats.totalCount} Belege</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Gesamtsumme</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Zu prüfen</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Ausstehend</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">{stats.approvedPercent.toFixed(0)}%</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Genehmigt</p>
          </CardContent>
        </Card>

        <Card className="border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-sm text-muted-foreground">{stats.rejectedPercent.toFixed(0)}%</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Abgelehnt</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</p>
                <p className="text-sm text-muted-foreground">Pro Beleg</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Ø Betrag</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Suche nach Mitarbeiter, Beleg-ID, Händler..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="ai_processed">KI-geprüft</SelectItem>
                <SelectItem value="approved">Genehmigt</SelectItem>
                <SelectItem value="rejected">Abgelehnt</SelectItem>
                <SelectItem value="warning">Warnung</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Abteilung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Abteilungen</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedExpenses.length === paginatedExpenses.length && paginatedExpenses.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Mitarbeiter</TableHead>
                <TableHead>Händler/Kategorie</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Betrag</TableHead>
                <TableHead>Reise</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Lade Belege...
                  </TableCell>
                </TableRow>
              ) : paginatedExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Receipt className="h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">Keine Belege gefunden</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedExpenses.includes(expense.id)}
                        onCheckedChange={(checked) => handleSelectExpense(expense.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(expense.business_trips?.employee_name || "")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{expense.business_trips?.employee_name || "Unbekannt"}</p>
                          <p className="text-xs text-muted-foreground">{expense.business_trips?.department || "-"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{expense.vendor_name || expense.description}</p>
                        <p className="text-xs text-muted-foreground">{expense.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {expense.expense_date 
                        ? format(new Date(expense.expense_date), "d. MMM yyyy", { locale: de })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{expense.amount?.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</p>
                        {expense.vat_amount && (
                          <p className="text-xs text-muted-foreground">
                            inkl. {expense.vat_amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € MwSt.
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-xs">TR-{expense.business_trip_id?.slice(0, 5).toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.expense_number || `EXP-${expense.id.slice(0, 5).toUpperCase()}`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(expense)}
                        {expense.ai_confidence && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Sparkles className="h-3 w-3" />
                            {expense.ai_confidence}% Konfidenz
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedExpenseId(expense.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!expense.approved && expense.ai_status !== 'rejected' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleApprove(expense.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleReject(expense.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Zeige {(currentPage - 1) * itemsPerPage + 1} bis{" "}
            {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} von{" "}
            {filteredExpenses.length} Belegen
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Zurück
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Weiter
            </Button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold">KI-gestützte Belegerkennung</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Nutzen Sie die erweiterten Filter oben, um schnell spezifische Belege zu finden. 
                Das System verarbeitet Belege automatisch mit {stats.aiRecognitionRate.toFixed(0)}% Erkennungsrate 
                und validiert alle steuerrelevanten Daten. Sie können mehrere Belege gleichzeitig 
                genehmigen oder ablehnen.
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge variant="secondary">OCR-Erkennung</Badge>
                <Badge variant="secondary">MwSt.-Validierung</Badge>
                <Badge variant="secondary">Automatische Kategorisierung</Badge>
                <Badge variant="secondary">Bulk-Aktionen</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ExpenseUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUploadComplete={() => {
          refetch();
          setShowUploadDialog(false);
        }}
      />

      {selectedExpenseId && (
        <ExpenseDetailsDialog
          expenseId={selectedExpenseId}
          open={!!selectedExpenseId}
          onOpenChange={(open) => !open && setSelectedExpenseId(null)}
        />
      )}
    </div>
  );
}
