import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Download, 
  Upload, 
  Plus,
  Database,
  CheckCircle2,
  Clock,
  Activity
} from 'lucide-react';
import { Scope1DataTable } from './Scope1DataTable';
import { Scope2DataTable } from './Scope2DataTable';
import { Scope3DataTable } from './Scope3DataTable';
import { NewDatasetDialog } from './NewDatasetDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const DataCollectionTab = () => {
  const [activeScope, setActiveScope] = useState('scope1');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Lade echte KPI-Daten aus der Datenbank
  const { data: kpiStats, isLoading } = useQuery({
    queryKey: ['esg-data-collection-kpis'],
    queryFn: async () => {
      const { data: emissions } = await supabase
        .from('esg_emissions')
        .select('*');

      if (!emissions) {
        return { total: 0, verified: 0, pending: 0, totalCO2: 0 };
      }

      const verified = emissions.filter((e: any) => e.status === 'verified').length;
      const pending = emissions.filter((e: any) => e.status === 'pending' || !e.status).length;
      const totalCO2 = emissions.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

      return {
        total: emissions.length,
        verified,
        pending,
        totalCO2: Math.round(totalCO2 * 10) / 10
      };
    }
  });

  const kpis = [
    { icon: Database, label: 'Gesamt Datensätze', value: isLoading ? '-' : kpiStats?.total.toString() || '0', color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: CheckCircle2, label: 'Verifiziert', value: isLoading ? '-' : kpiStats?.verified.toString() || '0', color: 'text-green-600', bg: 'bg-green-100' },
    { icon: Clock, label: 'Ausstehend', value: isLoading ? '-' : kpiStats?.pending.toString() || '0', color: 'text-amber-600', bg: 'bg-amber-100' },
    { icon: Activity, label: 'Gesamt CO₂e', value: isLoading ? '-' : `${kpiStats?.totalCO2.toLocaleString('de-DE')} t`, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Datenerfassung & Validierung</h2>
          <p className="text-sm text-muted-foreground">Erfassen und validieren Sie Ihre Umweltdaten nach GHG Protocol</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Neuer Datensatz
          </Button>
        </div>
      </div>

      {/* Scope Tabs */}
      <Tabs value={activeScope} onValueChange={setActiveScope}>
        <TabsList className="bg-muted">
          <TabsTrigger 
            value="scope1"
            className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              Scope 1
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="scope2"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Scope 2
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="scope3"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              Scope 3
            </div>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${kpi.bg}`}>
                    <IconComponent className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen nach Kategorie, Standort, Mitarbeiter..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Zeitraum
        </Button>
        <Button variant="outline" size="sm">
          <MapPin className="h-4 w-4 mr-2" />
          Standort
        </Button>
      </div>

      {/* Data Tables */}
      <Tabs value={activeScope} onValueChange={setActiveScope}>
        <TabsContent value="scope1" className="m-0">
          <Scope1DataTable />
        </TabsContent>
        <TabsContent value="scope2" className="m-0">
          <Scope2DataTable />
        </TabsContent>
        <TabsContent value="scope3" className="m-0">
          <Scope3DataTable />
        </TabsContent>
      </Tabs>

      {/* New Dataset Dialog */}
      <NewDatasetDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        scope={activeScope}
      />
    </div>
  );
};
