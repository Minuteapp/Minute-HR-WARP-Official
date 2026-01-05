import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Euro,
  Bed,
  Car,
  Utensils,
  Plane,
  Package,
  Plus,
  ChevronRight,
  ArrowLeft,
  Settings,
  Download,
  Search,
  Filter,
  TrendingUp,
  BarChart3,
  CheckCircle,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const categoryIcons: Record<string, any> = {
  euro: Euro,
  bed: Bed,
  car: Car,
  utensils: Utensils,
  plane: Plane,
  package: Package,
};

const categoryColors: Record<string, string> = {
  violet: "bg-violet-100 text-violet-600",
  orange: "bg-orange-100 text-orange-600",
  green: "bg-green-100 text-green-600",
  blue: "bg-blue-100 text-blue-600",
  red: "bg-red-100 text-red-600",
  gray: "bg-gray-100 text-gray-600",
};

export function ExpenseCategoriesTab() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    code: "",
    icon: "euro",
    color: "violet",
    budget_limit: 0,
    limit_per_transaction: 0,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: typeof newCategory) => {
      const { data: companyId, error: rpcError } = await supabase.rpc('get_effective_company_id');
      if (rpcError || !companyId) {
        throw new Error('Keine Firma zugeordnet');
      }

      const { data, error } = await supabase
        .from('expense_categories')
        .insert({
          name: categoryData.name,
          code: categoryData.code || categoryData.name.toUpperCase().slice(0, 3),
          icon: categoryData.icon,
          color: categoryData.color,
          budget_limit: categoryData.budget_limit || 0,
          limit_per_transaction: categoryData.limit_per_transaction || 0,
          company_id: companyId,
          category_type: 'expense',
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast({ title: 'Kategorie erstellt', description: 'Die Spesenkategorie wurde erfolgreich angelegt.' });
      setShowCreateDialog(false);
      setNewCategory({ name: "", code: "", icon: "euro", color: "violet", budget_limit: 0, limit_per_transaction: 0 });
    },
    onError: (error: any) => {
      toast({ title: 'Fehler', description: error.message || 'Die Kategorie konnte nicht erstellt werden.', variant: 'destructive' });
    },
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["category-expenses", selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const { data, error } = await supabase
        .from("business_trip_expenses")
        .select(`
          *,
          business_trips(trip_number, destination)
        `)
        .eq("category", selectedCategory)
        .order("expense_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCategory,
  });

  const selectedCategoryData = categories.find((c: any) => c.id === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Detail View
  if (selectedCategory && selectedCategoryData) {
    const Icon = categoryIcons[selectedCategoryData.icon] || Euro;
    const budgetPercent = selectedCategoryData.budget_limit > 0 
      ? Math.round((selectedCategoryData.budget_used / selectedCategoryData.budget_limit) * 100)
      : 0;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
            <div className={`p-3 rounded-xl ${categoryColors[selectedCategoryData.color] || categoryColors.violet}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{selectedCategoryData.name}</h2>
              <p className="text-muted-foreground">Detaillierte Kategorie-Analyse und Transaktionsübersicht</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Einstellungen
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* 5 Statistics Cards */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Euro className="h-4 w-4" />
                <span className="text-sm">Diesen Monat</span>
              </div>
              <p className="text-2xl font-bold">
                {selectedCategoryData.budget_used?.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +12% vs. Vormonat
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm">Budget</span>
              </div>
              <p className="text-2xl font-bold">
                {selectedCategoryData.budget_limit?.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
              </p>
              <p className="text-xs text-muted-foreground">{budgetPercent}% genutzt</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Transaktionen</span>
              </div>
              <p className="text-2xl font-bold">{selectedCategoryData.transaction_count || 0}</p>
              <p className="text-xs text-muted-foreground">Dieses Jahr</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Euro className="h-4 w-4" />
                <span className="text-sm">Ø Betrag</span>
              </div>
              <p className="text-2xl font-bold">
                {selectedCategoryData.average_amount?.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
              </p>
              <p className="text-xs text-muted-foreground">Pro Transaktion</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Compliance</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{selectedCategoryData.compliance_rate || 100}%</p>
              <p className="text-xs text-muted-foreground">Regelkonform</p>
            </CardContent>
          </Card>
        </div>

        {/* Budget & Top Departments */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Budget-Auslastung</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={budgetPercent} className="h-3 mb-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{selectedCategoryData.budget_used?.toLocaleString("de-DE")} € verwendet</span>
                <span>{selectedCategoryData.budget_limit?.toLocaleString("de-DE")} € Limit</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Abteilungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(selectedCategoryData.top_departments || []).slice(0, 3).map((dept: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <Badge variant="outline">{dept}</Badge>
                  </div>
                ))}
                {(!selectedCategoryData.top_departments || selectedCategoryData.top_departments.length === 0) && (
                  <p className="text-sm text-muted-foreground">Keine Daten verfügbar</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche nach Mitarbeiter, Beschreibung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <div className="flex border rounded-lg">
            {(["week", "month", "year"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="rounded-none first:rounded-l-lg last:rounded-r-lg"
              >
                {range === "week" ? "Woche" : range === "month" ? "Monat" : "Jahr"}
              </Button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaktionen ({expenses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Keine Transaktionen gefunden</p>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense: any) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">MA</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{expense.vendor_name || "Unbekannt"}</span>
                          <Badge variant="outline" className="text-xs">
                            {expense.business_trips?.destination || "Keine Reise"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {expense.expense_date && format(new Date(expense.expense_date), "dd. MMM yyyy", { locale: de })}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{expense.expense_number || "TX-00000"}</span>
                          {expense.receipt_path ? (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                              <FileText className="h-3 w-3 mr-1" />
                              Beleg vorhanden
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-red-600 border-red-200 bg-red-50">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Beleg fehlt
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="font-bold">
                          {expense.amount?.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                        </p>
                        {expense.amount > (selectedCategoryData.limit_per_transaction || 999999) && (
                          <Badge variant="destructive" className="text-xs">Über Limit</Badge>
                        )}
                      </div>
                      <Badge
                        variant={expense.approved ? "default" : "secondary"}
                        className={expense.approved ? "bg-green-100 text-green-700" : ""}
                      >
                        {expense.approved ? "Genehmigt" : "Ausstehend"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Overview - Category Cards
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Spesenkategorien</h2>
          <p className="text-muted-foreground">Verwalten und überwachen Sie alle Spesenkategorien</p>
        </div>
        <Button className="bg-primary" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Kategorie
        </Button>
      </div>

      {/* Category Cards Grid */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Keine Kategorien vorhanden</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Erstellen Sie Ihre erste Spesenkategorie, um Ausgaben zu organisieren.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Kategorie erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category: any) => {
            const Icon = categoryIcons[category.icon] || Euro;
            const budgetPercent = category.budget_limit > 0 
              ? Math.round((category.budget_used / category.budget_limit) * 100)
              : 0;

            return (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${categoryColors[category.color] || categoryColors.violet}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.transaction_count || 0} Transaktionen</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Budget Nutzung</span>
                        <span className="font-medium">
                          {category.budget_used?.toLocaleString("de-DE")}€ / {category.budget_limit?.toLocaleString("de-DE")}€
                        </span>
                      </div>
                      <Progress value={budgetPercent} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{budgetPercent}% genutzt</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Ø Betrag</span>
                        <p className="font-medium">{category.average_amount?.toLocaleString("de-DE")} €</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Limit</span>
                        <p className="font-medium">{category.limit_per_transaction?.toLocaleString("de-DE")} €</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Compliance</span>
                        <p className="font-medium text-green-600">{category.compliance_rate || 100}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={category.is_active ? "default" : "secondary"} className="ml-1">
                          {category.is_active ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </div>
                    </div>

                    {category.top_departments && category.top_departments.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">Top Abteilungen</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {category.top_departments.slice(0, 3).map((dept: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {dept}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Category Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Neue Spesenkategorie erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie eine neue Kategorie zur Organisation Ihrer Spesen.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="z.B. Verpflegung"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Code (optional)</Label>
              <Input
                id="code"
                placeholder="z.B. VER"
                value={newCategory.code}
                onChange={(e) => setNewCategory({ ...newCategory, code: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="icon">Icon</Label>
                <Select 
                  value={newCategory.icon} 
                  onValueChange={(value) => setNewCategory({ ...newCategory, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Icon wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="euro">Euro</SelectItem>
                    <SelectItem value="bed">Unterkunft</SelectItem>
                    <SelectItem value="car">Fahrzeug</SelectItem>
                    <SelectItem value="utensils">Verpflegung</SelectItem>
                    <SelectItem value="plane">Flug</SelectItem>
                    <SelectItem value="package">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">Farbe</Label>
                <Select 
                  value={newCategory.color} 
                  onValueChange={(value) => setNewCategory({ ...newCategory, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Farbe wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="violet">Violett</SelectItem>
                    <SelectItem value="blue">Blau</SelectItem>
                    <SelectItem value="green">Grün</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="red">Rot</SelectItem>
                    <SelectItem value="gray">Grau</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="budget_limit">Budget-Limit (€)</Label>
                <Input
                  id="budget_limit"
                  type="number"
                  placeholder="0"
                  value={newCategory.budget_limit || ""}
                  onChange={(e) => setNewCategory({ ...newCategory, budget_limit: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="limit_per_transaction">Transaktions-Limit (€)</Label>
                <Input
                  id="limit_per_transaction"
                  type="number"
                  placeholder="0"
                  value={newCategory.limit_per_transaction || ""}
                  onChange={(e) => setNewCategory({ ...newCategory, limit_per_transaction: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={() => createCategoryMutation.mutate(newCategory)}
              disabled={!newCategory.name.trim() || createCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
