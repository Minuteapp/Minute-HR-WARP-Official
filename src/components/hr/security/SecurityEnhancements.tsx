
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Lock, Eye, CheckCircle, Plus, Activity, Users, FileText } from "lucide-react";
import { useSecuritySettings } from "@/hooks/security/useSecuritySettings";
import { useSecurityManager } from "@/hooks/security/useSecurityManager";
import { useAuth } from "@/contexts/AuthProvider";
import { useState } from "react";

export const SecurityEnhancements = () => {
  const { user } = useAuth();
  const { securityScore, securityThreats, performSecurityReview } = useSecuritySettings();
  const { securityState, performSecurityCheck } = useSecurityManager();

  const handleSecurityReview = async () => {
    await performSecurityReview();
    await performSecurityCheck();
  };

  const unresolvedThreats = securityThreats.filter(threat => !threat.is_resolved);
  const criticalThreats = unresolvedThreats.filter(threat => threat.severity === 'critical');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sicherheitsverbesserungen</h2>
        <Button onClick={handleSecurityReview}>
          <Shield className="mr-2 h-4 w-4" />
          Sicherheitsüberprüfung
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{securityScore}%</p>
                <p className="text-sm text-gray-500">Sicherheitslevel</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unresolvedThreats.length}</p>
                <p className="text-sm text-gray-500">Offene Warnungen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-500">Aktive Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-500">Überwachte Ereignisse</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sicherheitsrichtlinien
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Passwort-Richtlinie</span>
                </div>
                <Badge variant="default">Aktiv</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Zwei-Faktor-Authentifizierung</span>
                </div>
                <Badge variant="default">Aktiv</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Session-Timeout</span>
                </div>
                <Badge variant="secondary">Konfiguration erforderlich</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Sicherheitswarnungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg border-orange-200 bg-orange-50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Mittlere Priorität</span>
                </div>
                <p className="text-sm text-orange-700">
                  Einige Benutzer haben schwache Passwörter
                </p>
              </div>
              <div className="p-3 border rounded-lg border-yellow-200 bg-yellow-50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Niedrige Priorität</span>
                </div>
                <p className="text-sm text-yellow-700">
                  System-Updates verfügbar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
