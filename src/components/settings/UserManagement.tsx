
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Settings } from "lucide-react";

const UserManagement = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="accounts">Benutzerkonten</TabsTrigger>
          <TabsTrigger value="roles">Rollen & Rechte</TabsTrigger>
          <TabsTrigger value="ldap">LDAP/AD</TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Benutzerkonten verwalten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Hier können Sie Benutzerkonten erstellen, bearbeiten und verwalten.
              </p>
              <p className="text-muted-foreground">
                Benutzerstatistiken werden geladen...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Rollen & Berechtigungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Definieren Sie Rollen und verwalten Sie Berechtigungen für verschiedene Benutzergruppen.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ldap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                LDAP/Active Directory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Konfigurieren Sie die Integration mit LDAP oder Active Directory.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
