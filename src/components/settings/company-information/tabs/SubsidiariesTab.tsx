import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building, Plus, Pencil, Trash2, Check, X, Users, Euro, FileText, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';

interface Subsidiary {
  id: string;
  name: string;
  legalForm: string;
  country: string;
  laborLaw: string;
  accountingCircle: string;
  currency: string;
  payrollUnit: string;
  payrollProvider: string;
  status: 'active' | 'inactive';
  hrContact: string;
  financeContact: string;
  inheritGlobalSettings: boolean;
  canOverrideSettings: boolean;
}

export function SubsidiariesTab() {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubsidiary, setEditingSubsidiary] = useState<Subsidiary | null>(null);
  const [formData, setFormData] = useState<Partial<Subsidiary>>({
    name: '',
    legalForm: '',
    country: 'DE',
    laborLaw: 'DE',
    accountingCircle: '',
    currency: 'EUR',
    payrollUnit: '',
    payrollProvider: '',
    status: 'active',
    hrContact: '',
    financeContact: '',
    inheritGlobalSettings: true,
    canOverrideSettings: false,
  });

  // Lade Tochtergesellschaften aus der Datenbank
  const { data: subsidiaries = [], isLoading } = useQuery({
    queryKey: ['subsidiaries', currentCompany?.id],
    enabled: !!currentCompany?.id,
    queryFn: async () => {
      // Lade Unternehmen die als Tochtergesellschaften markiert sind (parent_company_id = currentCompany.id)
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('parent_company_id', currentCompany?.id)
        .order('name');
      
      if (error) throw error;
      
      return (data || []).map((company: any) => ({
        id: company.id,
        name: company.name,
        legalForm: company.legal_form || 'gmbh',
        country: company.country || 'DE',
        laborLaw: company.country || 'DE',
        accountingCircle: company.accounting_circle || '',
        currency: company.currency || 'EUR',
        payrollUnit: company.payroll_unit || '',
        payrollProvider: company.payroll_provider || '',
        status: (company.is_active ? 'active' : 'inactive') as 'active' | 'inactive',
        hrContact: company.hr_contact || '',
        financeContact: company.finance_contact || '',
        inheritGlobalSettings: company.inherit_global_settings !== false,
        canOverrideSettings: company.can_override_settings === true,
      }));
    }
  });

  const legalForms = [
    { value: 'gmbh', label: 'GmbH' },
    { value: 'ag', label: 'AG' },
    { value: 'kg', label: 'KG' },
    { value: 'ug', label: 'UG' },
    { value: 'gmbh_co_kg', label: 'GmbH & Co. KG' },
    { value: 'ltd', label: 'Ltd.' },
    { value: 'sa', label: 'S.A.' },
    { value: 'bv', label: 'B.V.' },
  ];

  const countries = [
    { value: 'DE', label: 'Deutschland' },
    { value: 'AT', label: 'Österreich' },
    { value: 'CH', label: 'Schweiz' },
    { value: 'NL', label: 'Niederlande' },
    { value: 'BE', label: 'Belgien' },
    { value: 'FR', label: 'Frankreich' },
    { value: 'PL', label: 'Polen' },
    { value: 'CZ', label: 'Tschechien' },
    { value: 'UK', label: 'Vereinigtes Königreich' },
  ];

  const currencies = [
    { value: 'EUR', label: 'EUR (Euro)' },
    { value: 'CHF', label: 'CHF (Schweizer Franken)' },
    { value: 'GBP', label: 'GBP (Britisches Pfund)' },
    { value: 'PLN', label: 'PLN (Polnischer Zloty)' },
    { value: 'CZK', label: 'CZK (Tschechische Krone)' },
  ];

  const payrollProviders = [
    { value: 'datev', label: 'DATEV' },
    { value: 'sap', label: 'SAP HCM' },
    { value: 'sage', label: 'Sage' },
    { value: 'lexware', label: 'Lexware' },
    { value: 'bmd', label: 'BMD' },
    { value: 'addison', label: 'Addison' },
    { value: 'intern', label: 'Intern' },
  ];

  const handleOpenDialog = (subsidiary?: Subsidiary) => {
    if (subsidiary) {
      setEditingSubsidiary(subsidiary);
      setFormData(subsidiary);
    } else {
      setEditingSubsidiary(null);
      setFormData({
        name: '',
        legalForm: '',
        country: 'DE',
        laborLaw: 'DE',
        accountingCircle: '',
        currency: 'EUR',
        payrollUnit: '',
        payrollProvider: '',
        status: 'active',
        hrContact: '',
        financeContact: '',
        inheritGlobalSettings: true,
        canOverrideSettings: false,
      });
    }
    setIsDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Subsidiary>) => {
      const companyData = {
        name: data.name,
        legal_form: data.legalForm,
        country: data.country,
        currency: data.currency,
        is_active: data.status === 'active',
        parent_company_id: currentCompany?.id,
        // Optional fields that may not exist in schema
      };

      if (editingSubsidiary) {
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', editingSubsidiary.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('companies')
          .insert(companyData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidiaries'] });
      toast.success(editingSubsidiary ? 'Gesellschaft wurde aktualisiert' : 'Gesellschaft wurde hinzugefügt');
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Fehler beim Speichern: ' + (error as Error).message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidiaries'] });
      toast.success('Gesellschaft wurde gelöscht');
    },
    onError: (error) => {
      toast.error('Fehler beim Löschen: ' + (error as Error).message);
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (confirm('Möchten Sie diese Gesellschaft wirklich löschen?')) {
      deleteMutation.mutate(id);
    }
  };

  const getCountryLabel = (value: string) => countries.find(c => c.value === value)?.label || value;
  const getLegalFormLabel = (value: string) => legalForms.find(f => f.value === value)?.label || value;
  const getPayrollProviderLabel = (value: string) => payrollProviders.find(p => p.value === value)?.label || value;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Gesellschaften / Tochterunternehmen
              </CardTitle>
              <CardDescription>
                Verwaltung aller rechtlichen Einheiten im Konzern
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Gesellschaft
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {subsidiaries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Tochtergesellschaften angelegt</p>
              <p className="text-sm mt-2">Klicken Sie auf "Neue Gesellschaft" um eine hinzuzufügen</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Rechtsform</TableHead>
                  <TableHead>Land</TableHead>
                  <TableHead>Buchhaltungskreis</TableHead>
                  <TableHead>Payroll</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vererbung</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subsidiaries.map((subsidiary) => (
                  <TableRow key={subsidiary.id}>
                    <TableCell className="font-medium">{subsidiary.name}</TableCell>
                    <TableCell>{getLegalFormLabel(subsidiary.legalForm)}</TableCell>
                    <TableCell>{getCountryLabel(subsidiary.country)}</TableCell>
                    <TableCell>{subsidiary.accountingCircle || '-'}</TableCell>
                    <TableCell>{getPayrollProviderLabel(subsidiary.payrollProvider) || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={subsidiary.status === 'active' ? 'default' : 'secondary'}>
                        {subsidiary.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {subsidiary.inheritGlobalSettings ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(subsidiary)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(subsidiary.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSubsidiary ? 'Gesellschaft bearbeiten' : 'Neue Gesellschaft anlegen'}
            </DialogTitle>
            <DialogDescription>
              Definieren Sie die rechtlichen und operativen Eigenschaften der Gesellschaft
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Grunddaten */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Grunddaten
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Gesellschaftsname *</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Musterfirma GmbH"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rechtsform *</Label>
                  <Select value={formData.legalForm} onValueChange={(value) => setFormData({ ...formData, legalForm: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rechtsform wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {legalForms.map((form) => (
                        <SelectItem key={form.value} value={form.value}>
                          {form.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sitzland *</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value, laborLaw: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Land wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Arbeitsrecht</Label>
                  <Select value={formData.laborLaw} onValueChange={(value) => setFormData({ ...formData, laborLaw: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Land wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Finanzen */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Finanzen & Buchhaltung
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Buchhaltungskreis</Label>
                  <Input
                    value={formData.accountingCircle || ''}
                    onChange={(e) => setFormData({ ...formData, accountingCircle: e.target.value })}
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Währung *</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Währung wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lohnabrechnungseinheit</Label>
                  <Input
                    value={formData.payrollUnit || ''}
                    onChange={(e) => setFormData({ ...formData, payrollUnit: e.target.value })}
                    placeholder="DE-MAIN"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payroll-Provider</Label>
                  <Select value={formData.payrollProvider} onValueChange={(value) => setFormData({ ...formData, payrollProvider: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Provider wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {payrollProviders.map((provider) => (
                        <SelectItem key={provider.value} value={provider.value}>
                          {provider.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Ansprechpartner */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Ansprechpartner
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>HR-Ansprechpartner</Label>
                  <Input
                    value={formData.hrContact || ''}
                    onChange={(e) => setFormData({ ...formData, hrContact: e.target.value })}
                    placeholder="Name des HR-Kontakts"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Finance-Ansprechpartner</Label>
                  <Input
                    value={formData.financeContact || ''}
                    onChange={(e) => setFormData({ ...formData, financeContact: e.target.value })}
                    placeholder="Name des Finance-Kontakts"
                  />
                </div>
              </div>
            </div>

            {/* Status & Vererbung */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Status & Vererbung
              </h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktiv</SelectItem>
                      <SelectItem value="inactive">Inaktiv</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label>Globale Einstellungen übernehmen</Label>
                    <p className="text-sm text-muted-foreground">Einstellungen der übergeordneten Ebene erben</p>
                  </div>
                  <Switch
                    checked={formData.inheritGlobalSettings}
                    onCheckedChange={(checked) => setFormData({ ...formData, inheritGlobalSettings: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label>Eigene Regeln definieren</Label>
                    <p className="text-sm text-muted-foreground">Diese Gesellschaft darf abweichende Regeln festlegen</p>
                  </div>
                  <Switch
                    checked={formData.canOverrideSettings}
                    onCheckedChange={(checked) => setFormData({ ...formData, canOverrideSettings: checked })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
