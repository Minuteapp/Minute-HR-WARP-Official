import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Languages, Globe, Clock, Calendar, DollarSign, Hash, Plus, X } from 'lucide-react';

export const LanguageRegionTab = () => {
  const [settings, setSettings] = useState({
    defaultLanguage: 'de',
    additionalLanguages: ['en', 'fr'],
    languagePerLocation: true,
    languagePerDepartment: false,
    languagePerUser: true,
    aiTranslationEnabled: true,
    aiTranslationSystemTexts: false,
    aiTranslationFreeTexts: true,
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    numberFormat: 'de-DE',
    currencyPrimary: 'EUR',
    currenciesAdditional: ['USD', 'CHF'],
    decimalSeparator: ',',
    thousandsSeparator: '.',
    defaultTimezone: 'Europe/Berlin',
    timezonePerLocation: true,
    showTimezoneIndicator: true,
    autoDetectTimezone: false,
    weekStartsOn: 'monday',
    fiscalYearStart: '01-01',
  });

  const availableLanguages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addLanguage = (code: string) => {
    if (!settings.additionalLanguages.includes(code)) {
      updateSetting('additionalLanguages', [...settings.additionalLanguages, code]);
    }
  };

  const removeLanguage = (code: string) => {
    updateSetting('additionalLanguages', settings.additionalLanguages.filter(l => l !== code));
  };

  return (
    <div className="space-y-6">
      {/* Spracheinstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Spracheinstellungen
          </CardTitle>
          <CardDescription>Standardsprache und verfügbare Sprachen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Standardsprache</Label>
            <Select value={settings.defaultLanguage} onValueChange={(v) => updateSetting('defaultLanguage', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Aktivierte Sprachen</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {settings.additionalLanguages.map((code) => {
                const lang = availableLanguages.find(l => l.code === code);
                return (
                  <Badge key={code} variant="secondary" className="flex items-center gap-1">
                    {lang?.flag} {lang?.name}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1"
                      onClick={() => removeLanguage(code)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
            <Select onValueChange={(v) => addLanguage(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sprache hinzufügen..." />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages
                  .filter(l => !settings.additionalLanguages.includes(l.code) && l.code !== settings.defaultLanguage)
                  .map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>Sprache je Standort</Label>
                <p className="text-sm text-muted-foreground">Standorte können eigene Standardsprache setzen</p>
              </div>
              <Switch 
                checked={settings.languagePerLocation}
                onCheckedChange={(checked) => updateSetting('languagePerLocation', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Sprache je Abteilung</Label>
                <p className="text-sm text-muted-foreground">Abteilungen können eigene Sprache setzen</p>
              </div>
              <Switch 
                checked={settings.languagePerDepartment}
                onCheckedChange={(checked) => updateSetting('languagePerDepartment', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Sprache je Benutzer</Label>
                <p className="text-sm text-muted-foreground">Benutzer können persönliche Sprache wählen</p>
              </div>
              <Switch 
                checked={settings.languagePerUser}
                onCheckedChange={(checked) => updateSetting('languagePerUser', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KI-Übersetzung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            KI-Übersetzung
          </CardTitle>
          <CardDescription>Automatische Übersetzung von Texten</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>KI-Übersetzung aktivieren</Label>
              <p className="text-sm text-muted-foreground">Automatische Übersetzung nutzen</p>
            </div>
            <Switch 
              checked={settings.aiTranslationEnabled}
              onCheckedChange={(checked) => updateSetting('aiTranslationEnabled', checked)}
            />
          </div>

          {settings.aiTranslationEnabled && (
            <div className="space-y-3 pl-4 border-l-2 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Systemtexte übersetzen</Label>
                  <p className="text-sm text-muted-foreground">UI-Elemente und feste Texte</p>
                </div>
                <Switch 
                  checked={settings.aiTranslationSystemTexts}
                  onCheckedChange={(checked) => updateSetting('aiTranslationSystemTexts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Freitexte übersetzen</Label>
                  <p className="text-sm text-muted-foreground">Benutzereingaben und Nachrichten</p>
                </div>
                <Switch 
                  checked={settings.aiTranslationFreeTexts}
                  onCheckedChange={(checked) => updateSetting('aiTranslationFreeTexts', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Regionale Formate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Regionale Formate
          </CardTitle>
          <CardDescription>Datum, Zeit und Zahlenformate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Datumsformat
              </Label>
              <Select value={settings.dateFormat} onValueChange={(v) => updateSetting('dateFormat', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD.MM.YYYY">DD.MM.YYYY (31.12.2024)</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Zeitformat
              </Label>
              <Select value={settings.timeFormat} onValueChange={(v) => updateSetting('timeFormat', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24-Stunden (14:30)</SelectItem>
                  <SelectItem value="12h">12-Stunden (2:30 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Dezimaltrennzeichen
              </Label>
              <Select value={settings.decimalSeparator} onValueChange={(v) => updateSetting('decimalSeparator', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">Komma (1.234,56)</SelectItem>
                  <SelectItem value=".">Punkt (1,234.56)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tausendertrennzeichen</Label>
              <Select value={settings.thousandsSeparator} onValueChange={(v) => updateSetting('thousandsSeparator', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=".">Punkt (1.234)</SelectItem>
                  <SelectItem value=",">Komma (1,234)</SelectItem>
                  <SelectItem value=" ">Leerzeichen (1 234)</SelectItem>
                  <SelectItem value="'">Apostroph (1'234)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Wochenbeginn</Label>
              <Select value={settings.weekStartsOn} onValueChange={(v) => updateSetting('weekStartsOn', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Montag</SelectItem>
                  <SelectItem value="sunday">Sonntag</SelectItem>
                  <SelectItem value="saturday">Samstag</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Beginn des Geschäftsjahres</Label>
              <Select value={settings.fiscalYearStart} onValueChange={(v) => updateSetting('fiscalYearStart', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01-01">1. Januar</SelectItem>
                  <SelectItem value="04-01">1. April</SelectItem>
                  <SelectItem value="07-01">1. Juli</SelectItem>
                  <SelectItem value="10-01">1. Oktober</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Währungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Währungen
          </CardTitle>
          <CardDescription>Primär- und Zusatzwährungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primärwährung</Label>
              <Select value={settings.currencyPrimary} onValueChange={(v) => updateSetting('currencyPrimary', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                  <SelectItem value="USD">$ US-Dollar (USD)</SelectItem>
                  <SelectItem value="GBP">£ Pfund (GBP)</SelectItem>
                  <SelectItem value="CHF">Fr. Schweizer Franken (CHF)</SelectItem>
                  <SelectItem value="PLN">zł Zloty (PLN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Zusatzwährungen</Label>
              <div className="flex flex-wrap gap-1 mb-2">
                {settings.currenciesAdditional.map((curr) => (
                  <Badge key={curr} variant="outline">{curr}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zeitzonen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Zeitzonen
          </CardTitle>
          <CardDescription>Zeitzoneneinstellungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Standard-Zeitzone</Label>
            <Select value={settings.defaultTimezone} onValueChange={(v) => updateSetting('defaultTimezone', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Berlin">Europe/Berlin (UTC+1/+2)</SelectItem>
                <SelectItem value="Europe/Vienna">Europe/Vienna (UTC+1/+2)</SelectItem>
                <SelectItem value="Europe/Zurich">Europe/Zurich (UTC+1/+2)</SelectItem>
                <SelectItem value="Europe/London">Europe/London (UTC+0/+1)</SelectItem>
                <SelectItem value="America/New_York">America/New_York (UTC-5/-4)</SelectItem>
                <SelectItem value="Asia/Tokyo">Asia/Tokyo (UTC+9)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Zeitzone je Standort</Label>
                <p className="text-sm text-muted-foreground">Standorte können eigene Zeitzone setzen</p>
              </div>
              <Switch 
                checked={settings.timezonePerLocation}
                onCheckedChange={(checked) => updateSetting('timezonePerLocation', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Zeitzonen-Indikator anzeigen</Label>
                <p className="text-sm text-muted-foreground">Bei Zeitangaben Zeitzone anzeigen</p>
              </div>
              <Switch 
                checked={settings.showTimezoneIndicator}
                onCheckedChange={(checked) => updateSetting('showTimezoneIndicator', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Automatische Zeitzonen-Erkennung</Label>
                <p className="text-sm text-muted-foreground">Aus Browser/Gerät übernehmen</p>
              </div>
              <Switch 
                checked={settings.autoDetectTimezone}
                onCheckedChange={(checked) => updateSetting('autoDetectTimezone', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageRegionTab;
