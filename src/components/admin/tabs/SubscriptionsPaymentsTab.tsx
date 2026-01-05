import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, AlertCircle, BarChart3 } from "lucide-react";

const SubscriptionsPaymentsTab = () => {
  const stats = [
    { label: "MRR", value: "€0", change: "-", positive: true, icon: DollarSign },
    { label: "ARR", value: "€0", change: "-", positive: true, icon: TrendingUp },
    { label: "Offene Beträge", value: "€0", change: "-", positive: true, icon: AlertCircle },
    { label: "Durchschn. Deal Size", value: "€0", change: "-", positive: true, icon: BarChart3 },
  ];

  const subscriptions: {
    tenant: string;
    subId: string;
    tariff: string;
    interval: string;
    pricePerMA: string;
    employees: number;
    monthly: string;
    modules: number;
    discount: string;
    renewal: string;
  }[] = [];

  const getTariffColor = (tariff: string) => {
    switch (tariff) {
      case "Enterprise": return "text-primary hover:underline cursor-pointer";
      case "Pro": return "text-primary hover:underline cursor-pointer";
      case "Basic": return "text-primary hover:underline cursor-pointer";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Abonnements, Zahlungen & Verträge</h2>
        <p className="text-sm text-muted-foreground">Finanzielle Übersicht aller Mandanten</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">
                    {stat.change}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-muted">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sub-Tabs */}
      <Tabs defaultValue="subscriptions">
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none p-0 h-auto">
          <TabsTrigger value="subscriptions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3">
            Abonnements
          </TabsTrigger>
          <TabsTrigger value="invoices" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3">
            Rechnungen & Zahlungen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="mt-6">
          {/* Subscriptions Table */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mandant</TableHead>
                    <TableHead>Tarif</TableHead>
                    <TableHead>Intervall</TableHead>
                    <TableHead>Preis/MA</TableHead>
                    <TableHead>Mitarbeiter</TableHead>
                    <TableHead>Monatlich</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Rabatt</TableHead>
                    <TableHead>Verlängerung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        Keine Abonnements vorhanden
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.map((sub, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{sub.tenant}</p>
                            <p className="text-sm text-muted-foreground">{sub.subId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={getTariffColor(sub.tariff)}>{sub.tariff}</span>
                        </TableCell>
                        <TableCell>{sub.interval}</TableCell>
                        <TableCell>{sub.pricePerMA}</TableCell>
                        <TableCell>{sub.employees}</TableCell>
                        <TableCell className="font-medium">{sub.monthly}</TableCell>
                        <TableCell>{sub.modules}</TableCell>
                        <TableCell>{sub.discount}</TableCell>
                        <TableCell>{sub.renewal}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">Keine Rechnungsdaten vorhanden</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionsPaymentsTab;
