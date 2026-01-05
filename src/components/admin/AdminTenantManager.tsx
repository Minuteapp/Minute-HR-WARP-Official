import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, Database, Settings, Trash2, RefreshCw } from 'lucide-react';

export default function AdminTenantManager() {
  const { user } = useAuth();
  const { tenantCompany, isSuperAdmin, refetchTenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);

  const clearAllTenantSessions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Lösche ALLE Tenant-Sessions für diesen Benutzer
      const { error } = await supabase
        .from('user_tenant_sessions')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing tenant sessions:', error);
        throw error;
      }

      // Lösche auch lokale Daten
      localStorage.removeItem('tenant-company');
      sessionStorage.removeItem('tenant-company');

      // Erzwinge Neuladen
      refetchTenant();
      
      toast({
        title: "Erfolgreich",
        description: "Alle Tenant-Sessions wurden gelöscht. Du bist jetzt wieder Super-Admin."
      });

      // Navigiere zur Hauptseite
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen der Tenant-Sessions: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const forceRefresh = async () => {
    setIsLoading(true);
    try {
      // Erzwinge Neuladen der Tenant-Daten
      refetchTenant();
      
      // Hard-Refresh nach kurzer Verzögerung
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
      toast({
        title: "Aktualisiert",
        description: "Seite wird neu geladen..."
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const debugTenantStatus = async () => {
    if (!user) return;
    
    try {
      // Hole Debug-Informationen
      const { data: tenantSessions } = await supabase
        .from('user_tenant_sessions')
        .select('*')
        .eq('user_id', user.id);

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      console.log('🔍 Debug Tenant Status:', {
        user_id: user.id,
        tenantSessions,
        userRoles,
        tenantCompany,
        isSuperAdmin
      });

      toast({
        title: "Debug-Info",
        description: "Debug-Informationen wurden in die Konsole geschrieben. Öffne die Entwicklertools (F12)."
      });
    } catch (error) {
      console.error('Debug error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Tenant-Context Problem erkannt
            </CardTitle>
            <CardDescription>
              Du siehst immer noch alle deine Daten, obwohl du in einer Firma angemeldet bist. 
              Das ist ein Problem mit dem Tenant-Context-System.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Status */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Aktueller Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Benutzer-ID:</span>
                <Badge variant="outline">{user?.id?.slice(0, 8)}...</Badge>
              </div>
              <div className="flex justify-between">
                <span>Super-Admin:</span>
                <Badge className={isSuperAdmin ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {isSuperAdmin ? "Ja" : "Nein"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Tenant-Firma:</span>
                <Badge className={tenantCompany ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-800"}>
                  {tenantCompany?.name || "Keine"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Schnelle Lösungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={clearAllTenantSessions}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Alle Tenant-Sessions löschen
              </Button>
              
              <Button 
                onClick={forceRefresh}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Seite neu laden
              </Button>
              
              <Button 
                onClick={debugTenantStatus}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <Database className="mr-2 h-4 w-4" />
                Debug-Informationen
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Detaillierte Erklärung */}
        <Card>
          <CardHeader>
            <CardTitle>Was ist das Problem?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              <strong>Das Problem:</strong> Die Row Level Security (RLS) Policies filtern deine Daten nicht korrekt, 
              weil das Tenant-Context-System nicht richtig funktioniert.
            </p>
            <p className="text-gray-700">
              <strong>Die Ursache:</strong> Es gibt einen Konflikt zwischen deinem Super-Admin-Status und dem 
              Tenant-Context. Die RLS Policies erkennen nicht korrekt, dass du im Tenant-Modus sein solltest.
            </p>
            <p className="text-gray-700">
              <strong>Die Lösung:</strong> Klicke auf "Alle Tenant-Sessions löschen" um zurück zum normalen 
              Super-Admin-Modus zu wechseln. Danach solltest du wieder alles korrekt sehen.
            </p>
          </CardContent>
        </Card>

        {/* Warnung */}
        {tenantCompany && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900">
                ⚠️ Du bist derzeit in der Firma: {tenantCompany.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-800">
                Normalerweise solltest du nur die Daten dieser Firma sehen, aber aufgrund eines technischen 
                Problems siehst du alle Daten. Verwende die Buttons oben, um das zu beheben.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}