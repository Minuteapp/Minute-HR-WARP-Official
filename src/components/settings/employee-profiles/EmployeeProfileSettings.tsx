
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Settings, FileText, CheckCircle } from "lucide-react";

const EmployeeProfileSettings = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="fields">Felder</TabsTrigger>
          <TabsTrigger value="validation">Validierung</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <UserCircle className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">156</div>
                <div className="text-sm text-gray-600">Mitarbeiterprofile</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-sm text-gray-600">Profil-Templates</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">95%</div>
                <div className="text-sm text-gray-600">Vollständigkeit</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Profil-Einstellungen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Verwalten Sie hier die Einstellungen für Mitarbeiterprofile, erstellen Sie Templates 
                und definieren Sie Validierungsregeln für Profilfelder.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Profil-Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Erstellen Sie Vorlagen für verschiedene Mitarbeitertypen und Positionen.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fields">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Profilfelder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Konfigurieren Sie benutzerdefinierte Felder für Mitarbeiterprofile.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Validierungsregeln
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Definieren Sie Regeln zur Validierung von Profildaten.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeProfileSettings;
