import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { 
  Loader2, 
  Receipt, 
  EuroIcon, 
  Calendar, 
  Camera, 
  Upload, 
  MapPin, 
  Car,
  Utensils,
  Bed,
  CreditCard,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface AdvancedExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  existingExpense?: any;
}

interface ExpenseFormData {
  description: string;
  category: string;
  amount: number;
  currency: string;
  expense_date: string;
  notes?: string;
  receipt_required: boolean;
  mileage_km?: number;
  vehicle_type?: string;
  per_diem_days?: number;
  per_diem_country?: string;
  per_diem_city?: string;
  exchange_rate?: number;
  original_amount?: number;
  original_currency?: string;
  tax_amount?: number;
  is_tax_deductible: boolean;
}

const EXPENSE_CATEGORIES = [
  { value: "transport", label: "Transport", icon: Car },
  { value: "accommodation", label: "Unterkunft", icon: Bed },
  { value: "meals", label: "Verpflegung", icon: Utensils },
  { value: "fuel", label: "Treibstoff", icon: Car },
  { value: "parking", label: "Parken", icon: MapPin },
  { value: "taxi", label: "Taxi/Uber", icon: Car },
  { value: "conference", label: "Konferenzgebühren", icon: Receipt },
  { value: "business_meal", label: "Geschäftsessen", icon: Utensils },
  { value: "office_supplies", label: "Bürobedarf", icon: Receipt },
  { value: "telecom", label: "Internet/Telekom", icon: Receipt },
  { value: "other", label: "Sonstiges", icon: Receipt }
];

const CURRENCIES = [
  { value: "EUR", label: "Euro (€)" },
  { value: "USD", label: "US-Dollar ($)" },
  { value: "GBP", label: "Britisches Pfund (£)" },
  { value: "CHF", label: "Schweizer Franken (CHF)" },
  { value: "JPY", label: "Japanischer Yen (¥)" }
];

