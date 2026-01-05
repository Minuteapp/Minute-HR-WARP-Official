
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useBusinessTravel } from "@/hooks/useBusinessTravel";
import { ExpenseFormData } from "@/types/business-travel";
import { Loader2, Receipt, EuroIcon, Calendar } from "lucide-react";

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
}

const EXPENSE_CATEGORIES = [
  "Transport",
  "Unterkunft",
  "Verpflegung",
  "Treibstoff",
  "Tickets",
  "Taxi",
  "Konferenzgebühren",
  "Geschäftsessen",
  "Bürobedarf",
  "Internet/Telekommunikation",
  "Andere"
];

const ExpenseFormDialog = ({ open, onOpenChange, tripId }: ExpenseFormDialogProps) => {
  const { addExpense, isSubmitting } = useBusinessTravel();

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<ExpenseFormData>({
    defaultValues: {
      description: "",
      category: "Transport",
      amount: 0,
      currency: "EUR",
      expense_date: new Date().toISOString().split('T')[0],
      notes: ""
    }
  });

  const onSubmit = async (data: ExpenseFormData) => {
    const success = await addExpense(data);
    
    if (success) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) reset();
      onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neue Ausgabe hinzufügen</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <div className="relative">
                <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  id="description" 
                  className="pl-10"
                  placeholder="z.B. Bahnticket, Hotelübernachtung"
                  {...register("description", { required: "Beschreibung ist erforderlich" })}
                />
              </div>
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <Select 
                  defaultValue="Transport" 
                  onValueChange={(value) => setValue("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expense_date">Datum</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    id="expense_date" 
                    type="date"
                    className="pl-10"
                    {...register("expense_date", { required: "Datum ist erforderlich" })}
                  />
                </div>
                {errors.expense_date && <p className="text-sm text-red-500">{errors.expense_date.message}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Betrag</Label>
                <div className="relative">
                  <EuroIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    id="amount" 
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-10"
                    {...register("amount", { 
                      required: "Betrag ist erforderlich",
                      valueAsNumber: true,
                      min: { value: 0.01, message: "Betrag muss positiv sein" }
                    })}
                  />
                </div>
                {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Währung</Label>
                <Select 
                  defaultValue="EUR" 
                  onValueChange={(value) => setValue("currency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Währung auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="USD">US-Dollar (USD)</SelectItem>
                    <SelectItem value="GBP">Britisches Pfund (GBP)</SelectItem>
                    <SelectItem value="CHF">Schweizer Franken (CHF)</SelectItem>
                    <SelectItem value="JPY">Japanischer Yen (JPY)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Anmerkungen (optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Zusätzliche Informationen zur Ausgabe"
                {...register("notes")}
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gespeichert...
                </>
              ) : "Ausgabe speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseFormDialog;
