
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Employee } from '@/types/employee.types';
import { supabase } from '@/integrations/supabase/client';
import EmployeeDetails from '@/components/employees/EmployeeDetails';
import { Badge } from '@/components/ui/badge';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { Shield } from 'lucide-react';

/**
 * Profilseite für den eingeloggten Benutzer
 * Zeigt das Profil des aktuell eingeloggten Mitarbeiters an
 */
const ProfilePage = () => {
  const { user } = useAuth();
  const { isSuperAdmin } = useRolePermissions();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  
  // DIREKTE ÜBERPRÜFUNG des SuperAdmin-Status für Debugging
  const userMetadata = user?.user_metadata || {};
  const metadataRole = userMetadata.role?.toLowerCase?.() || '';
  const directSuperAdmin = metadataRole === 'superadmin';
  
  console.log("Profil-Seite - Benutzer-Metadaten:", userMetadata);
  console.log("Profil-Seite - Rolle aus Metadaten:", metadataRole);
  console.log("Profil-Seite - Direkt aus Metadaten erkannter SuperAdmin:", directSuperAdmin);
  console.log("Profil-Seite - Aus Hook erkannter SuperAdmin:", isSuperAdmin);
  
  useEffect(() => {
    // Wenn kein Benutzer eingeloggt ist, zur Login-Seite navigieren
    if (!user) {
      navigate('/auth/login');
      return;
    }
    
    const createOrFetchProfile = async () => {
      try {
        console.log("Versuche Mitarbeiterprofil zu laden für:", user.email);
        
        // Test der Supabase-Verbindung
        const { data: testData, error: testError } = await supabase
          .from('employees')
          .select('count', { count: 'exact', head: true });
        
        if (testError) {
          console.error("Supabase-Verbindungstest fehlgeschlagen:", testError);
          throw new Error(`Verbindungsfehler: ${testError.message}`);
        }
        
        console.log("Supabase-Verbindung OK, Anzahl Mitarbeiter:", testData);
        
        // Zuerst nach einem vorhandenen Mitarbeiterprofil suchen
        const { data: existingEmployee, error: fetchError } = await supabase
          .from('employees')
          .select('id, name, email')
          .or(`email.eq.${user.email},name.eq.Daniel Häuslein`)
          .maybeSingle();
        
        if (fetchError) {
          console.error("Fehler beim Laden des Mitarbeiterprofils:", fetchError);
          throw new Error(`Ladefehler: ${fetchError.message}`);
        }
        
        // Wenn bereits ein Profil existiert, dessen ID verwenden
        if (existingEmployee) {
          console.log("Bestehendes Mitarbeiterprofil gefunden:", existingEmployee);
          setEmployeeId(existingEmployee.id);
          setLoading(false);
          return;
        }
        
        // Wenn kein Profil existiert, eines erstellen
        console.log("Kein bestehendes Profil gefunden, erstelle neues für:", user.email);
        
        // WICHTIG: Company-ID ermitteln
        const { data: companyId, error: companyIdError } = await supabase.rpc('get_effective_company_id');
        
        if (companyIdError || !companyId) {
          console.error("Keine company_id gefunden:", companyIdError);
          throw new Error("Keine Firma zugeordnet. Bitte kontaktieren Sie den Administrator.");
        }
        
        const { data: newEmployee, error: createError } = await supabase
          .from('employees')
          .insert([
            {
              name: user.email?.split('@')[0] || 'Neuer Benutzer',
              email: user.email,
              position: 'Mitarbeiter',
              team: 'Allgemein',
              role: 'Mitarbeiter',
              status: 'active',
              department: 'Allgemein',
              first_name: user.email?.split('@')[0] || 'Vorname',
              last_name: 'Nachname',
              start_date: new Date().toISOString().split('T')[0],
              working_hours: 40,
              company_id: companyId
            }
          ])
          .select('id')
          .single();
        
        if (createError) {
          console.error("Fehler beim Erstellen des Mitarbeiterprofils:", createError);
          throw new Error(`Erstellungsfehler: ${createError.message}`);
        }
        
        if (newEmployee) {
          setEmployeeId(newEmployee.id);
          toast({
            title: "Profil erstellt",
            description: "Ein neues Mitarbeiterprofil wurde für Sie erstellt.",
          });
        }
      } catch (error: any) {
        console.error('Fehler beim Erstellen/Abrufen des Mitarbeiterprofils:', error);
        const errorMessage = error?.message || error?.toString() || 'Unbekannter Fehler';
        
        toast({
          title: "Verbindungsfehler",
          description: `Mitarbeiterprofil konnte nicht geladen werden: ${errorMessage}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    createOrFetchProfile();
  }, [user, navigate, toast]);

  // SuperAdmin Status aus der useRolePermissions Hook nutzen und loggen
  console.log("Profil-Seite - isSuperAdmin:", isSuperAdmin);
  console.log("Profil-Seite - current user:", user?.email);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!employeeId) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
          <h2 className="text-lg font-medium">Kein Mitarbeiterprofil gefunden</h2>
          <p className="mt-2">Es konnte kein Mitarbeiterprofil für Ihren Benutzeraccount gefunden werden oder erstellt werden.</p>
        </div>
      </div>
    );
  }
  
  // Hier wird geprüft ob der Nutzer ein SuperAdmin ist (entweder direkt aus den Metadaten oder über den Hook)
  const showAdminBadge = isSuperAdmin || directSuperAdmin;
  
  return (
    <div className="space-y-8">
      {showAdminBadge && (
        <div className="max-w-7xl mx-auto px-8 mt-4">
          <div className="border border-blue-500 rounded-md p-4 bg-blue-50">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-700" />
              <h2 className="text-lg font-medium text-blue-700">Administratorbereich</h2>
              <Badge variant="destructive" className="text-xs">SuperAdmin</Badge>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Sie haben SuperAdmin-Rechte und können auf alle Funktionen zugreifen.
            </p>
          </div>
        </div>
      )}
      <EmployeeDetails employeeId={employeeId} />
    </div>
  );
};

export default ProfilePage;
