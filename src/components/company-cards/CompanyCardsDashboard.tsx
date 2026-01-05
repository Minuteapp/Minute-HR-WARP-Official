import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Plus, TrendingUp, AlertTriangle, DollarSign, Users, Settings } from "lucide-react";
import { CardList } from "./CardList";
import { CardTransactions } from "./CardTransactions";
import { CardLimitsManagement } from "./CardLimitsManagement";
import { CardRequestDialog } from "./CardRequestDialog";
import { usePermissionContext } from "@/contexts/PermissionContext";

export const CompanyCardsDashboard = () => {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("cards");
  const { hasPermission } = usePermissionContext();

  // Berechtigungsbasierte Tabs
  const allTabs = [
    { id: 'cards', label: 'Meine Karte', icon: CreditCard, requiredAction: 'view' },
    { id: 'transactions', label: 'Transaktionen', icon: TrendingUp, requiredAction: 'view' },
    { id: 'limits', label: 'Limits verwalten', icon: DollarSign, requiredAction: 'update', adminOnly: true },
    { id: 'settings', label: 'Einstellungen', icon: Settings, requiredAction: 'view' },
  ];

  const tabs = useMemo(() => {
    const canAdmin = hasPermission('company_cards', 'update');
    
    return allTabs.filter(tab => {
      if (tab.adminOnly && !canAdmin) return false;
      return hasPermission('company_cards', tab.requiredAction);
    });
  }, [hasPermission]);

  const canAdmin = hasPermission('company_cards', 'update');

  // Mock-Statistiken (nur für Admins alle anzeigen)
  const stats = {
    totalCards: 47,
    activeCards: 42,
    totalLimit: 250000,
    currentUsage: 78450,
    pendingRequests: 3,
    blockedCards: 2
  };

  const usagePercentage = (stats.currentUsage / stats.totalLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Firmenkarten</h1>
          <p className="text-muted-foreground">
            {canAdmin 
              ? "Verwalten Sie alle Firmenkreditkarten und deren Nutzung"
              : "Ihre Firmenkarte und Transaktionen"
            }
          </p>
        </div>
        <Button onClick={() => setShowRequestDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Karte beantragen
        </Button>
      </div>

      {/* Statistik-Karten - Für Admins vollständig, für Mitarbeiter nur eigene Daten */}
      {canAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aktive Karten</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCards}</div>
              <p className="text-xs text-muted-foreground">von {stats.totalCards} gesamt</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monatliches Limit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLimit.toLocaleString('de-DE')} €</div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${usagePercentage > 80 ? 'bg-destructive' : usagePercentage > 60 ? 'bg-yellow-500' : 'bg-primary'}`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aktuelle Nutzung</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentUsage.toLocaleString('de-DE')} €</div>
              <p className="text-xs text-muted-foreground">{usagePercentage.toFixed(1)}% des Limits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Offene Anträge</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">{stats.blockedCards} Karten gesperrt</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Mitarbeiter-Ansicht: Nur eigene Karten-Statistiken */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mein Limit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5.000 €</div>
              <p className="text-xs text-muted-foreground">Monatliches Limit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Meine Nutzung</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.234 €</div>
              <p className="text-xs text-muted-foreground">24,7% des Limits</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs - Rollenbasiert */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          {tabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id}>
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="cards">
          <CardList />
        </TabsContent>

        <TabsContent value="transactions">
          <CardTransactions />
        </TabsContent>

        <TabsContent value="limits">
          <CardLimitsManagement />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Karteneinstellungen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Hier können Sie Ihre persönlichen Karteneinstellungen anpassen.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialoge */}
      <CardRequestDialog open={showRequestDialog} onOpenChange={setShowRequestDialog} />
    </div>
  );
};
