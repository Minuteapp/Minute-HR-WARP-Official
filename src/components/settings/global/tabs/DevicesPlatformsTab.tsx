import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Tablet, Keyboard, Wifi, WifiOff, Bell, Layout, Settings } from 'lucide-react';

export const DevicesPlatformsTab = () => {
  const [settings, setSettings] = useState({
    desktopLayoutDensity: 'comfortable',
    desktopSidebarCollapsible: true,
    desktopSidebarDefaultCollapsed: false,
    desktopShortcutsEnabled: true,
    desktopQuickActions: true,
    desktopBreadcrumbs: true,
    desktopMultiTabEnabled: false,
    desktopNotificationPosition: 'top-right',
    mobileAppEnabled: true,
    mobileOfflineMode: true,
    mobileOfflineSyncInterval: 5,
    mobilePushEnabled: true,
    mobileBiometricLogin: true,
    mobileLocationServices: true,
    mobileDataSaving: false,
    mobileCameraEnabled: true,
    mobileReducedFeatures: false,
    mobileReducedFeaturesList: [],
    tabletOptimized: true,
    tabletKioskMode: false,
    tabletAutoLock: true,
    tabletAutoLockTimeout: 5,
    tabletPinLogin: true,
    tabletFullscreen: true,
    tabletOrientation: 'auto',
    tabletTouchOptimized: true,
    pwaEnabled: true,
    pwaInstallPrompt: true,
    pwaBackgroundSync: true,
    pwaNotifications: true,
    accessibilityKeyboardNav: true,
    accessibilityScreenReader: true,
    accessibilityReducedMotion: false,
    accessibilityHighContrast: false,
    accessibilityFontScaling: true,
    accessibilityMinFontSize: 14,
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Desktop-Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Desktop-Einstellungen
          </CardTitle>
          <CardDescription>Optimierungen für Desktop-Browser</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Layout-Dichte</Label>
            <Select value={settings.desktopLayoutDensity} onValueChange={(v) => updateSetting('desktopLayoutDensity', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Kompakt (mehr Informationen)</SelectItem>
                <SelectItem value="comfortable">Komfortabel (Standard)</SelectItem>
                <SelectItem value="spacious">Geräumig (mehr Whitespace)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Sidebar einklappbar</Label>
                <p className="text-sm text-muted-foreground">Navigation minimieren</p>
              </div>
              <Switch 
                checked={settings.desktopSidebarCollapsible}
                onCheckedChange={(checked) => updateSetting('desktopSidebarCollapsible', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Sidebar standardmäßig eingeklappt</Label>
                <p className="text-sm text-muted-foreground">Beim Start minimiert</p>
              </div>
              <Switch 
                checked={settings.desktopSidebarDefaultCollapsed}
                onCheckedChange={(checked) => updateSetting('desktopSidebarDefaultCollapsed', checked)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Tastaturkürzel aktivieren
              </Label>
              <p className="text-sm text-muted-foreground">Schnellzugriff per Tastatur</p>
            </div>
            <Switch 
              checked={settings.desktopShortcutsEnabled}
              onCheckedChange={(checked) => updateSetting('desktopShortcutsEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Quick Actions</Label>
              <p className="text-sm text-muted-foreground">Schnellaktionen in der Toolbar</p>
            </div>
            <Switch 
              checked={settings.desktopQuickActions}
              onCheckedChange={(checked) => updateSetting('desktopQuickActions', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Breadcrumb-Navigation</Label>
              <p className="text-sm text-muted-foreground">Pfad-Anzeige</p>
            </div>
            <Switch 
              checked={settings.desktopBreadcrumbs}
              onCheckedChange={(checked) => updateSetting('desktopBreadcrumbs', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Multi-Tab-Modus</Label>
              <p className="text-sm text-muted-foreground">Mehrere Seiten in Tabs öffnen</p>
            </div>
            <Switch 
              checked={settings.desktopMultiTabEnabled}
              onCheckedChange={(checked) => updateSetting('desktopMultiTabEnabled', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Benachrichtigungs-Position</Label>
            <Select value={settings.desktopNotificationPosition} onValueChange={(v) => updateSetting('desktopNotificationPosition', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-right">Oben rechts</SelectItem>
                <SelectItem value="top-left">Oben links</SelectItem>
                <SelectItem value="bottom-right">Unten rechts</SelectItem>
                <SelectItem value="bottom-left">Unten links</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mobile App */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile App
          </CardTitle>
          <CardDescription>Einstellungen für iOS und Android</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Mobile App aktivieren</Label>
              <p className="text-sm text-muted-foreground">Zugriff über Mobile App erlauben</p>
            </div>
            <Switch 
              checked={settings.mobileAppEnabled}
              onCheckedChange={(checked) => updateSetting('mobileAppEnabled', checked)}
            />
          </div>

          {settings.mobileAppEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <WifiOff className="h-4 w-4" />
                    Offline-Modus
                  </Label>
                  <p className="text-sm text-muted-foreground">Ohne Internetverbindung nutzbar</p>
                </div>
                <Switch 
                  checked={settings.mobileOfflineMode}
                  onCheckedChange={(checked) => updateSetting('mobileOfflineMode', checked)}
                />
              </div>

              {settings.mobileOfflineMode && (
                <div className="space-y-2 pl-4 border-l border-muted">
                  <Label>Sync-Intervall (Minuten)</Label>
                  <Input 
                    type="number"
                    value={settings.mobileOfflineSyncInterval}
                    onChange={(e) => updateSetting('mobileOfflineSyncInterval', parseInt(e.target.value))}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Push-Benachrichtigungen
                  </Label>
                  <p className="text-sm text-muted-foreground">Mobile Push aktivieren</p>
                </div>
                <Switch 
                  checked={settings.mobilePushEnabled}
                  onCheckedChange={(checked) => updateSetting('mobilePushEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Biometrischer Login</Label>
                  <p className="text-sm text-muted-foreground">Face ID / Fingerabdruck</p>
                </div>
                <Switch 
                  checked={settings.mobileBiometricLogin}
                  onCheckedChange={(checked) => updateSetting('mobileBiometricLogin', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Standortdienste</Label>
                  <p className="text-sm text-muted-foreground">GPS für Zeiterfassung</p>
                </div>
                <Switch 
                  checked={settings.mobileLocationServices}
                  onCheckedChange={(checked) => updateSetting('mobileLocationServices', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Datenspar-Modus</Label>
                  <p className="text-sm text-muted-foreground">Reduzierter Datenverbrauch</p>
                </div>
                <Switch 
                  checked={settings.mobileDataSaving}
                  onCheckedChange={(checked) => updateSetting('mobileDataSaving', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Kamera-Zugriff</Label>
                  <p className="text-sm text-muted-foreground">Für QR-Codes und Dokumente</p>
                </div>
                <Switch 
                  checked={settings.mobileCameraEnabled}
                  onCheckedChange={(checked) => updateSetting('mobileCameraEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Feature-Reduktion</Label>
                  <p className="text-sm text-muted-foreground">Nur ausgewählte Funktionen in der App</p>
                </div>
                <Switch 
                  checked={settings.mobileReducedFeatures}
                  onCheckedChange={(checked) => updateSetting('mobileReducedFeatures', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tablet / Kiosk */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tablet className="h-5 w-5" />
            Tablet / Kiosk-Modus
          </CardTitle>
          <CardDescription>Optimierungen für Tablets und Terminal-Nutzung</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Tablet-Optimierung</Label>
              <p className="text-sm text-muted-foreground">Angepasste UI für Tablets</p>
            </div>
            <Switch 
              checked={settings.tabletOptimized}
              onCheckedChange={(checked) => updateSetting('tabletOptimized', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-2">
                Kiosk-Modus
                <Badge variant="secondary">Zeiterfassung</Badge>
              </Label>
              <p className="text-sm text-muted-foreground">Für öffentliche Terminals</p>
            </div>
            <Switch 
              checked={settings.tabletKioskMode}
              onCheckedChange={(checked) => updateSetting('tabletKioskMode', checked)}
            />
          </div>

          {settings.tabletKioskMode && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Lock</Label>
                  <p className="text-sm text-muted-foreground">Nach Inaktivität sperren</p>
                </div>
                <Switch 
                  checked={settings.tabletAutoLock}
                  onCheckedChange={(checked) => updateSetting('tabletAutoLock', checked)}
                />
              </div>

              {settings.tabletAutoLock && (
                <div className="space-y-2">
                  <Label>Auto-Lock Timeout (Minuten)</Label>
                  <Input 
                    type="number"
                    value={settings.tabletAutoLockTimeout}
                    onChange={(e) => updateSetting('tabletAutoLockTimeout', parseInt(e.target.value))}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>PIN-Login</Label>
                  <p className="text-sm text-muted-foreground">4-stelliger PIN statt Passwort</p>
                </div>
                <Switch 
                  checked={settings.tabletPinLogin}
                  onCheckedChange={(checked) => updateSetting('tabletPinLogin', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Vollbild-Modus</Label>
                  <p className="text-sm text-muted-foreground">Browser-UI ausblenden</p>
                </div>
                <Switch 
                  checked={settings.tabletFullscreen}
                  onCheckedChange={(checked) => updateSetting('tabletFullscreen', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Bildschirm-Ausrichtung</Label>
                <Select value={settings.tabletOrientation} onValueChange={(v) => updateSetting('tabletOrientation', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatisch</SelectItem>
                    <SelectItem value="portrait">Hochformat</SelectItem>
                    <SelectItem value="landscape">Querformat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label>Touch-Optimierung</Label>
              <p className="text-sm text-muted-foreground">Größere Buttons und Abstände</p>
            </div>
            <Switch 
              checked={settings.tabletTouchOptimized}
              onCheckedChange={(checked) => updateSetting('tabletTouchOptimized', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* PWA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Progressive Web App (PWA)
          </CardTitle>
          <CardDescription>Installation und Offline-Funktionen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>PWA aktivieren</Label>
              <p className="text-sm text-muted-foreground">Als App installierbar machen</p>
            </div>
            <Switch 
              checked={settings.pwaEnabled}
              onCheckedChange={(checked) => updateSetting('pwaEnabled', checked)}
            />
          </div>

          {settings.pwaEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Installations-Prompt</Label>
                  <p className="text-sm text-muted-foreground">Benutzer zur Installation auffordern</p>
                </div>
                <Switch 
                  checked={settings.pwaInstallPrompt}
                  onCheckedChange={(checked) => updateSetting('pwaInstallPrompt', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Background Sync</Label>
                  <p className="text-sm text-muted-foreground">Daten im Hintergrund synchronisieren</p>
                </div>
                <Switch 
                  checked={settings.pwaBackgroundSync}
                  onCheckedChange={(checked) => updateSetting('pwaBackgroundSync', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>PWA-Benachrichtigungen</Label>
                  <p className="text-sm text-muted-foreground">Push über PWA</p>
                </div>
                <Switch 
                  checked={settings.pwaNotifications}
                  onCheckedChange={(checked) => updateSetting('pwaNotifications', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Barrierefreiheit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Barrierefreiheit
          </CardTitle>
          <CardDescription>Zugänglichkeitseinstellungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Tastaturnavigation</Label>
              <p className="text-sm text-muted-foreground">Volle Bedienbarkeit per Tastatur</p>
            </div>
            <Switch 
              checked={settings.accessibilityKeyboardNav}
              onCheckedChange={(checked) => updateSetting('accessibilityKeyboardNav', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Screenreader-Unterstützung</Label>
              <p className="text-sm text-muted-foreground">ARIA-Labels optimieren</p>
            </div>
            <Switch 
              checked={settings.accessibilityScreenReader}
              onCheckedChange={(checked) => updateSetting('accessibilityScreenReader', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Reduzierte Bewegung</Label>
              <p className="text-sm text-muted-foreground">Animationen minimieren</p>
            </div>
            <Switch 
              checked={settings.accessibilityReducedMotion}
              onCheckedChange={(checked) => updateSetting('accessibilityReducedMotion', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Hoher Kontrast</Label>
              <p className="text-sm text-muted-foreground">Verbesserte Lesbarkeit</p>
            </div>
            <Switch 
              checked={settings.accessibilityHighContrast}
              onCheckedChange={(checked) => updateSetting('accessibilityHighContrast', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Schriftgröße anpassbar</Label>
              <p className="text-sm text-muted-foreground">Benutzer können Schrift vergrößern</p>
            </div>
            <Switch 
              checked={settings.accessibilityFontScaling}
              onCheckedChange={(checked) => updateSetting('accessibilityFontScaling', checked)}
            />
          </div>

          {settings.accessibilityFontScaling && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <Label>Mindest-Schriftgröße (px)</Label>
              <Input 
                type="number"
                value={settings.accessibilityMinFontSize}
                onChange={(e) => updateSetting('accessibilityMinFontSize', parseInt(e.target.value))}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DevicesPlatformsTab;
