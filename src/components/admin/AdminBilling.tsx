import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, CreditCard, TrendingUp, AlertTriangle, Check } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const revenueData: { month: string; value: number }[] = [];

const planData: { name: string; value: number; color: string }[] = [];

const topCustomers: { rank: number; name: string; plan: string; revenue: string }[] = [];

export const AdminBilling = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Abrechnung & Finanzen</h1>
        <p className="text-muted-foreground mt-1">
          Stripe Integration (Dummy-Modus) • Umsatzübersicht • Rechnungsverwaltung
        </p>
        <Badge variant="secondary" className="mt-2">Vorschau</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monatlicher Umsatz</p>
                <p className="text-2xl font-bold">€0</p>
                <p className="text-xs text-muted-foreground mt-1">-</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bezahlte Rechnungen</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground mt-1">Dieser Monat</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ø Rechnungswert</p>
                <p className="text-2xl font-bold">€0</p>
                <p className="text-xs text-muted-foreground mt-1">Pro Rechnung</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zahlungsverzug</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground mt-1">-</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Umsatzentwicklung</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Keine Daten verfügbar
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Plan Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Plan-Verteilung</CardTitle>
          </CardHeader>
          <CardContent>
            {planData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Keine Daten verfügbar
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {planData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stripe Integration Info */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <CreditCard className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900">Stripe Integration (Dummy-Modus)</h3>
              <p className="text-sm text-purple-800 mt-1">
                Das System arbeitet aktuell im Demo-Modus. Für Live-Zahlungen fügen Sie Ihren Stripe API-Key in den Einstellungen hinzu.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-purple-800">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Bidirektionale Synchronisierung vorbereitet
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Customer & Subscription IDs werden automatisch verknüpft
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Webhooks für Zahlungsereignisse konfigurierbar
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Aktuelle Rechnungen</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rechnung-ID</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Betrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rechnungsdatum</TableHead>
                <TableHead>Fälligkeit</TableHead>
                <TableHead className="text-right">Bezahlt am</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Keine Rechnungsdaten vorhanden
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top-Kunden nach Umsatz</CardTitle>
        </CardHeader>
        <CardContent>
          {topCustomers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Keine Kundendaten vorhanden
            </div>
          ) : (
            <div className="space-y-4">
              {topCustomers.map((customer) => (
                <div key={customer.rank} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-semibold">
                      {customer.rank}
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.plan}</p>
                    </div>
                  </div>
                  <p className="font-semibold">{customer.revenue}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
