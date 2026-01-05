import { useState } from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { TripFormData, WizardExpense } from "@/types/business-travel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Plus, 
  Coins, 
  Upload, 
  Euro, 
  Car, 
  Utensils, 
  Bed, 
  Package,
  Trash2,
  FileText,
  ScanLine
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface WizardStep3Props {
  setValue: UseFormSetValue<TripFormData>;
  watch: UseFormWatch<TripFormData>;
}

const expenseCategories = [
  { value: "transport", label: "Transport", icon: Car },
  { value: "food", label: "Verpflegung", icon: Utensils },
  { value: "accommodation", label: "Unterkunft", icon: Bed },
  { value: "other", label: "Sonstiges", icon: Package },
];

const WizardStep3Expenses = ({ setValue, watch }: WizardStep3Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "",
    amount: 0,
    description: "",
  });

  const expenses = watch("wizard_expenses") || [];

  const handleAddExpense = () => {
    if (!newExpense.category || newExpense.amount <= 0) return;

    const expense: WizardExpense = {
      id: uuidv4(),
      category: newExpense.category,
      amount: newExpense.amount,
      description: newExpense.description,
    };

    setValue("wizard_expenses", [...expenses, expense]);
    setNewExpense({ category: "", amount: 0, description: "" });
    setIsDialogOpen(false);
  };

  const handleRemoveExpense = (id: string) => {
    setValue("wizard_expenses", expenses.filter((e) => e.id !== id));
  };

  const getCategoryIcon = (category: string) => {
    const cat = expenseCategories.find((c) => c.value === category);
    return cat?.icon || Package;
  };

  const getCategoryLabel = (category: string) => {
    const cat = expenseCategories.find((c) => c.value === category);
    return cat?.label || category;
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Spesen & Belege (optional)</h3>
          <p className="text-sm text-muted-foreground">
            Fügen Sie bereits bekannte Ausgaben hinzu
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Spesen hinzufügen
        </Button>
      </div>

      {/* Expenses List or Empty State */}
      {expenses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Coins className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-medium mb-1">Noch keine Spesen hinzugefügt</h4>
            <p className="text-sm text-muted-foreground">
              Sie können Spesen jetzt oder nach Genehmigung der Reise hinzufügen
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => {
            const Icon = getCategoryIcon(expense.category);
            return (
              <Card key={expense.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{getCategoryLabel(expense.category)}</p>
                      {expense.description && (
                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">
                      {expense.amount.toLocaleString('de-DE')} €
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Total */}
          <div className="flex justify-end pt-2 border-t">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Erfasste Spesen gesamt</p>
              <p className="text-xl font-bold">{totalExpenses.toLocaleString('de-DE')} €</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Neue Spesen hinzufügen</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Select
                value={newExpense.category}
                onValueChange={(value) =>
                  setNewExpense({ ...newExpense, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="h-4 w-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense_amount">Betrag (€)</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="expense_amount"
                  type="number"
                  value={newExpense.amount || ""}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense_description">Beschreibung</Label>
              <Input
                id="expense_description"
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, description: e.target.value })
                }
                placeholder="Kurze Beschreibung"
              />
            </div>

            <div className="space-y-2">
              <Label>Beleg hochladen</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm">
                  <span className="text-primary font-medium">Datei auswählen</span>
                  {" "}oder mit{" "}
                  <span className="text-primary font-medium">OCR scannen</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG bis 10 MB
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleAddExpense} disabled={!newExpense.category || newExpense.amount <= 0}>
              Hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WizardStep3Expenses;
