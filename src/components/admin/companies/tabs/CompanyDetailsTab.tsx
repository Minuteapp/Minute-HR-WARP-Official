import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CompanyDetails } from '../types';
import { 
  Building2, 
  Upload, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  FileText, 
  Calendar,
  Users,
  TrendingUp,
  CreditCard,
  Edit,
  Save,
  X
} from 'lucide-react';

interface CompanyDetailsTabProps {
  company: CompanyDetails;
  onUpdate: () => void;
}

export const CompanyDetailsTab: React.FC<CompanyDetailsTabProps> = ({
  company,
  onUpdate
}) => {
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: company.name || '',
    description: company.description || '',
    industry: company.industry || '',
    company_size: company.company_size || 'small',
    founding_date: company.founding_date || '',
    annual_revenue: company.annual_revenue || 0,
    currency: company.currency || 'EUR',
    legal_form: company.legal_form || '',
    commercial_register: company.commercial_register || '',
    website: company.website || '',
    phone: company.phone || '',
    billing_email: company.billing_email || '',
    primary_contact_name: company.primary_contact_name || '',
    primary_contact_title: company.primary_contact_title || '',
    primary_contact_email: company.primary_contact_email || '',
    primary_contact_phone: company.primary_contact_phone || '',
    billing_contact_name: company.billing_contact_name || '',
    billing_contact_email: company.billing_contact_email || '',
    technical_contact_name: company.technical_contact_name || '',
    technical_contact_email: company.technical_contact_email || '',
    bank_name: company.bank_name || '',
    iban: company.iban || '',
    bic: company.bic || '',
    notes: company.notes || ''
  });

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Generiere einen eindeutigen Dateinamen
      const fileExt = file.name.split('.').pop();
      const fileName = `${company.id}-${Date.now()}.${fileExt}`;

      // Upload zu Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Hole die öffentliche URL
      const { data: urlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      // Aktualisiere die Firmen-Daten
      const { error: updateError } = await supabase
        .from('companies')
        .update({ logo_url: urlData.publicUrl })
        .eq('id', company.id);

      if (updateError) throw updateError;

      toast({
        title: "Logo hochgeladen",
        description: "Das Firmen-Logo wurde erfolgreich aktualisiert."
      });

      onUpdate();
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Fehler",
        description: error.message || "Logo konnte nicht hochgeladen werden.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          description: formData.description,
          industry: formData.industry,
          company_size: formData.company_size,
          founding_date: formData.founding_date || null,
          annual_revenue: formData.annual_revenue || null,
          currency: formData.currency,
          legal_form: formData.legal_form,
          commercial_register: formData.commercial_register,
          website: formData.website,
          phone: formData.phone,
          billing_email: formData.billing_email,
          primary_contact_name: formData.primary_contact_name,
          primary_contact_title: formData.primary_contact_title,
          primary_contact_email: formData.primary_contact_email,
          primary_contact_phone: formData.primary_contact_phone,
          billing_contact_name: formData.billing_contact_name,
          billing_contact_email: formData.billing_contact_email,
          technical_contact_name: formData.technical_contact_name,
          technical_contact_email: formData.technical_contact_email,
          bank_name: formData.bank_name,
          iban: formData.iban,
          bic: formData.bic,
          notes: formData.notes
        })
        .eq('id', company.id);

      if (error) throw error;

      toast({
        title: "Daten gespeichert",
        description: "Die Firmendaten wurden erfolgreich aktualisiert."
      });

      setEditing(false);
      onUpdate();
    } catch (error: any) {
      console.error('Error saving company data:', error);
      toast({
        title: "Fehler",
        description: error.message || "Daten konnten nicht gespeichert werden.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getCompanySizeLabel = (size: string) => {
    switch (size) {
      case 'small': return 'Klein (1-10 Mitarbeiter)';
      case 'medium': return 'Mittel (11-50 Mitarbeiter)';
      case 'large': return 'Groß (51-250 Mitarbeiter)';
      case 'enterprise': return 'Konzern (250+ Mitarbeiter)';
      default: return size;
    }
  };

  const getSubscriptionBadge = () => {
    const status = company.subscription_status;
    const variants = {
      free: 'secondary',
      basic: 'outline',
      premium: 'default',
      enterprise: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status?.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header mit Logo und Grundinformationen */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={company.logo_url} alt={company.name} />
                  <AvatarFallback className="text-xl">
                    <Building2 className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="logo-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                  <Upload className="h-6 w-6 text-white" />
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{company.name}</CardTitle>
                <CardDescription className="mt-1">
                  {company.description || 'Keine Beschreibung vorhanden'}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  {getSubscriptionBadge()}
                  <Badge variant={company.is_active ? 'default' : 'secondary'}>
                    {company.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                  {company.onboarding_status && (
                    <Badge variant="outline">
                      {company.onboarding_status === 'completed' ? 'Onboarding abgeschlossen' :
                       company.onboarding_status === 'in_progress' ? 'Onboarding läuft' :
                       company.onboarding_status === 'pending' ? 'Onboarding ausstehend' :
                       company.onboarding_status}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                    <X className="h-4 w-4 mr-2" />
                    Abbrechen
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    Speichern
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Firmendaten */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Firmendaten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Firmenname</Label>
                {editing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm font-medium">{company.name}</p>
                )}
              </div>
              <div>
                <Label>Branche</Label>
                {editing ? (
                  <Input
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="z.B. IT, Consulting"
                  />
                ) : (
                  <p className="text-sm">{company.industry || 'Nicht angegeben'}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label>Beschreibung</Label>
              {editing ? (
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Kurze Beschreibung der Firma..."
                  className="min-h-20"
                />
              ) : (
                <p className="text-sm">{company.description || 'Keine Beschreibung'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Unternehmensgröße</Label>
                {editing ? (
                  <Select 
                    value={formData.company_size} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, company_size: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Klein (1-10)</SelectItem>
                      <SelectItem value="medium">Mittel (11-50)</SelectItem>
                      <SelectItem value="large">Groß (51-250)</SelectItem>
                      <SelectItem value="enterprise">Konzern (250+)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm">{getCompanySizeLabel(company.company_size || 'small')}</p>
                )}
              </div>
              <div>
                <Label>Gründungsdatum</Label>
                {editing ? (
                  <Input
                    type="date"
                    value={formData.founding_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, founding_date: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm">
                    {company.founding_date ? 
                      new Date(company.founding_date).toLocaleDateString('de-DE') : 
                      'Nicht angegeben'
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rechtsform</Label>
                {editing ? (
                  <Input
                    value={formData.legal_form}
                    onChange={(e) => setFormData(prev => ({ ...prev, legal_form: e.target.value }))}
                    placeholder="z.B. GmbH, AG, UG"
                  />
                ) : (
                  <p className="text-sm">{company.legal_form || 'Nicht angegeben'}</p>
                )}
              </div>
              <div>
                <Label>Handelsregister</Label>
                {editing ? (
                  <Input
                    value={formData.commercial_register}
                    onChange={(e) => setFormData(prev => ({ ...prev, commercial_register: e.target.value }))}
                    placeholder="HRB 12345"
                  />
                ) : (
                  <p className="text-sm">{company.commercial_register || 'Nicht angegeben'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Jahresumsatz</Label>
                {editing ? (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={formData.annual_revenue}
                      onChange={(e) => setFormData(prev => ({ ...prev, annual_revenue: Number(e.target.value) }))}
                      placeholder="0"
                    />
                    <Select 
                      value={formData.currency} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <p className="text-sm">
                    {company.annual_revenue ? 
                      `${company.annual_revenue.toLocaleString()} ${company.currency || 'EUR'}` : 
                      'Nicht angegeben'
                    }
                  </p>
                )}
              </div>
              <div>
                <Label>Mitarbeiteranzahl</Label>
                <p className="text-sm font-medium">{company.employee_count} Mitarbeiter</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kontaktinformationen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Kontaktinformationen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Website</Label>
              {editing ? (
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://www.firma.de"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {company.website}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Nicht angegeben</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label>Telefon</Label>
              {editing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+49 123 456789"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{company.phone || 'Nicht angegeben'}</span>
                </div>
              )}
            </div>

            <div>
              <Label>Rechnungs-E-Mail</Label>
              {editing ? (
                <Input
                  type="email"
                  value={formData.billing_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, billing_email: e.target.value }))}
                  placeholder="rechnung@firma.de"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{company.billing_email || 'Nicht angegeben'}</span>
                </div>
              )}
            </div>

            {/* Ansprechpartner */}
            <div className="space-y-3 pt-2 border-t">
              <h4 className="font-medium">Primärer Ansprechpartner</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  {editing ? (
                    <Input
                      value={formData.primary_contact_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, primary_contact_name: e.target.value }))}
                      placeholder="Max Mustermann"
                    />
                  ) : (
                    <p className="text-sm">{company.primary_contact_name || 'Nicht angegeben'}</p>
                  )}
                </div>
                <div>
                  <Label>Position</Label>
                  {editing ? (
                    <Input
                      value={formData.primary_contact_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, primary_contact_title: e.target.value }))}
                      placeholder="Geschäftsführer"
                    />
                  ) : (
                    <p className="text-sm">{company.primary_contact_title || 'Nicht angegeben'}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>E-Mail</Label>
                  {editing ? (
                    <Input
                      type="email"
                      value={formData.primary_contact_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, primary_contact_email: e.target.value }))}
                      placeholder="max@firma.de"
                    />
                  ) : (
                    <p className="text-sm">{company.primary_contact_email || 'Nicht angegeben'}</p>
                  )}
                </div>
                <div>
                  <Label>Telefon</Label>
                  {editing ? (
                    <Input
                      value={formData.primary_contact_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, primary_contact_phone: e.target.value }))}
                      placeholder="+49 123 456789"
                    />
                  ) : (
                    <p className="text-sm">{company.primary_contact_phone || 'Nicht angegeben'}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bankdaten */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Bankdaten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Bank</Label>
              {editing ? (
                <Input
                  value={formData.bank_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                  placeholder="Deutsche Bank AG"
                />
              ) : (
                <p className="text-sm">{company.bank_name || 'Nicht angegeben'}</p>
              )}
            </div>
            <div>
              <Label>IBAN</Label>
              {editing ? (
                <Input
                  value={formData.iban}
                  onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                  placeholder="DE89 3704 0044 0532 0130 00"
                />
              ) : (
                <p className="text-sm font-mono">{company.iban || 'Nicht angegeben'}</p>
              )}
            </div>
            <div>
              <Label>BIC</Label>
              {editing ? (
                <Input
                  value={formData.bic}
                  onChange={(e) => setFormData(prev => ({ ...prev, bic: e.target.value }))}
                  placeholder="COBADEFFXXX"
                />
              ) : (
                <p className="text-sm font-mono">{company.bic || 'Nicht angegeben'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notizen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notizen & Bemerkungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Interne Notizen zur Firma..."
                className="min-h-32"
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap">
                {company.notes || 'Keine Notizen vorhanden'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};