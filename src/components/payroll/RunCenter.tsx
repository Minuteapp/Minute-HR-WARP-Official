import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  Users, 
  Euro, 
  Download,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { usePayrollData } from '@/hooks/usePayrollData';

interface RunCenterProps {
  userRole: 'admin' | 'hr-manager' | 'supervisor' | 'employee';
}

const RunCenter: React.FC<RunCenterProps> = ({ userRole }) => {
  const { payslips, stats, isLoading } = usePayrollData();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const currentPayslips = payslips?.filter(
    p => p.month === currentMonth && p.year === currentYear
  ) || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Entwurf', variant: 'secondary' as const },
      pending: { label: 'Berechnet', variant: 'default' as const },
      approved: { label: 'Genehmigt', variant: 'default' as const },
      archived: { label: 'Bezahlt', variant: 'default' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const canManagePayroll = userRole === 'admin' || userRole === 'hr-manager';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header mit Aktionen */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Lohnlauf-Center</h2>
          <p className="text-muted-foreground">
            Übersicht und Verwaltung aller Gehaltsabrechnungen
          </p>
        </div>
        {canManagePayroll && (
          <Button className="gap-2">
            <PlayCircle className="h-4 w-4" />
            Neuer Lohnlauf
          </Button>
        )}
      </div>

      {/* Statistik-Karten */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktuelle Periode</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMonth}/{currentYear}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentPayslips.length} Abrechnungen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Brutto</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalGrossSalary.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Aktuelle Periode
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Netto</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalNetSalary.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Auszahlungssumme
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mitarbeiter</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentPayslips.length}
            </div>
            <p className="text-xs text-muted-foreground">
              In aktueller Periode
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Aktueller Lohnlauf */}
      <Card>
        <CardHeader>
          <CardTitle>Aktueller Lohnlauf</CardTitle>
          <CardDescription>
            Status und Fortschritt der laufenden Gehaltsabrechnung
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentPayslips.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Kein aktiver Lohnlauf für {currentMonth}/{currentYear}
              </p>
              {canManagePayroll && (
                <Button className="mt-4">
                  Lohnlauf starten
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Lohnlauf {currentMonth}/{currentYear}</p>
                    <p className="text-sm text-muted-foreground">
                      {currentPayslips.length} Mitarbeiter verarbeitet
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {canManagePayroll && (
                    <>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                      <Button size="sm">
                        Alle genehmigen
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Status-Übersicht */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                {['draft', 'pending', 'approved', 'archived'].map(status => {
                  const count = currentPayslips.filter(p => p.status === status).length;
                  return (
                    <div key={status} className="text-center">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-muted-foreground">
                        {getStatusBadge(status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vergangene Lohnläufe */}
      <Card>
        <CardHeader>
          <CardTitle>Vergangene Lohnläufe</CardTitle>
          <CardDescription>
            Historie der abgeschlossenen Gehaltsabrechnungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => {
              const month = currentMonth - i - 1 || 12;
              const year = currentMonth - i - 1 > 0 ? currentYear : currentYear - 1;
              const periodPayslips = payslips?.filter(
                p => p.month === month && p.year === year
              ) || [];

              if (periodPayslips.length === 0) return null;

              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Lohnlauf {month}/{year}</p>
                      <p className="text-sm text-muted-foreground">
                        {periodPayslips.length} Mitarbeiter
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {periodPayslips
                          .reduce((sum, p) => sum + p.gross_salary, 0)
                          .toLocaleString('de-DE', {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                      </p>
                      <p className="text-sm text-muted-foreground">Brutto</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RunCenter;
