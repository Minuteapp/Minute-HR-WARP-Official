import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  BarChart3, 
  Settings, 
  Users, 
  AlertTriangle,
  DollarSign,
  Plane,
  Globe,
  FileText,
  Shield
} from "lucide-react";

const BusinessTravelAdminPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="w-full py-6 px-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Geschäftsreisen - Administration</h1>
            <p className="text-muted-foreground">Zentrale Verwaltung & Übersicht aller Geschäftsreisen</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Reisen</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +3 seit letzter Woche
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monatliche Kosten</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€48.420</div>
            <p className="text-xs text-muted-foreground">
              -12% vom Budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Warten auf Genehmigung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Niedrig</div>
            <p className="text-xs text-muted-foreground">
              Durchschnitt: 2.1/10
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" /> Übersicht
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-1">
            <Globe className="h-4 w-4" /> Weltkarte
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-1">
            <FileText className="h-4 w-4" /> Genehmigungen
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-1">
            <Shield className="h-4 w-4" /> Compliance
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" /> Einstellungen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Aktuelle Reisen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Anna Müller</p>
                        <p className="text-sm text-muted-foreground">Barcelona → Berlin</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">€1.240</p>
                      <p className="text-xs text-muted-foreground">15.-18.07.</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Thomas Schmidt</p>
                        <p className="text-sm text-muted-foreground">New York → Frankfurt</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">€2.850</p>
                      <p className="text-xs text-muted-foreground">20.-25.07.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kostentreiber</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Flugkosten</span>
                    <span className="text-sm font-medium">€28.540</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Hotel & Unterkunft</span>
                    <span className="text-sm font-medium">€15.230</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mietwagen</span>
                    <span className="text-sm font-medium">€3.420</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sonstiges</span>
                    <span className="text-sm font-medium">€1.230</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Globale Reiseübersicht
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Weltkarte mit Live-Reisedaten</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Integration mit Mapbox/Leaflet kommt im nächsten Schritt
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Genehmigungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Lisa Weber - London Konferenz</p>
                    <p className="text-sm text-muted-foreground">Eingereicht am 10.07.2024</p>
                    <p className="text-sm text-blue-600">Budget: €1.890</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                    <Button size="sm" variant="destructive">
                      Ablehnen
                    </Button>
                    <Button size="sm">
                      Genehmigen
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Risk Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Risk Assessment & Compliance Features</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatische Risikobewertung und DSGVO-konforme Dokumentation
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Travel Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Detaillierte Reise-Analytics</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Trends, Forecasts und Kostenoptimierung
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="max-w-xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-muted rounded-full">
                  <Settings className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <CardTitle>Geschäftsreise-Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Alle Einstellungen für Geschäftsreisen wurden in das zentrale Einstellungsmodul verschoben.
              </p>
              <Button onClick={() => window.location.href = '/settings/business-travel'}>
                Zu den Einstellungen
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessTravelAdminPage;