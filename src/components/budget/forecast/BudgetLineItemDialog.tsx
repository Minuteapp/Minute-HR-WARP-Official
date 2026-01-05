import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateBudgetLineItem, useUpdateBudgetLineItem } from '@/hooks/useBudgetScenarios';

interface BudgetLineItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetPlanId: string;
  initialData?: {
    id?: string;
    category: string;
    subcategory?: string;
    amount: number;
    currency: string;
    description?: string;
  };
}

const categories = ['Personal', 'Marketing', 'IT', 'Verwaltung', 'Sonstiges'];
const currencies = ['EUR', 'USD', 'CHF'];

export const BudgetLineItemDialog = ({ open, onOpenChange, budgetPlanId, initialData }: BudgetLineItemDialogProps) => {
  const [category, setCategory] = useState(initialData?.category || '');
  const [subcategory, setSubcategory] = useState(initialData?.subcategory || '');
  const [amount, setAmount] = useState(initialData?.amount || 0);
  const [currency, setCurrency] = useState(initialData?.currency || 'EUR');
  const [description, setDescription] = useState(initialData?.description || '');

  const createLineItem = useCreateBudgetLineItem();
  const updateLineItem = useUpdateBudgetLineItem();

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category);
      setSubcategory(initialData.subcategory || '');
      setAmount(initialData.amount);
      setCurrency(initialData.currency);
      setDescription(initialData.description || '');
    } else {
      setCategory('');
      setSubcategory('');
      setAmount(0);
      setCurrency('EUR');
      setDescription('');
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      budget_plan_id: budgetPlanId,
      category,
      subcategory: subcategory || undefined,
      amount,
      currency,
      description: description || undefined,
      dimension_type: 'general', // Standard-Dimension-Type hinzugefügt
    };

    try {
      if (initialData?.id) {
        await updateLineItem.mutateAsync({ id: initialData.id, updates: payload });
      } else {
        await createLineItem.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving budget line item:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? 'Budget-Position bearbeiten' : 'Neue Budget-Position'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Kategorie</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Kategorie auswählen" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategory">Unterkategorie</Label>
            <Input
              id="subcategory"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Betrag</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              required
              min={0}
              step={0.01}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Währung</Label>
            <Select value={currency} onValueChange={setCurrency} required>
              <SelectTrigger>
                <SelectValue placeholder="Währung auswählen" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((cur) => (
                  <SelectItem key={cur} value={cur}>
                    {cur}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createLineItem.isPending || updateLineItem.isPending}>
              {initialData?.id ? (updateLineItem.isPending ? 'Speichert...' : 'Speichern') : (createLineItem.isPending ? 'Erstellt...' : 'Erstellen')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetLineItemDialog;
