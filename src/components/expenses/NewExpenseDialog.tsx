
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ExpenseItem, Currency, ExpenseCategory, PaymentMethod, TaxClassification } from '@/types/expenses';
import { formatCurrency } from '@/utils/currencyUtils';

interface NewExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (expense: Omit<ExpenseItem, 'id' | 'created_at' | 'updated_at'>) => void;
}

export const NewExpenseDialog = ({ open, onOpenChange, onSave }: NewExpenseDialogProps) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    currency: 'EUR' as Currency,
    category: 'other' as ExpenseCategory,
    tax_classification: 'taxable' as TaxClassification,
    payment_method: 'company_card' as PaymentMethod,
    date: format(new Date(), 'yyyy-MM-dd'),
    cost_center: '',
    attachments: [],
    status: 'draft' as const,
    submitted_by: '',
    approval_chain: [],
    comments: [],
    is_recurring: false,
    is_reimbursed: false,
    audit_logs: []
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expenseData: Omit<ExpenseItem, 'id' | 'created_at' | 'updated_at'> = {
      ...formData,
      date: format(selectedDate, 'yyyy-MM-dd')
    };
    
    onSave(expenseData);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      description: '',
      amount: 0,
      currency: 'EUR' as Currency,
      category: 'other' as ExpenseCategory,
      tax_classification: 'taxable' as TaxClassification,
      payment_method: 'company_card' as PaymentMethod,
      date: format(new Date(), 'yyyy-MM-dd'),
      cost_center: '',
      attachments: [],
      status: 'draft' as const,
      submitted_by: '',
      approval_chain: [],
      comments: [],
      is_recurring: false,
      is_reimbursed: false,
      audit_logs: []
    });
    setSelectedDate(new Date());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neue Ausgabe hinzufügen</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ausgabenbeschreibung"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Betrag</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Währung</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData({ ...formData, currency: value as Currency })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value as ExpenseCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travel">Reisekosten</SelectItem>
                  <SelectItem value="accommodation">Unterkunft</SelectItem>
                  <SelectItem value="meals">Verpflegung</SelectItem>
                  <SelectItem value="training">Weiterbildung</SelectItem>
                  <SelectItem value="equipment">Ausrüstung</SelectItem>
                  <SelectItem value="office_supplies">Büromaterial</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="telecommunications">Telekommunikation</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="entertainment">Bewirtung</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Zahlungsart</Label>
              <Select 
                value={formData.payment_method} 
                onValueChange={(value) => setFormData({ ...formData, payment_method: value as PaymentMethod })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company_card">Firmenkarte</SelectItem>
                  <SelectItem value="personal_card">Private Karte</SelectItem>
                  <SelectItem value="cash">Bar</SelectItem>
                  <SelectItem value="bank_transfer">Überweisung</SelectItem>
                  <SelectItem value="company_account">Firmenkonto</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Datum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'dd.MM.yyyy', { locale: de })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost_center">Kostenstelle (optional)</Label>
            <Input
              id="cost_center"
              value={formData.cost_center}
              onChange={(e) => setFormData({ ...formData, cost_center: e.target.value })}
              placeholder="Kostenstelle"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit">
              Ausgabe speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
