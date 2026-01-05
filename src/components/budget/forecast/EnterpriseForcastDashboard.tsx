
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, DollarSign, Calendar, Target, BarChart3 } from "lucide-react";
import type { BudgetLineItem, BudgetAlert } from "@/types/budgetEnterprise";

export const EnterpriseForcastDashboard = () => {
  // Budget-Daten aus der Datenbank laden
  const budgetItems: BudgetLineItem[] = [];

  const budgetAlerts: BudgetAlert[] = [];

  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Forecast Dashboard</h1>
          <p className="text-gray-600 mt-2">Umfassende Budgetprognose und -analyse</p>
        </div>
      </div>

      {/* Benachrichtigungen */}
      {budgetAlerts.some(alert => !alert.is_acknowledged) && (
        <div className="space-y-2">
          {budgetAlerts
            .filter(alert => !alert.is_acknowledged)
            .map(alert => (
              <Alert key={alert.id} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
        </div>
      )}

      {/* Hauptinhalt */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="forecasts">Prognosen</TabsTrigger>
          <TabsTrigger value="budget-items">Budget-Positionen</TabsTrigger>
          <TabsTrigger value="analytics">Analysen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistik-Karten */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gesamtbudget</p>
                    <p className="text-2xl font-bold">€{budgetItems.reduce((sum, item) => sum + (item.total_amount || item.amount), 0).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prognosegenauigkeit</p>
                    <p className="text-2xl font-bold">92%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Aktive Prognosen</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nächste Überprüfung</p>
                    <p className="text-2xl font-bold">3 Tage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prognose-Übersicht</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Prognose-Details werden hier angezeigt...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget-items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget-Positionen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.title || item.category}</h4>
                      <p className="text-sm text-gray-500">{item.item_type || 'Standard'} - {item.is_recurring ? 'Wiederkehrend' : 'Einmalig'}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">€{(item.total_amount || item.amount).toLocaleString()}</p>
                      <Badge variant="outline">{item.currency}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.title || item.category}</h4>
                      <p className="text-sm text-gray-500">{item.item_type || 'Standard'} - {item.is_recurring ? 'Wiederkehrend' : 'Einmalig'}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">€{(item.total_amount || item.amount).toLocaleString()}</p>
                      <Badge variant="outline">{item.currency}</Badge>
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
};

export default EnterpriseForcastDashboard;
