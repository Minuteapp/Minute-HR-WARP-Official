import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Wallet, Tags, DollarSign, GitBranch, Receipt, Car, Plus, Trash2, ChevronLeft,
  Building2, Globe, CreditCard, FileCheck, Users, Bell, Shield, Calculator, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";

interface ExpensesFormState {
  categories: Array<{ id: string; name: string; limit: number; subcategories: string[] }>;
  category_required: boolean;
  subcategories_enabled: boolean;
  user_can_suggest_categories: boolean;
  ai_categorization: boolean;
  default_category: string;
  category_specific_fields: boolean;
  daily_limit: number;
  weekly_limit: number;
  monthly_limit: number;
  yearly_limit: number;
  auto_approve_limit: number;
  limit_warnings_enabled: boolean;
  warning_threshold: number;
  block_over_limit: boolean;
  auto_escalation: boolean;
  manager_exception: boolean;
  limit_reset_period: string;
  auto_approval_enabled: boolean;
  auto_approval_limit: number;
  max_auto_approvals_per_week: number;
  require_receipt_for_auto: boolean;
  verified_categories_only: boolean;
  multi_level_approval: boolean;
  auto_substitute: boolean;
  escalation_hours: number;
  notify_on_escalation: boolean;
  default_substitute: string;
  receipt_always_required: boolean;
  receipt_required_from: number;
  original_required_from: number;
  allow_photos: boolean;
  allow_pdf: boolean;
  ocr_enabled: boolean;
  auto_amount_extraction: boolean;
  auto_date_extraction: boolean;
  merchant_recognition: boolean;
  duplicate_check: boolean;
  ocr_language: string;
  retention_years: number;
  gobd_compliant: boolean;
  auto_delete_after_retention: boolean;
  max_file_size_mb: number;
  car_rate: number;
  electric_car_rate: number;
  motorcycle_rate: number;
  bicycle_rate: number;
  passenger_allowance_enabled: boolean;
  passenger_rate: number;
  private_vehicle_allowed: boolean;
  max_daily_km: number;
  parking_reimbursable: boolean;
  toll_reimbursable: boolean;
  ferry_reimbursable: boolean;
  gps_tracking_enabled: boolean;
  route_planner_integration: boolean;
  auto_route_calculation: boolean;
  default_route_type: string;
  standard_vat_rate: number;
  reduced_vat_rate: number;
  auto_vat_calculation: boolean;
  input_tax_deduction: boolean;
  reverse_charge: boolean;
  meal_allowances_enabled: boolean;
  domestic_8_24_hours: number;
  domestic_over_24_hours: number;
  meal_reduction_enabled: boolean;
  breakfast_reduction: number;
  lunch_reduction: number;
  dinner_reduction: number;
  credit_card_import: boolean;
  auto_matching: boolean;
  sepa_export: boolean;
  auto_transfer: boolean;
  notify_on_new_expense: boolean;
  notify_on_approval: boolean;
  notify_on_rejection: boolean;
  notify_on_inquiry: boolean;
  notify_on_reimbursement: boolean;
  weekly_summary: boolean;
  push_notifications: boolean;
  pending_receipt_reminder: boolean;
  reminder_after_days: number;
}

