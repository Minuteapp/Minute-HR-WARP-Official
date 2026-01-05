import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseClaimSchema, type ExpenseClaimFormData } from '@/lib/validations/employeeSchemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Receipt } from 'lucide-react';

interface ExpenseClaimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (expense: any, receiptFile?: File) => Promise<void>;
  employeeId: string;
  isSubmitting: boolean;
}

export const ExpenseClaimDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  employeeId,
  isSubmitting 
}: ExpenseClaimDialogProps) => {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  const form = useForm<ExpenseClaimFormData>({
    resolver: zodResolver(expenseClaimSchema),
    defaultValues: {
      currency: 'EUR',
      category: 'other',
    },
  });

  const handleSubmit = async (data: ExpenseClaimFormData) => {
    const expenseData = {
      ...data,
      employee_id: employeeId,
      status: 'draft' as const,
    };
    await onSubmit(expenseData, receiptFile || undefined);
    form.reset();
    setReceiptFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ausgabe hinzufügen</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="z.B. Taxi zum Kundentermin" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Betrag</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Währung</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CHF">CHF (Fr)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="travel">Reisekosten</SelectItem>
                        <SelectItem value="meal">Verpflegung</SelectItem>
                        <SelectItem value="accommodation">Unterkunft</SelectItem>
                        <SelectItem value="equipment">Ausrüstung</SelectItem>
                        <SelectItem value="training">Schulung</SelectItem>
                        <SelectItem value="office_supplies">Bürobedarf</SelectItem>
                        <SelectItem value="entertainment">Bewirtung</SelectItem>
                        <SelectItem value="other">Sonstiges</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expense_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ausgabedatum</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projekt-ID (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Falls zugeordnet" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Receipt Upload */}
            <div className="space-y-2">
              <Label>Beleg hochladen (optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="receipt-upload"
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <Receipt className="w-8 h-8 mx-auto mb-1 text-muted-foreground" />
                  {receiptFile ? (
                    <p className="text-sm font-medium">{receiptFile.name}</p>
                  ) : (
                    <>
                      <p className="text-sm font-medium">Beleg auswählen</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, JPG, PNG (max. 10 MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Wird gespeichert...' : 'Hinzufügen'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
