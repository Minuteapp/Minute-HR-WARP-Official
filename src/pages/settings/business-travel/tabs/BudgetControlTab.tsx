import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "sonner";
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Globe,
  PieChart,
  Target,
  Settings,
  Loader2
} from "lucide-react";

interface FormState {
  budget_period: string;
  allocation_type: string;
  budget_stop_at_100: boolean;
  warning_at_80: boolean;
  escalation_at_90: boolean;
  reserve_on_approval: boolean;
  release_reservation_days: number;
  primary_currency: string;
  auto_convert: boolean;
  rate_source: string;
  foreign_fee_percent: number;
  credit_card_fee_percent: number;
  flight_price_benchmark: boolean;
  hotel_benchmark: boolean;
  benchmark_warning_threshold: number;
  auto_assign_cost_center: boolean;
  budget_reconciliation: boolean;
  transfer_tax_relevant: boolean;
  calculate_fringe_benefits: boolean;
}

export default function BudgetControlTab() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('business_travel');
  const [saving, setSaving] = useState(false);

  const [formState, setFormState] = useState<FormState>({
    budget_period: 'yearly',
    allocation_type: 'department',
    budget_stop_at_100: true,
    warning_at_80: true,
    escalation_at_90: false,
    reserve_on_approval: true,
    release_reservation_days: 30,
    primary_currency: 'EUR',
    auto_convert: true,
    rate_source: 'ECB',
    foreign_fee_percent: 2.5,
    credit_card_fee_percent: 1.5,
    flight_price_benchmark: true,
    hotel_benchmark: true,
    benchmark_warning_threshold: 20,
    auto_assign_cost_center: true,
    budget_reconciliation: true,
    transfer_tax_relevant: true,
    calculate_fringe_benefits: false,
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        budget_period: getValue('budget_period', 'yearly') as string,
        allocation_type: getValue('allocation_type', 'department') as string,
        budget_stop_at_100: getValue('budget_stop_at_100', true) as boolean,
        warning_at_80: getValue('warning_at_80', true) as boolean,
        escalation_at_90: getValue('escalation_at_90', false) as boolean,
        reserve_on_approval: getValue('reserve_on_approval', true) as boolean,
        release_reservation_days: getValue('release_reservation_days', 30) as number,
        primary_currency: getValue('primary_currency', 'EUR') as string,
        auto_convert: getValue('auto_convert', true) as boolean,
        rate_source: getValue('rate_source', 'ECB') as string,
        foreign_fee_percent: getValue('foreign_fee_percent', 2.5) as number,
        credit_card_fee_percent: getValue('credit_card_fee_percent', 1.5) as number,
        flight_price_benchmark: getValue('flight_price_benchmark', true) as boolean,
        hotel_benchmark: getValue('hotel_benchmark', true) as boolean,
        benchmark_warning_threshold: getValue('benchmark_warning_threshold', 20) as number,
        auto_assign_cost_center: getValue('auto_assign_cost_center', true) as boolean,
        budget_reconciliation: getValue('budget_reconciliation', true) as boolean,
        transfer_tax_relevant: getValue('transfer_tax_relevant', true) as boolean,
        calculate_fringe_benefits: getValue('calculate_fringe_benefits', false) as boolean,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(formState);
      toast.success("Budget-Einstellungen gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const budgets = [
    { name: 'IT-Abteilung', total: 50000, used: 32000, reserved: 8000, remaining: 10000 },
    { name: 'Marketing', total: 75000, used: 45000, reserved: 15000, remaining: 15000 },
    { name: 'Sales', total: 120000, used: 89000, reserved: 21000, remaining: 10000 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-sky-600" />
            Budget-Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {budgets.map((budget, index) => {
              const usedPercentage = (budget.used / budget.total) * 100;
              const reservedPercentage = (budget.reserved / budget.total) * 100;
              
              return (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2">{budget.name}</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Gesamt:</span>
                        <span className="font-medium">€{budget.total.toLocaleString()}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <Progress value={usedPercentage + reservedPercentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Verbraucht: €{budget.used.toLocaleString()}</span>
                          <span>Reserviert: €{budget.reserved.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Verfügbar:</span>
                        <span className={`font-medium ${budget.remaining < 15000 ? 'text-red-600' : 'text-green-600'}`}>
                          €{budget.remaining.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Budget Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-sky-600" />
            Budget-Konfiguration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="budget-period">Budget-Periode</Label>
              <Select value={formState.budget_period} onValueChange={(value) => setFormState(prev => ({...prev, budget_period: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                  <SelectItem value="quarterly">Quartalsweise</SelectItem>
                  <SelectItem value="yearly">Jährlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="allocation-type">Zuteilung nach</Label>
              <Select value={formState.allocation_type} onValueChange={(value) => setFormState(prev => ({...prev, allocation_type: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="department">Abteilung</SelectItem>
                  <SelectItem value="costcenter">Kostenstelle</SelectItem>
                  <SelectItem value="project">Projekt</SelectItem>
                  <SelectItem value="location">Standort</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spend Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Spend Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="font-medium">Harte Grenzen</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Budget-Stop bei 100%</Label>
                    <p className="text-sm text-muted-foreground">Keine neuen Buchungen möglich</p>
                  </div>
                  <Switch 
                    checked={formState.budget_stop_at_100}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, budget_stop_at_100: checked}))}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Warnung bei 80%</Label>
                    <p className="text-sm text-muted-foreground">Benachrichtigung an Manager</p>
                  </div>
                  <Switch 
                    checked={formState.warning_at_80}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, warning_at_80: checked}))}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Eskalation bei 90%</Label>
                    <p className="text-sm text-muted-foreground">Zusätzliche Genehmigung erforderlich</p>
                  </div>
                  <Switch 
                    checked={formState.escalation_at_90}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, escalation_at_90: checked}))}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label className="font-medium">Budget-Reservierung</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Bei Genehmigung reservieren</Label>
                    <p className="text-sm text-muted-foreground">Budget für genehmigte Reisen blockieren</p>
                  </div>
                  <Switch 
                    checked={formState.reserve_on_approval}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, reserve_on_approval: checked}))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Reservierung freigeben nach</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number"
                      value={formState.release_reservation_days}
                      onChange={(e) => setFormState(prev => ({...prev, release_reservation_days: Number(e.target.value)}))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground self-center">Tagen ohne Buchung</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Benchmarking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Preis-Benchmarking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="font-medium">Preisüberwachung</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label>Flugpreis vs. Median prüfen</Label>
                  <Switch 
                    checked={formState.flight_price_benchmark}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, flight_price_benchmark: checked}))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label>Hotel-Benchmark aktivieren</Label>
                  <Switch 
                    checked={formState.hotel_benchmark}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, hotel_benchmark: checked}))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Label>Warnung bei {'>'}</Label>
                    <Input 
                      type="number"
                      className="w-16"
                      value={formState.benchmark_warning_threshold}
                      onChange={(e) => setFormState(prev => ({...prev, benchmark_warning_threshold: Number(e.target.value)}))}
                    />
                    <span className="text-sm">% über Benchmark</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="font-medium">Benchmark-Quellen</Label>
              <div className="space-y-2 mt-2">
                <Badge variant="secondary">Amadeus GDS</Badge>
                <Badge variant="secondary">Hotel-APIs</Badge>
                <Badge variant="secondary">Historische Daten</Badge>
                <Button variant="outline" size="sm" className="mt-2">Quellen konfigurieren</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency & Fees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-purple-600" />
            Währungen & Gebühren
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="primary-currency">Primärwährung</Label>
              <Select value={formState.primary_currency} onValueChange={(value) => 
                setFormState(prev => ({...prev, primary_currency: value}))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="CHF">CHF - Schweizer Franken</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="rate-source">Wechselkurs-Quelle</Label>
              <Select value={formState.rate_source} onValueChange={(value) => 
                setFormState(prev => ({...prev, rate_source: value}))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ECB">EZB (Europäische Zentralbank)</SelectItem>
                  <SelectItem value="XE">XE.com</SelectItem>
                  <SelectItem value="OANDA">OANDA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 mt-6">
              <Switch
                checked={formState.auto_convert}
                onCheckedChange={(checked) => 
                  setFormState(prev => ({...prev, auto_convert: checked}))
                }
              />
              <Label>Automatische Umrechnung</Label>
            </div>
          </div>
          
          <div className="mt-4">
            <Label className="font-medium">Gebühren & Zuschläge</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <Label>Auslandsgebühren (%)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={formState.foreign_fee_percent}
                  onChange={(e) => setFormState(prev => ({...prev, foreign_fee_percent: Number(e.target.value)}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Kreditkartengebühren (%)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={formState.credit_card_fee_percent}
                  onChange={(e) => setFormState(prev => ({...prev, credit_card_fee_percent: Number(e.target.value)}))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration with Expenses/Payroll */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-indigo-600" />
            Verknüpfung Ausgaben/Payroll
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="font-medium">Ausgaben-Integration</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label>Auto-Zuordnung zu Kostenstelle</Label>
                  <Switch 
                    checked={formState.auto_assign_cost_center}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, auto_assign_cost_center: checked}))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label>Budget-Abgleich bei Spesenabrechnung</Label>
                  <Switch 
                    checked={formState.budget_reconciliation}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, budget_reconciliation: checked}))}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label className="font-medium">Payroll-Integration</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label>Steuerrelevante Spesen übertragen</Label>
                  <Switch 
                    checked={formState.transfer_tax_relevant}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, transfer_tax_relevant: checked}))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label>Geldwerter Vorteil berechnen</Label>
                  <Switch 
                    checked={formState.calculate_fringe_benefits}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, calculate_fringe_benefits: checked}))}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Configuration */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-sky-600 hover:bg-sky-700">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
          Budget-Einstellungen speichern
        </Button>
      </div>
    </div>
  );
}
