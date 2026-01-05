import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Building2, Palette, Image, Type, Upload, Globe, Mail, FileText } from 'lucide-react';

export const BrandingIdentityTab = () => {
  const [settings, setSettings] = useState({
    companyNameLegal: 'Muster GmbH',
    companyNameDisplay: 'Muster',
    isHolding: false,
    holdingName: '',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    accentColor: '#22c55e',
    autoColorFromLogo: false,
    fontFamily: 'system',
    customFontName: '',
    theme: 'light',
    customThemeEnabled: false,
    whiteLabelEnabled: false,
    whiteLabelDomain: '',
    whiteLabelEmailSender: '',
    whiteLabelLoginBranding: true,
    whiteLabelFooterImprint: '',
    whiteLabelFooterPrivacy: '',
    showPoweredBy: true,
    faviconCustom: false,
    emailTemplateCustom: false,
    reportLogoEnabled: true,
    appIconCustom: false,
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Unternehmensdaten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Unternehmensdaten
          </CardTitle>
          <CardDescription>Grundlegende Informationen zu Ihrem Unternehmen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rechtlicher Unternehmensname</Label>
              <Input 
                value={settings.companyNameLegal}
                onChange={(e) => updateSetting('companyNameLegal', e.target.value)}
                placeholder="Firma GmbH"
              />
            </div>
            <div className="space-y-2">
              <Label>Anzeigename</Label>
              <Input 
                value={settings.companyNameDisplay}
                onChange={(e) => updateSetting('companyNameDisplay', e.target.value)}
                placeholder="Firma"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Holding-/Konzernstruktur</Label>
              <p className="text-sm text-muted-foreground">Dieses Unternehmen ist Teil einer Holding</p>
            </div>
            <Switch 
              checked={settings.isHolding}
              onCheckedChange={(checked) => updateSetting('isHolding', checked)}
            />
          </div>

          {settings.isHolding && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <Label>Name der Holding</Label>
              <Input 
                value={settings.holdingName}
                onChange={(e) => updateSetting('holdingName', e.target.value)}
                placeholder="Holding AG"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logo-Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Logo-Einstellungen
          </CardTitle>
          <CardDescription>Firmenlogo für verschiedene Bereiche</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Header-Logo</Label>
              <div className="flex gap-2">
                <Input type="file" accept="image/*" className="flex-1" />
                <Button variant="outline" size="icon"><Upload className="h-4 w-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground">Empfohlen: 200x50px, PNG oder SVG</p>
            </div>
            <div className="space-y-2">
              <Label>Login-Logo</Label>
              <div className="flex gap-2">
                <Input type="file" accept="image/*" className="flex-1" />
                <Button variant="outline" size="icon"><Upload className="h-4 w-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground">Empfohlen: 400x100px, PNG oder SVG</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Eigenes App-Icon</Label>
                <p className="text-sm text-muted-foreground">Für Mobile App</p>
              </div>
              <Switch 
                checked={settings.appIconCustom}
                onCheckedChange={(checked) => updateSetting('appIconCustom', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Logo in Reports</Label>
                <p className="text-sm text-muted-foreground">In PDF-Exporten anzeigen</p>
              </div>
              <Switch 
                checked={settings.reportLogoEnabled}
                onCheckedChange={(checked) => updateSetting('reportLogoEnabled', checked)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Eigenes Favicon</Label>
              <p className="text-sm text-muted-foreground">Browser-Tab-Icon anpassen</p>
            </div>
            <Switch 
              checked={settings.faviconCustom}
              onCheckedChange={(checked) => updateSetting('faviconCustom', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Farbpalette */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Farbpalette
          </CardTitle>
          <CardDescription>Definieren Sie Ihre Unternehmensfarben</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Primärfarbe</Label>
              <div className="flex gap-2">
                <Input 
                  type="color" 
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input 
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sekundärfarbe</Label>
              <div className="flex gap-2">
                <Input 
                  type="color" 
                  value={settings.secondaryColor}
                  onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input 
                  value={settings.secondaryColor}
                  onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Akzentfarbe</Label>
              <div className="flex gap-2">
                <Input 
                  type="color" 
                  value={settings.accentColor}
                  onChange={(e) => updateSetting('accentColor', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input 
                  value={settings.accentColor}
                  onChange={(e) => updateSetting('accentColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Automatische Farbableitung aus Logo</Label>
              <p className="text-sm text-muted-foreground">Farben werden aus dem Logo extrahiert</p>
            </div>
            <Switch 
              checked={settings.autoColorFromLogo}
              onCheckedChange={(checked) => updateSetting('autoColorFromLogo', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Schriftarten & Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Schriftarten & Theme
          </CardTitle>
          <CardDescription>Typografie und Design-Modus</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Schriftart</Label>
              <Select value={settings.fontFamily} onValueChange={(v) => updateSetting('fontFamily', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System-Standard</SelectItem>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="roboto">Roboto</SelectItem>
                  <SelectItem value="opensans">Open Sans</SelectItem>
                  <SelectItem value="custom">Eigene Schriftart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={settings.theme} onValueChange={(v) => updateSetting('theme', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Hell</SelectItem>
                  <SelectItem value="dark">Dunkel</SelectItem>
                  <SelectItem value="auto">System-Einstellung</SelectItem>
                  <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {settings.fontFamily === 'custom' && (
            <div className="space-y-2">
              <Label>Eigene Schriftart hochladen</Label>
              <div className="flex gap-2">
                <Input type="file" accept=".woff,.woff2,.ttf,.otf" className="flex-1" />
                <Button variant="outline">Hochladen</Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label>Custom Theme aktivieren</Label>
              <p className="text-sm text-muted-foreground">Erweiterte Design-Anpassungen</p>
            </div>
            <Switch 
              checked={settings.customThemeEnabled}
              onCheckedChange={(checked) => updateSetting('customThemeEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* White-Label */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            White-Label Einstellungen
          </CardTitle>
          <CardDescription>Vollständige Anpassung für eigene Marke</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>White-Label aktivieren</Label>
              <p className="text-sm text-muted-foreground">Minute HR-Branding entfernen</p>
            </div>
            <Switch 
              checked={settings.whiteLabelEnabled}
              onCheckedChange={(checked) => updateSetting('whiteLabelEnabled', checked)}
            />
          </div>

          {settings.whiteLabelEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Eigene Domain
                  </Label>
                  <Input 
                    value={settings.whiteLabelDomain}
                    onChange={(e) => updateSetting('whiteLabelDomain', e.target.value)}
                    placeholder="hr.ihrefirma.de"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    E-Mail Absender
                  </Label>
                  <Input 
                    value={settings.whiteLabelEmailSender}
                    onChange={(e) => updateSetting('whiteLabelEmailSender', e.target.value)}
                    placeholder="hr@ihrefirma.de"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Login-Screen Branding</Label>
                  <p className="text-sm text-muted-foreground">Eigenes Design auf Login-Seite</p>
                </div>
                <Switch 
                  checked={settings.whiteLabelLoginBranding}
                  onCheckedChange={(checked) => updateSetting('whiteLabelLoginBranding', checked)}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Impressum-Link
                  </Label>
                  <Input 
                    value={settings.whiteLabelFooterImprint}
                    onChange={(e) => updateSetting('whiteLabelFooterImprint', e.target.value)}
                    placeholder="https://ihrefirma.de/impressum"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Datenschutz-Link
                  </Label>
                  <Input 
                    value={settings.whiteLabelFooterPrivacy}
                    onChange={(e) => updateSetting('whiteLabelFooterPrivacy', e.target.value)}
                    placeholder="https://ihrefirma.de/datenschutz"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>"Powered by Minute HR" anzeigen</Label>
                  <p className="text-sm text-muted-foreground">Im Footer anzeigen</p>
                </div>
                <Switch 
                  checked={settings.showPoweredBy}
                  onCheckedChange={(checked) => updateSetting('showPoweredBy', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Eigene E-Mail-Templates</Label>
                  <p className="text-sm text-muted-foreground">Benutzerdefinierte E-Mail-Designs</p>
                </div>
                <Switch 
                  checked={settings.emailTemplateCustom}
                  onCheckedChange={(checked) => updateSetting('emailTemplateCustom', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandingIdentityTab;
