
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { useSLAConfigs } from '@/hooks/useHelpdesk';

export const HelpdeskSLADashboard = () => {
  const { data: slaConfigs, isLoading } = useSLAConfigs();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lade SLA-Konfigurationen...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Eingehalten</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">In den letzten 30 Tagen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gefährdete Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">SLA bald überschritten</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Reaktionszeit</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2h</div>
            <p className="text-xs text-muted-foreground">Durchschnittlich</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Lösungszeit</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5h</div>
            <p className="text-xs text-muted-foreground">Durchschnittlich</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SLA-Konfigurationen</CardTitle>
          <CardDescription>
            Aktuelle Service Level Agreement Einstellungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {slaConfigs?.map((config) => (
              <Card key={config.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{config.name}</h3>
                    <Badge variant={config.is_active ? "default" : "secondary"}>
                      {config.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Kategorie:</span>
                      <br />
                      <span className="font-medium">{config.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Priorität:</span>
                      <br />
                      <span className="font-medium capitalize">{config.priority}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Erste Antwort:</span>
                      <br />
                      <span className="font-medium">{config.first_response_hours}h</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Lösung:</span>
                      <br />
                      <span className="font-medium">{config.resolution_hours}h</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Eskalation nach {config.escalation_hours}h
                      {config.business_hours_only && " (nur Geschäftszeiten)"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
