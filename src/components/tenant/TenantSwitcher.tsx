import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Building2, LogOut, Home } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function TenantSwitcher() {
  const { tenantCompany, isSuperAdmin, refetchTenant } = useTenant();
  const { user } = useAuth();

  const clearTenantSession = async () => {
    try {
      if (!user) {
        toast({
          title: "Fehler",
          description: "Sie sind nicht angemeldet.",
          variant: "destructive"
        });
        return;
      }

      // Lösche die Tenant-Session aus der Datenbank
      const { error } = await supabase
        .from('user_tenant_sessions')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing tenant session:', error);
      }

      // Erzwinge Neuladen der Tenant-Daten
      refetchTenant();
      
      // Navigiere zur Hauptseite
      window.location.href = '/';
      
      toast({
        title: "Erfolgreich",
        description: "Sie wurden erfolgreich zur MINUTE-Administration zurückgeleitet."
      });
    } catch (error) {
      console.error('Error during tenant session clearing:', error);
      toast({
        title: "Fehler",
        description: "Es gab einen Fehler beim Wechseln zur Administration.",
        variant: "destructive"
      });
    }
  };

  const exitTenantMode = () => {
    // Erzwinge Zurücksetzen aller Tenant-Daten
    localStorage.removeItem('tenant-company');
    sessionStorage.removeItem('tenant-company');
    
    // Lösche Tenant-Session
    clearTenantSession();
  };

  return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-900">
          <Building2 className="mr-2 h-5 w-5" />
          Firmenmodus aktiv
        </CardTitle>
        <CardDescription>
          Sie sind derzeit in einer Firmenumgebung angemeldet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tenantCompany && (
          <div className="p-3 bg-white rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{tenantCompany.name}</p>
                <p className="text-sm text-gray-500">Aktive Firma</p>
              </div>
              <Badge className="bg-orange-100 text-orange-800">Tenant-Modus</Badge>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={exitTenantMode}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Home className="mr-2 h-4 w-4" />
            Zurück zur MINUTE-Administration
          </Button>
        </div>
        
        <p className="text-xs text-gray-500">
          Klicken Sie hier, um zur MINUTE Super-Admin-Ansicht zurückzukehren.
        </p>
      </CardContent>
    </Card>
  );
}