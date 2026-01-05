import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Activity, Cloud, Leaf, Recycle, Sun, TreePalm, Droplets, Container, ArrowRight, Filter, Download, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnvironmentStore } from "@/stores/useEnvironmentStore";
import { useState } from "react";
import { InitiativeFilterDialog } from "@/components/environment/initiatives/InitiativeFilterDialog";

const EnvironmentDashboard = () => {
  const { initiatives } = useEnvironmentStore();
  const recentInitiatives = initiatives.slice(0, 3);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  return (
    <div className="w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <Leaf className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Nachhaltigkeit</h1>
            <p className="text-sm text-muted-foreground">Umwelt- und Nachhaltigkeitsmanagement</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setFilterDialogOpen(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Link to="/environment/analytics">
            <Button variant="outline" size="sm">
              <BarChart className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="initiatives" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">
            Initiativen
          </TabsTrigger>
          <TabsTrigger value="co2" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">
            CO₂-Bilanz
          </TabsTrigger>
          <TabsTrigger value="energy" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">
            Energie
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">
            Berichte
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
          <h3 className="text-xl font-medium mb-2">Aktive Initiativen</h3>
          <p className="text-3xl font-bold text-green-600 mb-2">
            {initiatives.filter(i => i.status === 'in-progress').length}
          </p>
          <p className="text-sm text-gray-600">von insgesamt {initiatives.length} Initiativen</p>
          <div className="mt-4">
            <Link to="/environment/initiatives">
              <Button variant="link" className="px-0 text-green-600 flex items-center">
                Alle anzeigen <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
          <h3 className="text-xl font-medium mb-2">Durchschnittlicher Fortschritt</h3>
          <p className="text-3xl font-bold text-blue-600 mb-2">
            {Math.round(initiatives.reduce((sum, i) => sum + i.progress, 0) / Math.max(initiatives.length, 1))}%
          </p>
          <p className="text-sm text-gray-600">aller Nachhaltigkeitsinitiativen</p>
          <div className="mt-4">
            <Link to="/environment/reports">
              <Button variant="link" className="px-0 text-blue-600 flex items-center">
                Berichte ansehen <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
          <h3 className="text-xl font-medium mb-2">Nächste Deadline</h3>
          <p className="text-3xl font-bold text-purple-600 mb-2">
            {initiatives.find(i => i.endDate)?.endDate ? new Date(initiatives.find(i => i.endDate)?.endDate).toLocaleDateString('de-DE') : 'Keine'}
          </p>
          <p className="text-sm text-gray-600">für aktive Initiativen</p>
          <div className="mt-4">
            <Link to="/environment/initiatives">
              <Button variant="link" className="px-0 text-purple-600 flex items-center">
                Zeitplan ansehen <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <div className="border-b pb-2 mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <TreePalm className="mr-2 h-5 w-5 text-green-500" />
          Aktuelle Umwelt-Initiativen
        </h2>
        <Button variant="outline" size="sm" onClick={() => setFilterDialogOpen(true)}>
          <Filter className="h-4 w-4 mr-1" /> Filtern
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {recentInitiatives.length > 0 ? (
          recentInitiatives.map(initiative => (
            <Link to={`/environment/initiative/${initiative.id}`} key={initiative.id}>
              <Card className="p-4 hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="mb-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                    ${initiative.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    initiative.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                    'bg-amber-100 text-amber-800'}`}>
                    {initiative.status === 'in-progress' ? 'In Bearbeitung' : 
                    initiative.status === 'completed' ? 'Abgeschlossen' : 'Geplant'}
                  </span>
                </div>
                <h3 className="font-medium">{initiative.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1 flex-grow">{initiative.description}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Fortschritt:</span>
                    <span>{initiative.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${initiative.progress}%` }}
                    />
                  </div>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-3 text-center py-8 border border-dashed rounded-md">
            <p className="text-gray-500">Keine Initiativen gefunden.</p>
            <Link to="/environment/initiatives" className="mt-2 inline-block">
              <Button size="sm">Initiative hinzufügen</Button>
            </Link>
          </div>
        )}
        
        {recentInitiatives.length > 0 && (
          <div className="col-span-full">
            <Link to="/environment/initiatives">
              <Button variant="outline" className="w-full">
                Alle Initiativen anzeigen <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      <div className="border-b pb-2 mb-4">
        <h2 className="text-xl font-semibold">Umweltbereiche</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/environment/energy">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Sun className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Energieverbrauch</h3>
                <p className="text-gray-600">Überwachen und optimieren Sie den Energieverbrauch.</p>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link to="/environment/carbon">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">CO2-Bilanz</h3>
                <p className="text-gray-600">Verfolgen Sie Ihre CO2-Emissionen und Einsparungen.</p>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link to="/environment/waste">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Recycle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Abfallmanagement</h3>
                <p className="text-gray-600">Verwalten Sie Abfall und Recycling effizient.</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/environment/water">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Droplets className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Wasserverbrauch</h3>
                <p className="text-gray-600">Überwachen Sie Ihren Wasserverbrauch.</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/environment/supply-chain">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Container className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Lieferkette</h3>
                <p className="text-gray-600">Verwalten Sie Ihre nachhaltige Lieferkette.</p>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link to="/environment/reports">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Cloud className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Nachhaltigkeitsberichte</h3>
                <p className="text-gray-600">Erstellen und verwalten Sie Ihre Berichte.</p>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link to="/environment/engagement">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Mitarbeiterengagement</h3>
                <p className="text-gray-600">Fördern Sie nachhaltiges Verhalten im Team.</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
      
        </TabsContent>

        <TabsContent value="initiatives" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Alle Initiativen</h3>
            <p className="text-muted-foreground">Initiativenliste wird hier angezeigt.</p>
          </Card>
        </TabsContent>

        <TabsContent value="co2" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">CO₂-Bilanz</h3>
            <p className="text-muted-foreground">CO₂-Tracking und Berichte werden hier angezeigt.</p>
          </Card>
        </TabsContent>

        <TabsContent value="energy" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Energiemanagement</h3>
            <p className="text-muted-foreground">Energiedaten werden hier angezeigt.</p>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Nachhaltigkeitsberichte</h3>
            <p className="text-muted-foreground">Berichte werden hier angezeigt.</p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Filter Dialog */}
      <InitiativeFilterDialog 
        open={filterDialogOpen} 
        onOpenChange={setFilterDialogOpen} 
      />
    </div>
  );
};

export default EnvironmentDashboard;
