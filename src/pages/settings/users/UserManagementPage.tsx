
import { useEffect } from 'react';
import SecureUserManagement from "@/components/settings/SecureUserManagement";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const UserManagementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isAdmin, isSuperAdmin } = useRolePermissions();

  // Prüfen, ob Benutzer Superadmin oder Admin ist
  const hasAccess = isSuperAdmin || isAdmin;
  
  // Wenn kein Zugang, Fehlermeldung anzeigen und umleiten
  if (!hasAccess) {
    toast({
      variant: "destructive",
      title: "Zugriff verweigert",
      description: "Sie benötigen Administratorrechte, um auf diese Seite zuzugreifen.",
    });
    
    return <Navigate to="/settings" replace />;
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate("/settings")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">Benutzer & Rollen</h1>
        </div>
      </div>

      {isSuperAdmin && (
        <Alert className="bg-amber-50 border-amber-400 mb-6">
          <Crown className="h-5 w-5 text-amber-500" />
          <AlertTitle className="text-amber-700">SuperAdmin-Zugriff</AlertTitle>
          <AlertDescription className="text-amber-600">
            Sie haben als SuperAdmin vollen Zugriff auf die Benutzerverwaltung.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Benutzerverwaltung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SecureUserManagement />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPage;
