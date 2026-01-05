import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Switch } from "../../ui/switch";
import { Trash2, Edit, Plus, FileText } from "lucide-react";
import { ExpenseCategory } from "@/types/expenses";

interface User { id: string; name: string; role: string; department: string; }
interface ExpenseCategoriesProps { user: User; }

const defaultCategories: { value: ExpenseCategory; label: string; description: string; requiresReceipt: boolean; maxAmount?: number; }[] = [
  { value: 'travel', label: 'Reisekosten', description: 'Flüge, Bahnfahrten, Taxi', requiresReceipt: true, maxAmount: 5000 },
  { value: 'accommodation', label: 'Unterkunft', description: 'Hotels, Pensionen, Airbnb', requiresReceipt: true, maxAmount: 300 },
  { value: 'meals', label: 'Verpflegung', description: 'Restaurants, Catering', requiresReceipt: true, maxAmount: 100 },
  { value: 'training', label: 'Weiterbildung', description: 'Kurse, Seminare, Konferenzen', requiresReceipt: true },
  { value: 'equipment', label: 'Ausrüstung', description: 'IT-Hardware, Büroausstattung', requiresReceipt: true },
  { value: 'office_supplies', label: 'Büromaterial', description: 'Schreibwaren, Verbrauchsmaterial', requiresReceipt: false, maxAmount: 50 },
  { value: 'software', label: 'Software', description: 'Lizenzen, SaaS-Tools', requiresReceipt: true },
  { value: 'telecommunications', label: 'Telekommunikation', description: 'Handy, Internet, Telefon', requiresReceipt: true },
  { value: 'transport', label: 'Transport', description: 'ÖPNV, Parkgebühren, Kraftstoff', requiresReceipt: true },
  { value: 'entertainment', label: 'Bewirtung', description: 'Kundenessen, Events', requiresReceipt: true },
  { value: 'events', label: 'Veranstaltungen', description: 'Messen, Workshops, Networking', requiresReceipt: true },
  { value: 'marketing', label: 'Marketing', description: 'Werbung, Promotion, Materialien', requiresReceipt: true },
  { value: 'other', label: 'Sonstiges', description: 'Andere Ausgaben', requiresReceipt: true }
];

export function ExpenseCategories({ user }: ExpenseCategoriesProps) {
  const [categories, setCategories] = useState(defaultCategories);
  const [editingCategory, setEditingCategory] = useState<typeof defaultCategories[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    label: '',
    description: '',
    requiresReceipt: true,
    maxAmount: undefined as number | undefined
  });

  const handleSaveCategory = () => {
    if (editingCategory) {
      setCategories(categories.map(cat => 
        cat.value === editingCategory.value 
          ? { ...editingCategory, ...newCategory }
          : cat
      ));
      setEditingCategory(null);
    }
    setIsDialogOpen(false);
    setNewCategory({ label: '', description: '', requiresReceipt: true, maxAmount: undefined });
  };

  const handleEditCategory = (category: typeof defaultCategories[0]) => {
    setEditingCategory(category);
    setNewCategory({
      label: category.label,
      description: category.description,
      requiresReceipt: category.requiresReceipt,
      maxAmount: category.maxAmount
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Spesen-Kategorien
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Verwalten Sie die verfügbaren Kategorien für Speseneinreichungen
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setNewCategory({ label: '', description: '', requiresReceipt: true, maxAmount: undefined })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Kategorie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">Bezeichnung</Label>
                    <Input
                      id="label"
                      value={newCategory.label}
                      onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                      placeholder="z.B. Reisekosten"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Beschreibung</Label>
                    <Input
                      id="description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder="z.B. Flüge, Bahnfahrten, Taxi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAmount">Maximalbetrag (€)</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      value={newCategory.maxAmount || ''}
                      onChange={(e) => setNewCategory({ ...newCategory, maxAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="Optionaler Maximalbetrag"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requiresReceipt"
                      checked={newCategory.requiresReceipt}
                      onCheckedChange={(checked) => setNewCategory({ ...newCategory, requiresReceipt: checked })}
                    />
                    <Label htmlFor="requiresReceipt">Beleg erforderlich</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleSaveCategory}>
                    {editingCategory ? 'Aktualisieren' : 'Erstellen'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.value} className="relative">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{category.label}</h4>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-8 w-8"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {category.requiresReceipt && (
                      <Badge variant="secondary" className="text-xs">Beleg erforderlich</Badge>
                    )}
                    {category.maxAmount && (
                      <Badge variant="outline" className="text-xs">Max. {category.maxAmount}€</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}