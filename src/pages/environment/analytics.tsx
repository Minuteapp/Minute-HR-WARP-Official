
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  Filter, 
  BarChart4,
  LineChart,
  PieChart,
  Share2
} from "lucide-react";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  BarChart as RechartsBarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useEnvironmentStore } from "@/stores/useEnvironmentStore";

// Benutzerdefinierte Typ-Definition für Daten
interface DataPoint {
  month: string;
  value: number;
  category?: string;
}

const COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'];

const EnvironmentAnalytics = () => {
  const { toast } = useToast();
  const { initiatives } = useEnvironmentStore();
  const [dateRange, setDateRange] = useState('year');
  const [category, setCategory] = useState('all');
  
  // Simulierte Daten für Umweltkennzahlen
  const emissionsData: DataPoint[] = [
    { month: 'Jan', value: 42 },
    { month: 'Feb', value: 38 },
    { month: 'Mär', value: 45 },
    { month: 'Apr', value: 40 },
    { month: 'Mai', value: 35 },
    { month: 'Jun', value: 30 },
    { month: 'Jul', value: 28 },
    { month: 'Aug', value: 25 },
    { month: 'Sep', value: 32 },
    { month: 'Okt', value: 36 },
    { month: 'Nov', value: 39 },
    { month: 'Dez', value: 35 },
  ];
  
  const energyData: DataPoint[] = [
    { month: 'Jan', value: 2500 },
    { month: 'Feb', value: 2300 },
    { month: 'Mär', value: 2400 },
    { month: 'Apr', value: 2200 },
    { month: 'Mai', value: 2100 },
    { month: 'Jun', value: 2000 },
    { month: 'Jul', value: 1900 },
    { month: 'Aug', value: 1850 },
    { month: 'Sep', value: 2050 },
    { month: 'Okt', value: 2150 },
    { month: 'Nov', value: 2250 },
    { month: 'Dez', value: 2350 },
  ];
  
  const wasteData: DataPoint[] = [
    { month: 'Jan', value: 1200 },
    { month: 'Feb', value: 1100 },
    { month: 'Mär', value: 1050 },
    { month: 'Apr', value: 1000 },
    { month: 'Mai', value: 950 },
    { month: 'Jun', value: 900 },
    { month: 'Jul', value: 850 },
    { month: 'Aug', value: 800 },
    { month: 'Sep', value: 950 },
    { month: 'Okt', value: 1000 },
    { month: 'Nov', value: 1050 },
    { month: 'Dez', value: 1100 },
  ];
  
  const waterData: DataPoint[] = [
    { month: 'Jan', value: 3500 },
    { month: 'Feb', value: 3200 },
    { month: 'Mär', value: 3300 },
    { month: 'Apr', value: 3100 },
    { month: 'Mai', value: 3000 },
    { month: 'Jun', value: 2950 },
    { month: 'Jul', value: 2900 },
    { month: 'Aug', value: 2850 },
    { month: 'Sep', value: 3000 },
    { month: 'Okt', value: 3100 },
    { month: 'Nov', value: 3200 },
    { month: 'Dez', value: 3300 },
  ];
  
  const costsData: DataPoint[] = [
    { month: 'Jan', value: 25000 },
    { month: 'Feb', value: 23000 },
    { month: 'Mär', value: 24000 },
    { month: 'Apr', value: 22000 },
    { month: 'Mai', value: 21000 },
    { month: 'Jun', value: 20000 },
    { month: 'Jul', value: 19000 },
    { month: 'Aug', value: 18500 },
    { month: 'Sep', value: 20500 },
    { month: 'Okt', value: 21500 },
    { month: 'Nov', value: 22500 },
    { month: 'Dez', value: 23500 },
  ];
  
  // Kreisdiagramm-Daten
  const resourceDistribution = [
    { name: 'Strom', value: 35 },
    { name: 'Wasser', value: 20 },
    { name: 'Heizung', value: 25 },
    { name: 'Materialien', value: 15 },
    { name: 'Sonstiges', value: 5 },
  ];
  
  const wasteDistribution = [
    { name: 'Papier', value: 40 },
    { name: 'Plastik', value: 25 },
    { name: 'Organisch', value: 20 },
    { name: 'Metall', value: 10 },
    { name: 'Sonstiges', value: 5 },
  ];
  
  const emissionsDistribution = [
    { name: 'Strom', value: 45 },
    { name: 'Heizung', value: 30 },
    { name: 'Transport', value: 20 },
    { name: 'Sonstiges', value: 5 },
  ];
  
  // Zusammenführung der Daten für die Vergleichsdiagramme
  const combinedMonthlyData = useMemo(() => {
    return emissionsData.map((item, index) => ({
      month: item.month,
      Emissionen: item.value,
      Energie: energyData[index].value / 100, // Skaliert für bessere Visualisierung
      Abfall: wasteData[index].value / 50,    // Skaliert für bessere Visualisierung
      Wasser: waterData[index].value / 150,   // Skaliert für bessere Visualisierung
    }));
  }, [emissionsData, energyData, wasteData, waterData]);
  
  // Initiative-Fortschritt nach Kategorie
  const initiativeProgressByCategory = useMemo(() => {
    const categories: Record<string, {total: number, count: number}> = {};
    
    initiatives.forEach(initiative => {
      if (initiative.tags && initiative.tags.length > 0) {
        initiative.tags.forEach(tag => {
          if (!categories[tag]) {
            categories[tag] = {total: 0, count: 0};
          }
          categories[tag].total += initiative.progress;
          categories[tag].count += 1;
        });
      }
    });
    
    return Object.entries(categories).map(([name, data]) => ({
      name,
      value: Math.round(data.total / data.count)
    }));
  }, [initiatives]);
  
  const handleExport = () => {
    toast({
      title: "Export gestartet",
      description: "Ihre Daten werden als Excel-Datei exportiert.",
    });
  };
  
  const handleShare = () => {
    toast({
      title: "Link kopiert",
      description: "Ein Link zum Teilen dieses Berichts wurde in die Zwischenablage kopiert.",
    });
  };
  
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link to="/environment">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Umweltkennzahlen & Analysen</h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportieren
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Teilen
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Zeitraum:</span>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Letzter Monat</SelectItem>
              <SelectItem value="quarter">Letztes Quartal</SelectItem>
              <SelectItem value="year">Letztes Jahr</SelectItem>
              <SelectItem value="custom">Benutzerdefiniert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Kategorie:</span>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              <SelectItem value="emissions">Emissionen</SelectItem>
              <SelectItem value="energy">Energieverbrauch</SelectItem>
              <SelectItem value="water">Wasserverbrauch</SelectItem>
              <SelectItem value="waste">Abfallmanagement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" size="sm" className="gap-1">
          <Calendar className="h-4 w-4" />
          <span>Zeitraum wählen</span>
        </Button>
        
        <Button variant="outline" size="sm" className="gap-1">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">CO2-Emissionen</CardTitle>
            <CardDescription>Durchschnitt pro Monat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">35.8 t</div>
              <div className="text-sm text-green-600 flex items-center">
                -12% <span className="ml-1">↓</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Energieverbrauch</CardTitle>
            <CardDescription>Durchschnitt pro Monat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">2,150 kWh</div>
              <div className="text-sm text-green-600 flex items-center">
                -8% <span className="ml-1">↓</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Wasserverbrauch</CardTitle>
            <CardDescription>Durchschnitt pro Monat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">3,050 m³</div>
              <div className="text-sm text-green-600 flex items-center">
                -5% <span className="ml-1">↓</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recyclingquote</CardTitle>
            <CardDescription>Aktuelle Quote</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">78%</div>
              <div className="text-sm text-green-600 flex items-center">
                +6% <span className="ml-1">↑</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="emissions" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Emissionen
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Ressourcen
          </TabsTrigger>
          <TabsTrigger value="initiatives" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            Initiativen
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vergleich der Umweltkennzahlen</CardTitle>
                <CardDescription>Trendanalyse über das letzte Jahr</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={combinedMonthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Emissionen" stroke="#ef4444" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Energie" stroke="#3b82f6" />
                      <Line type="monotone" dataKey="Abfall" stroke="#f59e0b" />
                      <Line type="monotone" dataKey="Wasser" stroke="#22c55e" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Kostenentwicklung</CardTitle>
                <CardDescription>Kosten für Ressourcen und Umweltmaßnahmen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={costsData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value.toLocaleString()} €`, 'Kosten']} />
                      <Bar dataKey="value" name="Kosten" fill="#8884d8" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Initiativen-Fortschritt nach Kategorien</CardTitle>
                <CardDescription>Durchschnittlicher Fortschritt nach Umweltkategorien</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={initiativeProgressByCategory} layout="vertical" margin={{ top: 20, right: 30, left: 70, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip formatter={(value) => [`${value}%`, 'Fortschritt']} />
                      <Bar dataKey="value" name="Fortschritt" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={30} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="emissions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CO2-Emissionen im Jahresverlauf</CardTitle>
                <CardDescription>Monatlicher Verlauf in Tonnen CO2-Äquivalent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={emissionsData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} t`, 'CO2-Äquivalent']} />
                      <Line type="monotone" dataKey="value" name="CO2-Emissionen" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Emissionsquellen</CardTitle>
                <CardDescription>Verteilung nach Quellen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <Pie
                        data={emissionsDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {emissionsDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Anteil']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Emissionen im Vergleich zum Branchendurchschnitt</CardTitle>
                <CardDescription>Vergleichsanalyse der CO2-Emissionen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={[
                      { name: 'Q1', Unternehmen: 120, Branchendurchschnitt: 150 },
                      { name: 'Q2', Unternehmen: 110, Branchendurchschnitt: 145 },
                      { name: 'Q3', Unternehmen: 105, Branchendurchschnitt: 140 },
                      { name: 'Q4', Unternehmen: 95, Branchendurchschnitt: 135 },
                    ]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Unternehmen" fill="#22c55e" />
                      <Bar dataKey="Branchendurchschnitt" fill="#94a3b8" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="resources">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ressourcenverteilung</CardTitle>
                <CardDescription>Verteilung des Ressourcenverbrauchs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <Pie
                        data={resourceDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {resourceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Anteil']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Abfallverteilung</CardTitle>
                <CardDescription>Verteilung nach Abfalltypen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <Pie
                        data={wasteDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {wasteDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Anteil']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Wasserverbrauch</CardTitle>
                <CardDescription>Monatlicher Verlauf in m³</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={waterData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} m³`, 'Wasserverbrauch']} />
                      <Line type="monotone" dataKey="value" name="Wasserverbrauch" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Energieverbrauch</CardTitle>
                <CardDescription>Monatlicher Verlauf in kWh</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={energyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} kWh`, 'Energieverbrauch']} />
                      <Line type="monotone" dataKey="value" name="Energieverbrauch" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="initiatives">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Initiative Status</CardTitle>
                <CardDescription>Verteilung nach Status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <Pie
                        data={[
                          { name: 'In Bearbeitung', value: initiatives.filter(i => i.status === 'in-progress').length },
                          { name: 'Abgeschlossen', value: initiatives.filter(i => i.status === 'completed').length },
                          { name: 'Geplant', value: initiatives.filter(i => i.status === 'planned').length },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {emissionsDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}`, 'Anzahl']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Gesamtfortschritt</CardTitle>
                <CardDescription>Durchschnittlicher Fortschritt aller Umweltinitiativen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart 
                      data={[
                        { name: 'Q1', value: 35 },
                        { name: 'Q2', value: 48 },
                        { name: 'Q3', value: 62 },
                        { name: 'Q4', value: 78 },
                      ]} 
                      margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Fortschritt']} />
                      <Bar dataKey="value" name="Fortschritt" fill="#22c55e" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnvironmentAnalytics;
