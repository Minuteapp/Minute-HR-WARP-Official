
import { Card } from "@/components/ui/card";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Echte Daten aus der Datenbank laden
const growthData = [];

const companyData = [];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export const AdminStatistics = () => {
  const [timeframe, setTimeframe] = useState("6m");

  return (
    <Card className="p-6 border-primary/30 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Nutzungsstatistiken Übersicht</h2>
        <p className="text-sm text-muted-foreground">
          Übersicht aller Nutzungsstatistiken der Plattform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-4 border-primary/30 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Registrierte Firmen</h3>
          <p className="text-3xl font-bold mt-2">-</p>
          <p className="text-xs text-muted-foreground mt-1">Keine Daten verfügbar</p>
        </Card>

        <Card className="p-4 border-primary/30 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Mitarbeiter insgesamt</h3>
          <p className="text-3xl font-bold mt-2">-</p>
          <p className="text-xs text-muted-foreground mt-1">Keine Daten verfügbar</p>
        </Card>

        <Card className="p-4 border-primary/30 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Premium Abonnenten</h3>
          <p className="text-3xl font-bold mt-2">-</p>
          <p className="text-xs text-muted-foreground mt-1">Keine Daten verfügbar</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-4 border-primary/30 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Abonnement Verteilung</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={companyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {companyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 border-primary/30 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Wachstumstrend</h3>
          <div className="mb-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="1m">Letzter Monat</option>
              <option value="3m">Letzte 3 Monate</option>
              <option value="6m">Letzte 6 Monate</option>
              <option value="1y">Letztes Jahr</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                 data={growthData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-4 border-primary/30 shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Monatliche Aktivität</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={growthData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#8884d8" />
              <Bar dataKey="revenue" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </Card>
  );
};