export default function ExpenseSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getValue, saveSettings, loading } = useEffectiveSettings('expenses');
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState<ExpensesFormState>({
    categories: [
      { id: "1", name: "Reisekosten", limit: 1000, subcategories: ["Flug", "Hotel", "Bahn"] },
      { id: "2", name: "Bewirtung", limit: 200, subcategories: ["Geschäftsessen", "Teamevents"] },
      { id: "3", name: "Büromaterial", limit: 100, subcategories: ["Schreibwaren", "IT-Zubehör"] },
      { id: "4", name: "Fortbildung", limit: 500, subcategories: ["Kurse", "Bücher", "Konferenzen"] },
    ],
    category_required: true,
    subcategories_enabled: true,
    user_can_suggest_categories: false,
    ai_categorization: false,
    default_category: 'sonstige',
    category_specific_fields: true,
    daily_limit: 150,
    weekly_limit: 500,
    monthly_limit: 1500,
    yearly_limit: 15000,
    auto_approve_limit: 50,
    limit_warnings_enabled: true,
    warning_threshold: 70,
    block_over_limit: false,
    auto_escalation: true,
    manager_exception: true,
    limit_reset_period: 'monthly',
    auto_approval_enabled: true,
    auto_approval_limit: 50,
    max_auto_approvals_per_week: 10,
    require_receipt_for_auto: true,
    verified_categories_only: true,
    multi_level_approval: true,
    auto_substitute: true,
    escalation_hours: 48,
    notify_on_escalation: true,
    default_substitute: 'next',
    receipt_always_required: true,
    receipt_required_from: 10,
    original_required_from: 250,
    allow_photos: true,
    allow_pdf: true,
    ocr_enabled: true,
    auto_amount_extraction: true,
    auto_date_extraction: true,
    merchant_recognition: true,
    duplicate_check: true,
    ocr_language: 'de',
    retention_years: 10,
    gobd_compliant: true,
    auto_delete_after_retention: false,
    max_file_size_mb: 10,
    car_rate: 0.30,
    electric_car_rate: 0.25,
    motorcycle_rate: 0.20,
    bicycle_rate: 0.05,
    passenger_allowance_enabled: true,
    passenger_rate: 0.02,
    private_vehicle_allowed: true,
    max_daily_km: 200,
    parking_reimbursable: true,
    toll_reimbursable: true,
    ferry_reimbursable: true,
    gps_tracking_enabled: false,
    route_planner_integration: true,
    auto_route_calculation: true,
    default_route_type: 'fastest',
    standard_vat_rate: 19,
    reduced_vat_rate: 7,
    auto_vat_calculation: true,
    input_tax_deduction: true,
    reverse_charge: false,
    meal_allowances_enabled: true,
    domestic_8_24_hours: 14,
    domestic_over_24_hours: 28,
    meal_reduction_enabled: true,
    breakfast_reduction: 5.6,
    lunch_reduction: 11.2,
    dinner_reduction: 11.2,
    credit_card_import: false,
    auto_matching: false,
    sepa_export: false,
    auto_transfer: false,
    notify_on_new_expense: true,
    notify_on_approval: true,
    notify_on_rejection: true,
    notify_on_inquiry: true,
    notify_on_reimbursement: true,
    weekly_summary: false,
    push_notifications: false,
    pending_receipt_reminder: true,
    reminder_after_days: 3,
  });

  useEffect(() => {
    if (!loading) {
      setFormState(prev => ({
        ...prev,
        categories: getValue('categories', prev.categories) as typeof prev.categories,
        category_required: getValue('category_required', prev.category_required) as boolean,
        subcategories_enabled: getValue('subcategories_enabled', prev.subcategories_enabled) as boolean,
        user_can_suggest_categories: getValue('user_can_suggest_categories', prev.user_can_suggest_categories) as boolean,
        ai_categorization: getValue('ai_categorization', prev.ai_categorization) as boolean,
        default_category: getValue('default_category', prev.default_category) as string,
        category_specific_fields: getValue('category_specific_fields', prev.category_specific_fields) as boolean,
        daily_limit: getValue('daily_limit', prev.daily_limit) as number,
        weekly_limit: getValue('weekly_limit', prev.weekly_limit) as number,
        monthly_limit: getValue('monthly_limit', prev.monthly_limit) as number,
        yearly_limit: getValue('yearly_limit', prev.yearly_limit) as number,
        auto_approve_limit: getValue('auto_approve_limit', prev.auto_approve_limit) as number,
        limit_warnings_enabled: getValue('limit_warnings_enabled', prev.limit_warnings_enabled) as boolean,
        warning_threshold: getValue('warning_threshold', prev.warning_threshold) as number,
        block_over_limit: getValue('block_over_limit', prev.block_over_limit) as boolean,
        auto_escalation: getValue('auto_escalation', prev.auto_escalation) as boolean,
        manager_exception: getValue('manager_exception', prev.manager_exception) as boolean,
        limit_reset_period: getValue('limit_reset_period', prev.limit_reset_period) as string,
        auto_approval_enabled: getValue('auto_approval_enabled', prev.auto_approval_enabled) as boolean,
        auto_approval_limit: getValue('auto_approval_limit', prev.auto_approval_limit) as number,
        max_auto_approvals_per_week: getValue('max_auto_approvals_per_week', prev.max_auto_approvals_per_week) as number,
        require_receipt_for_auto: getValue('require_receipt_for_auto', prev.require_receipt_for_auto) as boolean,
        verified_categories_only: getValue('verified_categories_only', prev.verified_categories_only) as boolean,
        multi_level_approval: getValue('multi_level_approval', prev.multi_level_approval) as boolean,
        auto_substitute: getValue('auto_substitute', prev.auto_substitute) as boolean,
        escalation_hours: getValue('escalation_hours', prev.escalation_hours) as number,
        notify_on_escalation: getValue('notify_on_escalation', prev.notify_on_escalation) as boolean,
        default_substitute: getValue('default_substitute', prev.default_substitute) as string,
        receipt_always_required: getValue('receipt_always_required', prev.receipt_always_required) as boolean,
        receipt_required_from: getValue('receipt_required_from', prev.receipt_required_from) as number,
        original_required_from: getValue('original_required_from', prev.original_required_from) as number,
        allow_photos: getValue('allow_photos', prev.allow_photos) as boolean,
        allow_pdf: getValue('allow_pdf', prev.allow_pdf) as boolean,
        ocr_enabled: getValue('ocr_enabled', prev.ocr_enabled) as boolean,
        auto_amount_extraction: getValue('auto_amount_extraction', prev.auto_amount_extraction) as boolean,
        auto_date_extraction: getValue('auto_date_extraction', prev.auto_date_extraction) as boolean,
        merchant_recognition: getValue('merchant_recognition', prev.merchant_recognition) as boolean,
        duplicate_check: getValue('duplicate_check', prev.duplicate_check) as boolean,
        ocr_language: getValue('ocr_language', prev.ocr_language) as string,
        retention_years: getValue('retention_years', prev.retention_years) as number,
        gobd_compliant: getValue('gobd_compliant', prev.gobd_compliant) as boolean,
        auto_delete_after_retention: getValue('auto_delete_after_retention', prev.auto_delete_after_retention) as boolean,
        max_file_size_mb: getValue('max_file_size_mb', prev.max_file_size_mb) as number,
        car_rate: getValue('car_rate', prev.car_rate) as number,
        electric_car_rate: getValue('electric_car_rate', prev.electric_car_rate) as number,
        motorcycle_rate: getValue('motorcycle_rate', prev.motorcycle_rate) as number,
        bicycle_rate: getValue('bicycle_rate', prev.bicycle_rate) as number,
        passenger_allowance_enabled: getValue('passenger_allowance_enabled', prev.passenger_allowance_enabled) as boolean,
        passenger_rate: getValue('passenger_rate', prev.passenger_rate) as number,
        private_vehicle_allowed: getValue('private_vehicle_allowed', prev.private_vehicle_allowed) as boolean,
        max_daily_km: getValue('max_daily_km', prev.max_daily_km) as number,
        parking_reimbursable: getValue('parking_reimbursable', prev.parking_reimbursable) as boolean,
        toll_reimbursable: getValue('toll_reimbursable', prev.toll_reimbursable) as boolean,
        ferry_reimbursable: getValue('ferry_reimbursable', prev.ferry_reimbursable) as boolean,
        gps_tracking_enabled: getValue('gps_tracking_enabled', prev.gps_tracking_enabled) as boolean,
        route_planner_integration: getValue('route_planner_integration', prev.route_planner_integration) as boolean,
        auto_route_calculation: getValue('auto_route_calculation', prev.auto_route_calculation) as boolean,
        default_route_type: getValue('default_route_type', prev.default_route_type) as string,
        standard_vat_rate: getValue('standard_vat_rate', prev.standard_vat_rate) as number,
        reduced_vat_rate: getValue('reduced_vat_rate', prev.reduced_vat_rate) as number,
        auto_vat_calculation: getValue('auto_vat_calculation', prev.auto_vat_calculation) as boolean,
        input_tax_deduction: getValue('input_tax_deduction', prev.input_tax_deduction) as boolean,
        reverse_charge: getValue('reverse_charge', prev.reverse_charge) as boolean,
        meal_allowances_enabled: getValue('meal_allowances_enabled', prev.meal_allowances_enabled) as boolean,
        domestic_8_24_hours: getValue('domestic_8_24_hours', prev.domestic_8_24_hours) as number,
        domestic_over_24_hours: getValue('domestic_over_24_hours', prev.domestic_over_24_hours) as number,
        meal_reduction_enabled: getValue('meal_reduction_enabled', prev.meal_reduction_enabled) as boolean,
        breakfast_reduction: getValue('breakfast_reduction', prev.breakfast_reduction) as number,
        lunch_reduction: getValue('lunch_reduction', prev.lunch_reduction) as number,
        dinner_reduction: getValue('dinner_reduction', prev.dinner_reduction) as number,
        credit_card_import: getValue('credit_card_import', prev.credit_card_import) as boolean,
        auto_matching: getValue('auto_matching', prev.auto_matching) as boolean,
        sepa_export: getValue('sepa_export', prev.sepa_export) as boolean,
        auto_transfer: getValue('auto_transfer', prev.auto_transfer) as boolean,
        notify_on_new_expense: getValue('notify_on_new_expense', prev.notify_on_new_expense) as boolean,
        notify_on_approval: getValue('notify_on_approval', prev.notify_on_approval) as boolean,
        notify_on_rejection: getValue('notify_on_rejection', prev.notify_on_rejection) as boolean,
        notify_on_inquiry: getValue('notify_on_inquiry', prev.notify_on_inquiry) as boolean,
        notify_on_reimbursement: getValue('notify_on_reimbursement', prev.notify_on_reimbursement) as boolean,
        weekly_summary: getValue('weekly_summary', prev.weekly_summary) as boolean,
        push_notifications: getValue('push_notifications', prev.push_notifications) as boolean,
        pending_receipt_reminder: getValue('pending_receipt_reminder', prev.pending_receipt_reminder) as boolean,
        reminder_after_days: getValue('reminder_after_days', prev.reminder_after_days) as number,
      }));
    }
  }, [loading, getValue]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(formState);
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Spesen-Einstellungen wurden erfolgreich aktualisiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/settings")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">Spesen-Einstellungen</h1>
            <p className="text-sm text-muted-foreground">Konfigurieren Sie Kategorien, Limits, Workflows und Compliance</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Speichern
          </Button>
        </div>
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              <span className="hidden lg:inline">Kategorien</span>
            </TabsTrigger>
            <TabsTrigger value="limits" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden lg:inline">Limits</span>
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span className="hidden lg:inline">Workflows</span>
            </TabsTrigger>
            <TabsTrigger value="receipts" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden lg:inline">Belege</span>
            </TabsTrigger>
            <TabsTrigger value="mileage" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              <span className="hidden lg:inline">Kilometer</span>
            </TabsTrigger>
            <TabsTrigger value="tax" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden lg:inline">Steuer</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden lg:inline">Integrationen</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden lg:inline">Benachrichtigungen</span>
            </TabsTrigger>
          </TabsList>

          {/* Kategorien Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Spesenkategorien</CardTitle>
                <CardDescription>Verwalten Sie die verfügbaren Kategorien und Unterkategorien</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formState.categories.map((category, index) => (
                  <div key={category.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-4">
                      <Input 
                        value={category.name} 
                        onChange={(e) => {
                          const newCats = [...formState.categories];
                          newCats[index] = { ...category, name: e.target.value };
                          setFormState(prev => ({ ...prev, categories: newCats }));
                        }}
                        className="flex-1" 
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Limit:</span>
                        <Input 
                          type="number" 
                          value={category.limit} 
                          onChange={(e) => {
                            const newCats = [...formState.categories];
                            newCats[index] = { ...category, limit: parseInt(e.target.value) || 0 };
                            setFormState(prev => ({ ...prev, categories: newCats }));
                          }}
                          className="w-24" 
                        />
                        <span className="text-sm text-muted-foreground">€</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          const newCats = formState.categories.filter((_, i) => i !== index);
                          setFormState(prev => ({ ...prev, categories: newCats }));
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((sub, idx) => (
                        <Badge key={idx} variant="secondary">{sub}</Badge>
                      ))}
                      <Button variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Unterkategorie
                      </Button>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const newCat = { id: Date.now().toString(), name: 'Neue Kategorie', limit: 100, subcategories: [] };
                    setFormState(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Kategorie hinzufügen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kategorie-Einstellungen</CardTitle>
                <CardDescription>Allgemeine Einstellungen für Kategorien</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Kategorie bei Erfassung erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Jede Spese muss kategorisiert werden</p>
                  </div>
                  <Switch 
                    checked={formState.category_required} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, category_required: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Unterkategorien aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Detailliertere Kategorisierung ermöglichen</p>
                  </div>
                  <Switch 
                    checked={formState.subcategories_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, subcategories_enabled: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mitarbeiter können Kategorien vorschlagen</Label>
                    <p className="text-sm text-muted-foreground">Neue Kategorievorschläge sammeln</p>
                  </div>
                  <Switch 
                    checked={formState.user_can_suggest_categories} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, user_can_suggest_categories: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Kategorisierung (KI)</Label>
                    <p className="text-sm text-muted-foreground">Belege automatisch kategorisieren</p>
                  </div>
                  <Switch 
                    checked={formState.ai_categorization} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, ai_categorization: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Standard-Kategorie</Label>
                  <Select 
                    value={formState.default_category} 
                    onValueChange={(value) => setFormState(prev => ({ ...prev, default_category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reise">Reisekosten</SelectItem>
                      <SelectItem value="bewirtung">Bewirtung</SelectItem>
                      <SelectItem value="buero">Büromaterial</SelectItem>
                      <SelectItem value="sonstige">Sonstige</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Kategorie-spezifische Pflichtfelder</Label>
                    <p className="text-sm text-muted-foreground">Zusätzliche Felder pro Kategorie</p>
                  </div>
                  <Switch 
                    checked={formState.category_specific_fields} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, category_specific_fields: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Limits Tab */}
          <TabsContent value="limits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Allgemeine Budget-Limits</CardTitle>
                <CardDescription>Definieren Sie globale Ausgabenlimits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tägliches Limit pro Mitarbeiter (€)</Label>
                    <Input 
                      type="number" 
                      value={formState.daily_limit} 
                      onChange={(e) => setFormState(prev => ({ ...prev, daily_limit: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Wöchentliches Limit pro Mitarbeiter (€)</Label>
                    <Input 
                      type="number" 
                      value={formState.weekly_limit} 
                      onChange={(e) => setFormState(prev => ({ ...prev, weekly_limit: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monatliches Limit pro Mitarbeiter (€)</Label>
                    <Input 
                      type="number" 
                      value={formState.monthly_limit} 
                      onChange={(e) => setFormState(prev => ({ ...prev, monthly_limit: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Jährliches Limit pro Mitarbeiter (€)</Label>
                    <Input 
                      type="number" 
                      value={formState.yearly_limit} 
                      onChange={(e) => setFormState(prev => ({ ...prev, yearly_limit: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Maximalbetrag ohne Genehmigung (€)</Label>
                  <Input 
                    type="number" 
                    value={formState.auto_approve_limit} 
                    onChange={(e) => setFormState(prev => ({ ...prev, auto_approve_limit: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limit-Warnungen</CardTitle>
                <CardDescription>Konfigurieren Sie Benachrichtigungen bei Limit-Erreichung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Limit-Warnungen aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Benachrichtige bei Limit-Annäherung</p>
                  </div>
                  <Switch 
                    checked={formState.limit_warnings_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, limit_warnings_enabled: checked }))} 
                  />
                </div>
                <div className="space-y-3">
                  <Label>Warnung bei Erreichung von: {formState.warning_threshold}%</Label>
                  <Slider 
                    value={[formState.warning_threshold]} 
                    onValueChange={([value]) => setFormState(prev => ({ ...prev, warning_threshold: value }))}
                    max={100} 
                    step={5} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Überschreitung blockieren</Label>
                    <p className="text-sm text-muted-foreground">Sperre neue Spesen bei Limit-Überschreitung</p>
                  </div>
                  <Switch 
                    checked={formState.block_over_limit} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, block_over_limit: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Eskalation</Label>
                    <p className="text-sm text-muted-foreground">Informiere Vorgesetzte bei Überschreitung</p>
                  </div>
                  <Switch 
                    checked={formState.auto_escalation} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_escalation: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ausnahmen für Führungskräfte</Label>
                    <p className="text-sm text-muted-foreground">Höhere Limits für Management</p>
                  </div>
                  <Switch 
                    checked={formState.manager_exception} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, manager_exception: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Limit-Reset-Zeitraum</Label>
                  <Select 
                    value={formState.limit_reset_period} 
                    onValueChange={(value) => setFormState(prev => ({ ...prev, limit_reset_period: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                      <SelectItem value="quarterly">Quartalsweise</SelectItem>
                      <SelectItem value="yearly">Jährlich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Genehmigung</CardTitle>
                <CardDescription>Automatische Freigabe für kleine Beträge</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Genehmigung aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Kleine Beträge automatisch genehmigen</p>
                  </div>
                  <Switch 
                    checked={formState.auto_approval_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_approval_enabled: checked }))} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Auto-Genehmigung bis (€)</Label>
                    <Input 
                      type="number" 
                      value={formState.auto_approval_limit} 
                      onChange={(e) => setFormState(prev => ({ ...prev, auto_approval_limit: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max. Auto-Genehmigungen pro Woche</Label>
                    <Input 
                      type="number" 
                      value={formState.max_auto_approvals_per_week} 
                      onChange={(e) => setFormState(prev => ({ ...prev, max_auto_approvals_per_week: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nur mit Beleg auto-genehmigen</Label>
                    <p className="text-sm text-muted-foreground">Beleg erforderlich für Auto-Genehmigung</p>
                  </div>
                  <Switch 
                    checked={formState.require_receipt_for_auto} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, require_receipt_for_auto: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nur verifizierte Kategorien</Label>
                    <p className="text-sm text-muted-foreground">Nur Standard-Kategorien auto-genehmigen</p>
                  </div>
                  <Switch 
                    checked={formState.verified_categories_only} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, verified_categories_only: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mehrstufige Genehmigung</CardTitle>
                <CardDescription>Genehmigungsstufen nach Betragshöhe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mehrstufige Genehmigung aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Mehrere Genehmiger für hohe Beträge</p>
                  </div>
                  <Switch 
                    checked={formState.multi_level_approval} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, multi_level_approval: checked }))} 
                  />
                </div>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Stufe 1: Teamleiter</span>
                      <Badge>0 - 500 €</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Direkter Vorgesetzter genehmigt</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Stufe 2: + Abteilungsleiter</span>
                      <Badge>500 - 2000 €</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Zusätzliche Genehmigung erforderlich</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Stufe 3: + Geschäftsführung</span>
                      <Badge>Ab 2000 €</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Dreifache Genehmigung erforderlich</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vertretungsregelungen</CardTitle>
                <CardDescription>Genehmigung bei Abwesenheit des Vorgesetzten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Vertretung</Label>
                    <p className="text-sm text-muted-foreground">Weiterleitung an Vertreter bei Abwesenheit</p>
                  </div>
                  <Switch 
                    checked={formState.auto_substitute} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_substitute: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Eskalation nach (Stunden)</Label>
                  <Input 
                    type="number" 
                    value={formState.escalation_hours} 
                    onChange={(e) => setFormState(prev => ({ ...prev, escalation_hours: parseInt(e.target.value) || 48 }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Benachrichtigung bei Eskalation</Label>
                    <p className="text-sm text-muted-foreground">Informiere alle Beteiligten</p>
                  </div>
                  <Switch 
                    checked={formState.notify_on_escalation} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, notify_on_escalation: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Standard-Vertreter</Label>
                  <Select 
                    value={formState.default_substitute} 
                    onValueChange={(value) => setFormState(prev => ({ ...prev, default_substitute: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="next">Nächsthöherer Vorgesetzter</SelectItem>
                      <SelectItem value="hr">HR-Abteilung</SelectItem>
                      <SelectItem value="finance">Finanzabteilung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Belege Tab */}
          <TabsContent value="receipts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Belegpflichten</CardTitle>
                <CardDescription>Regeln für Belegnachweise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Beleg immer erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Alle Spesen benötigen einen Beleg</p>
                  </div>
                  <Switch 
                    checked={formState.receipt_always_required} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, receipt_always_required: checked }))} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Beleg erforderlich ab (€)</Label>
                    <Input 
                      type="number" 
                      value={formState.receipt_required_from} 
                      onChange={(e) => setFormState(prev => ({ ...prev, receipt_required_from: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Originalbeleg erforderlich ab (€)</Label>
                    <Input 
                      type="number" 
                      value={formState.original_required_from} 
                      onChange={(e) => setFormState(prev => ({ ...prev, original_required_from: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Handyfotos erlauben</Label>
                    <p className="text-sm text-muted-foreground">Fotos von Belegen akzeptieren</p>
                  </div>
                  <Switch 
                    checked={formState.allow_photos} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, allow_photos: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>PDF-Upload erlauben</Label>
                    <p className="text-sm text-muted-foreground">Digitale Rechnungen akzeptieren</p>
                  </div>
                  <Switch 
                    checked={formState.allow_pdf} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, allow_pdf: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>OCR & Automatisierung</CardTitle>
                <CardDescription>Automatische Belegverarbeitung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>OCR-Belegverarbeitung</Label>
                    <p className="text-sm text-muted-foreground">Automatische Texterkennung aktivieren</p>
                  </div>
                  <Switch 
                    checked={formState.ocr_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, ocr_enabled: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Betragsextraktion</Label>
                    <p className="text-sm text-muted-foreground">Betrag aus Beleg automatisch auslesen</p>
                  </div>
                  <Switch 
                    checked={formState.auto_amount_extraction} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_amount_extraction: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Datumsextraktion</Label>
                    <p className="text-sm text-muted-foreground">Belegdatum automatisch erkennen</p>
                  </div>
                  <Switch 
                    checked={formState.auto_date_extraction} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_date_extraction: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Händlererkennung</Label>
                    <p className="text-sm text-muted-foreground">Verkäufer automatisch identifizieren</p>
                  </div>
                  <Switch 
                    checked={formState.merchant_recognition} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, merchant_recognition: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Duplikatprüfung</Label>
                    <p className="text-sm text-muted-foreground">Bereits eingereichte Belege erkennen</p>
                  </div>
                  <Switch 
                    checked={formState.duplicate_check} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, duplicate_check: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>OCR-Sprache</Label>
                  <Select 
                    value={formState.ocr_language} 
                    onValueChange={(value) => setFormState(prev => ({ ...prev, ocr_language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="en">Englisch</SelectItem>
                      <SelectItem value="multi">Mehrsprachig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aufbewahrung & Archivierung</CardTitle>
                <CardDescription>Einstellungen zur Belegarchivierung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Aufbewahrungsfrist (Jahre)</Label>
                  <Input 
                    type="number" 
                    value={formState.retention_years} 
                    onChange={(e) => setFormState(prev => ({ ...prev, retention_years: parseInt(e.target.value) || 10 }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>GoBD-konform archivieren</Label>
                    <p className="text-sm text-muted-foreground">Revisionssichere Archivierung</p>
                  </div>
                  <Switch 
                    checked={formState.gobd_compliant} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, gobd_compliant: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Löschung nach Frist</Label>
                    <p className="text-sm text-muted-foreground">Belege nach Aufbewahrungsfrist löschen</p>
                  </div>
                  <Switch 
                    checked={formState.auto_delete_after_retention} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_delete_after_retention: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximale Dateigröße (MB)</Label>
                  <Input 
                    type="number" 
                    value={formState.max_file_size_mb} 
                    onChange={(e) => setFormState(prev => ({ ...prev, max_file_size_mb: parseInt(e.target.value) || 10 }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kilometer Tab */}
          <TabsContent value="mileage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kilometersätze</CardTitle>
                <CardDescription>Erstattungssätze für verschiedene Fahrzeugtypen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>PKW (€/km)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={formState.car_rate} 
                      onChange={(e) => setFormState(prev => ({ ...prev, car_rate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-Auto (€/km)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={formState.electric_car_rate} 
                      onChange={(e) => setFormState(prev => ({ ...prev, electric_car_rate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Motorrad (€/km)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={formState.motorcycle_rate} 
                      onChange={(e) => setFormState(prev => ({ ...prev, motorcycle_rate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fahrrad/E-Bike (€/km)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={formState.bicycle_rate} 
                      onChange={(e) => setFormState(prev => ({ ...prev, bicycle_rate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mitfahrer-Pauschale</Label>
                    <p className="text-sm text-muted-foreground">Zusätzlich pro Mitfahrer</p>
                  </div>
                  <Switch 
                    checked={formState.passenger_allowance_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, passenger_allowance_enabled: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mitfahrer-Pauschale (€/km)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formState.passenger_rate} 
                    onChange={(e) => setFormState(prev => ({ ...prev, passenger_rate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dienstreise-Regelungen</CardTitle>
                <CardDescription>Regeln für Geschäftsfahrten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Privatfahrzeug erlaubt</Label>
                    <p className="text-sm text-muted-foreground">Erstattung für private Fahrzeuge</p>
                  </div>
                  <Switch 
                    checked={formState.private_vehicle_allowed} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, private_vehicle_allowed: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximale Kilometererstattung pro Tag</Label>
                  <Input 
                    type="number" 
                    value={formState.max_daily_km} 
                    onChange={(e) => setFormState(prev => ({ ...prev, max_daily_km: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Parkgebühren erstattungsfähig</Label>
                    <p className="text-sm text-muted-foreground">Parkkosten werden erstattet</p>
                  </div>
                  <Switch 
                    checked={formState.parking_reimbursable} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, parking_reimbursable: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mautgebühren erstattungsfähig</Label>
                    <p className="text-sm text-muted-foreground">Autobahnmaut wird erstattet</p>
                  </div>
                  <Switch 
                    checked={formState.toll_reimbursable} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, toll_reimbursable: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Fährkosten erstattungsfähig</Label>
                    <p className="text-sm text-muted-foreground">Fährgebühren werden erstattet</p>
                  </div>
                  <Switch 
                    checked={formState.ferry_reimbursable} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, ferry_reimbursable: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GPS & Tracking</CardTitle>
                <CardDescription>Automatische Streckenerfassung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>GPS-Tracking aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Automatische Streckenerfassung</p>
                  </div>
                  <Switch 
                    checked={formState.gps_tracking_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, gps_tracking_enabled: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Routenplaner-Integration</Label>
                    <p className="text-sm text-muted-foreground">Google Maps / Apple Maps nutzen</p>
                  </div>
                  <Switch 
                    checked={formState.route_planner_integration} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, route_planner_integration: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Routenberechnung</Label>
                    <p className="text-sm text-muted-foreground">Optimale Route vorschlagen</p>
                  </div>
                  <Switch 
                    checked={formState.auto_route_calculation} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_route_calculation: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Standard-Routentyp</Label>
                  <Select 
                    value={formState.default_route_type} 
                    onValueChange={(value) => setFormState(prev => ({ ...prev, default_route_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fastest">Schnellste Route</SelectItem>
                      <SelectItem value="shortest">Kürzeste Route</SelectItem>
                      <SelectItem value="eco">Eco-Route</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Steuer Tab */}
          <TabsContent value="tax" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mehrwertsteuer-Einstellungen</CardTitle>
                <CardDescription>MwSt-Sätze und Vorsteuerabzug</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Standard-MwSt-Satz (%)</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={formState.standard_vat_rate} 
                      onChange={(e) => setFormState(prev => ({ ...prev, standard_vat_rate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ermäßigter MwSt-Satz (%)</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={formState.reduced_vat_rate} 
                      onChange={(e) => setFormState(prev => ({ ...prev, reduced_vat_rate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische MwSt-Berechnung</Label>
                    <p className="text-sm text-muted-foreground">MwSt aus Bruttobeträgen berechnen</p>
                  </div>
                  <Switch 
                    checked={formState.auto_vat_calculation} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_vat_calculation: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vorsteuerabzug aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Vorsteuerbeträge ausweisen</p>
                  </div>
                  <Switch 
                    checked={formState.input_tax_deduction} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, input_tax_deduction: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Reverse-Charge-Verfahren</Label>
                    <p className="text-sm text-muted-foreground">Für internationale Rechnungen</p>
                  </div>
                  <Switch 
                    checked={formState.reverse_charge} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, reverse_charge: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verpflegungsmehraufwand</CardTitle>
                <CardDescription>Pauschalen für Dienstreisen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Verpflegungspauschalen aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Pauschalen für Dienstreisen</p>
                  </div>
                  <Switch 
                    checked={formState.meal_allowances_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, meal_allowances_enabled: checked }))} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Inland 8-24 Stunden (€)</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={formState.domestic_8_24_hours} 
                      onChange={(e) => setFormState(prev => ({ ...prev, domestic_8_24_hours: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Inland über 24 Stunden (€)</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={formState.domestic_over_24_hours} 
                      onChange={(e) => setFormState(prev => ({ ...prev, domestic_over_24_hours: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mahlzeitenkürzung aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Kürzung bei gestellten Mahlzeiten</p>
                  </div>
                  <Switch 
                    checked={formState.meal_reduction_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, meal_reduction_enabled: checked }))} 
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Frühstück (€)</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={formState.breakfast_reduction} 
                      onChange={(e) => setFormState(prev => ({ ...prev, breakfast_reduction: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mittagessen (€)</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={formState.lunch_reduction} 
                      onChange={(e) => setFormState(prev => ({ ...prev, lunch_reduction: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Abendessen (€)</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={formState.dinner_reduction} 
                      onChange={(e) => setFormState(prev => ({ ...prev, dinner_reduction: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrationen Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kreditkarten-Integration</CardTitle>
                <CardDescription>Automatischer Import von Kreditkartenabrechnungen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Kreditkarten-Import aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Transaktionen automatisch importieren</p>
                  </div>
                  <Switch 
                    checked={formState.credit_card_import} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, credit_card_import: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatisches Matching</Label>
                    <p className="text-sm text-muted-foreground">Transaktionen mit Belegen verknüpfen</p>
                  </div>
                  <Switch 
                    checked={formState.auto_matching} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_matching: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Buchhaltungs-Export</CardTitle>
                <CardDescription>Export für Buchhaltungssoftware</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SEPA-Export aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Export für Banküberweisungen</p>
                  </div>
                  <Switch 
                    checked={formState.sepa_export} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, sepa_export: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Überweisung</Label>
                    <p className="text-sm text-muted-foreground">Erstattung automatisch auslösen</p>
                  </div>
                  <Switch 
                    checked={formState.auto_transfer} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_transfer: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benachrichtigungen Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>E-Mail-Benachrichtigungen</CardTitle>
                <CardDescription>Wer wird wann per E-Mail informiert?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bei neuer Spese</Label>
                    <p className="text-sm text-muted-foreground">Vorgesetzten informieren</p>
                  </div>
                  <Switch 
                    checked={formState.notify_on_new_expense} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, notify_on_new_expense: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bei Genehmigung</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiter informieren</p>
                  </div>
                  <Switch 
                    checked={formState.notify_on_approval} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, notify_on_approval: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bei Ablehnung</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiter informieren</p>
                  </div>
                  <Switch 
                    checked={formState.notify_on_rejection} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, notify_on_rejection: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bei Rückfrage</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiter informieren</p>
                  </div>
                  <Switch 
                    checked={formState.notify_on_inquiry} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, notify_on_inquiry: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bei Erstattung</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiter informieren</p>
                  </div>
                  <Switch 
                    checked={formState.notify_on_reimbursement} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, notify_on_reimbursement: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Wöchentliche Zusammenfassung</Label>
                    <p className="text-sm text-muted-foreground">Übersicht für Vorgesetzte</p>
                  </div>
                  <Switch 
                    checked={formState.weekly_summary} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, weekly_summary: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Erinnerungen</CardTitle>
                <CardDescription>Automatische Erinnerungen konfigurieren</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push-Benachrichtigungen</Label>
                    <p className="text-sm text-muted-foreground">Mobile Benachrichtigungen</p>
                  </div>
                  <Switch 
                    checked={formState.push_notifications} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, push_notifications: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Erinnerung bei fehlendem Beleg</Label>
                    <p className="text-sm text-muted-foreground">Nachreichung anfordern</p>
                  </div>
                  <Switch 
                    checked={formState.pending_receipt_reminder} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, pending_receipt_reminder: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Erinnerung nach (Tagen)</Label>
                  <Input 
                    type="number" 
                    value={formState.reminder_after_days} 
                    onChange={(e) => setFormState(prev => ({ ...prev, reminder_after_days: parseInt(e.target.value) || 3 }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
