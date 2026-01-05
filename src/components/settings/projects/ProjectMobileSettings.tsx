
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Tablet, Monitor, Hand } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProjectMobileSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Smartphone className="h-6 w-6" />
          Mobile Optimierung Einstellungen
        </h2>
        <p className="text-muted-foreground">
          Konfigurieren Sie die mobile Projektmanagement-Erfahrung
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mobile Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Mobile Dashboard</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Optimierte Projektübersicht für mobile Geräte
              </p>
              <ul className="text-sm space-y-1">
                <li>• Kompakte Projektkartenansicht</li>
                <li>• Touch-optimierte Navigation</li>
                <li>• Swipe-Gesten für Aktionen</li>
                <li>• Mobile-first Design</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Hand className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Touch-Interface</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Intuitive Touch-basierte Interaktionen
              </p>
              <ul className="text-sm space-y-1">
                <li>• Größere Touch-Targets</li>
                <li>• Gesture-basierte Navigation</li>
                <li>• Quick-Actions via Swipe</li>
                <li>• Haptic Feedback</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Tablet className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium">Responsive Layout</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Adaptive Layouts für verschiedene Bildschirmgrößen
              </p>
              <ul className="text-sm space-y-1">
                <li>• Automatische Layout-Anpassung</li>
                <li>• Tablet-optimierte Ansichten</li>
                <li>• Flexible Grid-Systeme</li>
                <li>• Breakpoint-spezifische Features</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Monitor className="h-5 w-5 text-orange-600" />
                <h3 className="font-medium">Progressive Web App</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Native App-ähnliche Funktionen im Browser
              </p>
              <ul className="text-sm space-y-1">
                <li>• Offline-Funktionalität</li>
                <li>• Push-Benachrichtigungen</li>
                <li>• App-Installation via Browser</li>
                <li>• Background-Synchronisation</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Mobile Optimierung verbessert die Produktivität unterwegs
              </p>
              <Button>
                Mobile Demo starten
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mobile Performance Metriken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">1.2s</div>
                <div className="text-sm text-green-600">Durchschn. Ladezeit</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">95%</div>
                <div className="text-sm text-blue-600">Mobile Performance Score</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">99%</div>
                <div className="text-sm text-purple-600">Touch-Response-Rate</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">4.8★</div>
                <div className="text-sm text-orange-600">User Experience Rating</div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Implementierte Mobile Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-green-700 mb-2">✅ Aktive Features</h5>
                  <ul className="text-sm space-y-1">
                    <li>• MobileProjectDashboard Komponente</li>
                    <li>• Touch-optimierte Projektkarten</li>
                    <li>• Responsive Statistiken</li>
                    <li>• Mobile Navigation</li>
                    <li>• Gesture-Support</li>
                    <li>• Progressive Web App</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-blue-700 mb-2">🔄 In Entwicklung</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Offline-Modus</li>
                    <li>• Push-Benachrichtigungen</li>
                    <li>• Kamera-Integration</li>
                    <li>• Biometric Authentication</li>
                    <li>• Voice Commands</li>
                    <li>• AR Project Visualization</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Device Compatibility</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-sm font-medium">Smartphones</div>
                  <div className="text-xs text-blue-600">iOS 12+, Android 8+</div>
                </div>
                <div>
                  <Tablet className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-sm font-medium">Tablets</div>
                  <div className="text-xs text-blue-600">iPad, Android Tablets</div>
                </div>
                <div>
                  <Monitor className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-sm font-medium">Desktop</div>
                  <div className="text-xs text-blue-600">Chrome, Firefox, Safari</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectMobileSettings;
