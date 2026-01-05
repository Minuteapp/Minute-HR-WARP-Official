import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Users, Euro, Download, Filter, BarChart3, PieChart as PieChartIcon, Calendar } from "lucide-react";

interface User {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface ExpenseReportingProps {
  user: User;
}

// Mock data for demonstration - leer für neue Firmen
const mockExpenseData: any[] = [];

const categoryData: any[] = [];

const departmentData: any[] = [];

const topSpenders: any[] = [];

export function ExpenseReporting({ user }: ExpenseReportingProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('6months');

  const totalExpenses = mockExpenseData.reduce((sum, item) => sum + (item.travel || 0) + (item.accommodation || 0) + (item.meals || 0) + (item.other || 0), 0);
  const avgMonthlyExpenses = mockExpenseData.length > 0 ? totalExpenses / mockExpenseData.length : 0;
  const lastMonthExpenses = mockExpenseData.length > 0 ? mockExpenseData[mockExpenseData.length - 1] : null;
  const previousMonthExpenses = mockExpenseData.length > 1 ? mockExpenseData[mockExpenseData.length - 2] : null;
  
  const getExpenseTotal = (item: any) => item ? (item.travel || 0) + (item.accommodation || 0) + (item.meals || 0) + (item.other || 0) : 0;
  const lastTotal = getExpenseTotal(lastMonthExpenses);
  const prevTotal = getExpenseTotal(previousMonthExpenses);
  const monthlyGrowth = prevTotal > 0 ? ((lastTotal - prevTotal) / prevTotal) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header mit Filtern */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Spesen-Reporting & Analysen
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Umfassende Berichte und Analysen zu Reisekosten und Spesenabrechnungen
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Letzter Monat</SelectItem>
                  <SelectItem value="3months">Letzte 3 Monate</SelectItem>
                  <SelectItem value="6months">Letzte 6 Monate</SelectItem>
                  <SelectItem value="1year">Letztes Jahr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Abteilung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Abteilungen</SelectItem>
                <SelectItem value="sales">Vertrieb</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="consulting">Beratung</SelectItem>
                <SelectItem value="management">Management</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Gesamtausgaben</p>
                <p className="text-2xl font-bold">{totalExpenses.toLocaleString('de-DE')} €</p>
                <p className="text-xs text-muted-foreground">Letzten 6 Monate</p>
              </div>
              <Euro className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Durchschnitt/Monat</p>
                <p className="text-2xl font-bold">{Math.round(avgMonthlyExpenses).toLocaleString('de-DE')} €</p>
                <div className="flex items-center gap-1">
                  {monthlyGrowth > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <p className={`text-xs ${monthlyGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(monthlyGrowth).toFixed(1)}% vs Vormonat
                  </p>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Aktive Reisende</p>
                <p className="text-2xl font-bold">127</p>
                <p className="text-xs text-muted-foreground">Mitarbeiter mit Spesen</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold">23</p>
                <p className="text-xs text-muted-foreground">Ausstehende Genehmigungen</p>
              </div>
              <Badge variant="secondary" className="px-2 py-1">
                14.3k €
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Kategorien</TabsTrigger>
          <TabsTrigger value="departments">Abteilungen</TabsTrigger>
          <TabsTrigger value="top-spenders">Top Spender</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Ausgabentrends nach Kategorie</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mockExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value} €`, '']} />
                  <Bar dataKey="travel" stackId="a" fill="#3b82f6" name="Reisekosten" />
                  <Bar dataKey="accommodation" stackId="a" fill="#10b981" name="Unterkunft" />
                  <Bar dataKey="meals" stackId="a" fill="#f59e0b" name="Verpflegung" />
                  <Bar dataKey="other" stackId="a" fill="#ef4444" name="Sonstiges" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Verteilung nach Kategorien</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} €`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {category.value.toLocaleString('de-DE')} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Ausgaben nach Abteilung</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value} €`, '']} />
                  <Bar dataKey="approved" fill="#10b981" name="Genehmigt" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Ausstehend" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-spenders">
          <Card>
            <CardHeader>
              <CardTitle>Top Spender</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSpenders.map((spender, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{spender.name}</div>
                        <div className="text-sm text-muted-foreground">{spender.department}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{spender.amount.toLocaleString('de-DE')} €</div>
                      <div className="text-sm text-muted-foreground">{spender.trips} Reisen</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}