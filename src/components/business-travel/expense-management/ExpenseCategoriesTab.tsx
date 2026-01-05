import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Receipt, 
  AlertCircle,
  CheckCircle,
  Settings
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  requiresReceipt: boolean;
  vatRules: {
    standardRate: number;
    reducedRate?: number;
    deductible?: number;
  };
  perDiemApplicable: boolean;
  maxAmount?: number;
  isActive: boolean;
}

const ExpenseCategoriesTab = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([
    {
      id: "1",
      name: "Verpflegung",
      description: "Mahlzeiten und Getränke während der Geschäftsreise",
      requiresReceipt: false,
      vatRules: { standardRate: 19, reducedRate: 7 },
      perDiemApplicable: true,
      isActive: true
    },
    {
      id: "2", 
      name: "Übernachtung",
      description: "Hotel und andere Übernachtungskosten",
      requiresReceipt: true,
      vatRules: { standardRate: 19 },
      perDiemApplicable: true,
      isActive: true
    },
    {
      id: "3",
      name: "Transport", 
      description: "Flug, Bahn, Taxi, Mietwagen",
      requiresReceipt: true,
      vatRules: { standardRate: 19 },
      perDiemApplicable: false,
      isActive: true
    },
    {
      id: "4",
      name: "Bewirtung",
      description: "Geschäftsessen und Bewirtung von Kunden",
      requiresReceipt: true,
      vatRules: { standardRate: 19, deductible: 70 },
      perDiemApplicable: false,
      maxAmount: 500,
      isActive: true
    }
  ]);

  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSaveCategory = (category: ExpenseCategory) => {
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === category.id ? category : c));
    } else {
      setCategories(prev => [...prev, { ...category, id: Date.now().toString() }]);
    }
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Spesenkategorien</h3>
          <p className="text-muted-foreground">
            Verwalten Sie Kategorien für Spesen mit MwSt-Regeln und Belegpflicht
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCategory(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Kategorie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Kategorie bearbeiten" : "Neue Kategorie"}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={editingCategory}
              onSave={handleSaveCategory}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{category.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingCategory(category);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {category.requiresReceipt ? (
                  <Badge variant="destructive" className="text-xs">
                    <Receipt className="h-3 w-3 mr-1" />
                    Belegpflicht
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Kein Beleg erforderlich
                  </Badge>
                )}
                
                {category.perDiemApplicable && (
                  <Badge variant="outline" className="text-xs">
                    Per-Diem möglich
                  </Badge>
                )}

                {category.maxAmount && (
                  <Badge variant="outline" className="text-xs">
                    Max. €{category.maxAmount}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Standard MwSt:</span>
                  <span className="font-medium">{category.vatRules.standardRate}%</span>
                </div>
                
                {category.vatRules.reducedRate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ermäßigt MwSt:</span>
                    <span className="font-medium">{category.vatRules.reducedRate}%</span>
                  </div>
                )}

                {category.vatRules.deductible && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Abzugsfähig:</span>
                    <span className="font-medium">{category.vatRules.deductible}%</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <div className="flex items-center gap-2">
                    {category.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {category.isActive ? "Aktiv" : "Inaktiv"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

interface CategoryFormProps {
  category: ExpenseCategory | null;
  onSave: (category: ExpenseCategory) => void;
  onCancel: () => void;
}

const CategoryForm = ({ category, onSave, onCancel }: CategoryFormProps) => {
  const [formData, setFormData] = useState<ExpenseCategory>({
    id: category?.id || "",
    name: category?.name || "",
    description: category?.description || "",
    requiresReceipt: category?.requiresReceipt || false,
    vatRules: category?.vatRules || { standardRate: 19 },
    perDiemApplicable: category?.perDiemApplicable || false,
    maxAmount: category?.maxAmount,
    isActive: category?.isActive ?? true
  });

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="z.B. Verpflegung"
          />
        </div>
        <div>
          <Label htmlFor="maxAmount">Maximalbetrag (optional)</Label>
          <Input
            id="maxAmount"
            type="number"
            value={formData.maxAmount || ""}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              maxAmount: e.target.value ? parseFloat(e.target.value) : undefined 
            }))}
            placeholder="500"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Beschreibung der Kategorie"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Belegpflicht</Label>
          <Switch
            checked={formData.requiresReceipt}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, requiresReceipt: checked }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Per-Diem anwendbar</Label>
          <Switch
            checked={formData.perDiemApplicable}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, perDiemApplicable: checked }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Aktiv</Label>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, isActive: checked }))
            }
          />
        </div>
      </div>

      <div className="space-y-3 border-t pt-4">
        <h4 className="font-medium">MwSt-Regeln</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Standard (%)</Label>
            <Input
              type="number"
              value={formData.vatRules.standardRate}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                vatRules: {
                  ...prev.vatRules,
                  standardRate: parseFloat(e.target.value) || 0
                }
              }))}
            />
          </div>
          <div>
            <Label>Ermäßigt (%) - optional</Label>
            <Input
              type="number"
              value={formData.vatRules.reducedRate || ""}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                vatRules: {
                  ...prev.vatRules,
                  reducedRate: e.target.value ? parseFloat(e.target.value) : undefined
                }
              }))}
            />
          </div>
          <div>
            <Label>Abzugsfähig (%) - optional</Label>
            <Input
              type="number"
              value={formData.vatRules.deductible || ""}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                vatRules: {
                  ...prev.vatRules,
                  deductible: e.target.value ? parseFloat(e.target.value) : undefined
                }
              }))}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button onClick={handleSubmit}>
          {category ? "Speichern" : "Erstellen"}
        </Button>
      </div>
    </div>
  );
};

export default ExpenseCategoriesTab;