const AdvancedExpenseForm = ({ open, onOpenChange, tripId, existingExpense }: AdvancedExpenseFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrData, setOcrData] = useState<any>(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ExpenseFormData>({
    defaultValues: {
      description: existingExpense?.description || "",
      category: existingExpense?.category || "transport",
      amount: existingExpense?.amount || 0,
      currency: existingExpense?.currency || "EUR",
      expense_date: existingExpense?.expense_date || new Date().toISOString().split('T')[0],
      notes: existingExpense?.notes || "",
      receipt_required: false,
      is_tax_deductible: true,
      exchange_rate: 1.0
    }
  });

  const watchedCurrency = watch("currency");
  const watchedCategory = watch("category");

  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setReceiptFile(file);
    setOcrProcessing(true);

    // OCR processing - requires integration with an OCR service
    setTimeout(() => {
      // OCR-Dienst nicht verfügbar - zeige Info-Meldung
      setOcrProcessing(false);
      toast.info("OCR-Erkennung ist noch nicht konfiguriert. Bitte geben Sie die Daten manuell ein.");
    }, 1000);
  };

  const calculateExchangeRate = async (fromCurrency: string, toCurrency: string) => {
    // Mock exchange rate - in real app, this would call an exchange rate API
    const rates: Record<string, number> = {
      "USD": 1.08,
      "GBP": 0.87,
      "CHF": 0.95,
      "JPY": 162.0
    };
    
    if (fromCurrency === "EUR") {
      setValue("exchange_rate", rates[toCurrency] || 1.0);
    } else {
      setValue("exchange_rate", 1 / (rates[fromCurrency] || 1.0));
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Ausgabe erfolgreich gespeichert!");
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Fehler beim Speichern der Ausgabe");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) reset();
      onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingExpense ? "Ausgabe bearbeiten" : "Neue Ausgabe erfassen"}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Grunddaten</TabsTrigger>
            <TabsTrigger value="receipt">Beleg</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="review">Überprüfung</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung</Label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input 
                      id="description" 
                      className="pl-10"
                      placeholder="z.B. Bahnticket Hamburg-München"
                      {...register("description", { required: "Beschreibung ist erforderlich" })}
                    />
                  </div>
                  {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategorie</Label>
                    <Select 
                      defaultValue="transport" 
                      onValueChange={(value) => setValue("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategorie auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <category.icon className="h-4 w-4" />
                              {category.label}
                            </div>
                          </SelectItem>
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
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
                      onValueChange={(value) => {
                        setValue("currency", value);
                        if (value !== "EUR") {
                          calculateExchangeRate(value, "EUR");
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Währung" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="receipt" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Beleg erfassen
                  </CardTitle>
                  <CardDescription>
                    Laden Sie Ihren Beleg hoch für automatische OCR-Erkennung
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="receipt-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {ocrProcessing ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="w-10 h-10 mb-3 text-gray-400 animate-spin" />
                            <p className="mb-2 text-sm text-gray-500">Beleg wird verarbeitet...</p>
                          </div>
                        ) : receiptFile ? (
                          <div className="flex flex-col items-center">
                            <CheckCircle className="w-10 h-10 mb-3 text-green-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">{receiptFile.name}</span> hochgeladen
                            </p>
                            {ocrData && (
                              <Badge className="bg-green-100 text-green-800">
                                OCR erfolgreich verarbeitet
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Klicken Sie hier</span> oder ziehen Sie den Beleg hierher
                            </p>
                            <p className="text-xs text-gray-500">PDF, PNG, JPG (MAX. 10MB)</p>
                          </div>
                        )}
                      </div>
                      <input 
                        id="receipt-upload" 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleReceiptUpload}
                      />
                    </label>
                  </div>

                  {ocrData && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Automatisch erkannte Daten
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
                        <div>Betrag: {ocrData.amount} EUR</div>
                        <div>Datum: {ocrData.date}</div>
                        <div>Anbieter: {ocrData.vendor}</div>
                        <div>Steuer: {ocrData.tax_amount} EUR</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {/* Kilometerpauschale für Transport */}
              {watchedCategory === "transport" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Kilometerpauschale
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mileage_km">Gefahrene Kilometer</Label>
                        <Input 
                          id="mileage_km" 
                          type="number"
                          min="0"
                          {...register("mileage_km", { valueAsNumber: true })}
                          placeholder="z.B. 150"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicle_type">Fahrzeugtyp</Label>
                        <Select onValueChange={(value) => setValue("vehicle_type", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Fahrzeug wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="car">PKW (0,30 €/km)</SelectItem>
                            <SelectItem value="motorcycle">Motorrad (0,20 €/km)</SelectItem>
                            <SelectItem value="bicycle">Fahrrad (0,05 €/km)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Fremdwährung */}
              {watchedCurrency !== "EUR" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Fremdwährung
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="original_amount">Original-Betrag</Label>
                        <Input 
                          id="original_amount" 
                          type="number"
                          step="0.01"
                          {...register("original_amount", { valueAsNumber: true })}
                          placeholder={`Betrag in ${watchedCurrency}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="exchange_rate">Wechselkurs</Label>
                        <Input 
                          id="exchange_rate" 
                          type="number"
                          step="0.0001"
                          {...register("exchange_rate", { valueAsNumber: true })}
                          placeholder="z.B. 1.0850"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Steuerliche Behandlung */}
              <Card>
                <CardHeader>
                  <CardTitle>Steuerliche Behandlung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_tax_deductible"
                      {...register("is_tax_deductible")}
                    />
                    <Label htmlFor="is_tax_deductible">Steuerlich absetzbar</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tax_amount">Steuerbetrag (optional)</Label>
                    <Input 
                      id="tax_amount" 
                      type="number"
                      step="0.01"
                      {...register("tax_amount", { valueAsNumber: true })}
                      placeholder="Ausgewiesene MwSt."
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="notes">Anmerkungen (optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Zusätzliche Informationen zur Ausgabe"
                  {...register("notes")}
                />
              </div>
            </TabsContent>

            <TabsContent value="review" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Zusammenfassung</CardTitle>
                  <CardDescription>
                    Überprüfen Sie Ihre Eingaben vor dem Speichern
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Beschreibung:</span>
                      <span>{watch("description") || "Nicht angegeben"}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Kategorie:</span>
                      <Badge variant="secondary">
                        {EXPENSE_CATEGORIES.find(cat => cat.value === watchedCategory)?.label}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Betrag:</span>
                      <span className="text-lg font-bold">
                        {watch("amount")?.toFixed(2)} {watch("currency")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Datum:</span>
                      <span>{watch("expense_date")}</span>
                    </div>
                    {receiptFile && (
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">Beleg:</span>
                        <Badge className="bg-green-100 text-green-800">
                          {receiptFile.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </form>
        </Tabs>
        
        <DialogFooter className="pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gespeichert...
              </>
            ) : "Ausgabe speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedExpenseForm;