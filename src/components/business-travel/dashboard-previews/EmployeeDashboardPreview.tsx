import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Euro, Clock, Plane, Upload, Plus, 
  FileText, ChevronRight, Receipt, AlertCircle
} from 'lucide-react';
import { DashboardStats } from '@/hooks/useTravelDashboardStats';
import { formatCurrency } from '@/lib/utils';

interface EmployeeDashboardPreviewProps {
  stats: DashboardStats;
  myRequests: any[];
  myExpenses: any[];
}

export function EmployeeDashboardPreview({ 
  stats, 
  myRequests, 
  myExpenses 
}: EmployeeDashboardPreviewProps) {
  const budgetUsedPercent = stats.myBudget > 0 
    ? Math.round((stats.myUsedBudget / stats.myBudget) * 100) 
    : 0;
  const budgetRemaining = stats.myBudget - stats.myUsedBudget;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Genehmigt</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">In Prüfung</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Eingereicht</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Abgelehnt</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const EXPENSE_ICONS: Record<string, string> = {
    taxi: '🚕',
    restaurant: '🍽️',
    hotel: '🏨',
    train: '🚄',
    flight: '✈️',
    other: '📄'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Mein Travel Dashboard</h3>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Reisen und Spesen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Neue Geschäftsreise
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Beleg hochladen
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <Euro className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(stats.myBudget)}</p>
            <p className="text-sm text-muted-foreground">Mein Budget</p>
            <div className="mt-2">
              <Progress value={budgetUsedPercent} className="h-1.5" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Genutzt: {formatCurrency(stats.myUsedBudget)}</span>
                <span>Verfügbar: {formatCurrency(budgetRemaining)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.myOpenRequests}</p>
            <p className="text-sm text-muted-foreground">Offene Anträge</p>
            <p className="text-xs text-muted-foreground">Warten auf Genehmigung</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plane className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.myTripsThisYear}</p>
            <p className="text-sm text-muted-foreground">Meine Reisen</p>
            <p className="text-xs text-muted-foreground">Dieses Jahr</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.myPendingReceipts}</p>
            <p className="text-sm text-muted-foreground">Belege</p>
            <p className="text-xs text-orange-600">Noch hochzuladen</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* My Requests */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Meine Anträge
              </CardTitle>
              <Badge variant="secondary">{myRequests.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {myRequests.length > 0 ? (
              <div className="space-y-3">
                {myRequests.slice(0, 4).map((request) => {
                  const approval = request.travel_approvals?.[0];
                  const status = approval?.status || 'submitted';
                  
                  return (
                    <div key={request.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{request.title || request.destination}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.start_date).toLocaleDateString('de-DE')} - {new Date(request.end_date).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      {getStatusBadge(status)}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Keine Anträge vorhanden
              </p>
            )}
            <Button variant="ghost" className="w-full mt-3 text-sm" size="sm">
              Alle Anträge anzeigen <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* My Expenses */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Aktuelle Ausgaben
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 gap-1">
                <Plus className="h-3 w-3" />
                Hinzufügen
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {myExpenses.length > 0 ? (
              <div className="space-y-2">
                {myExpenses.slice(0, 4).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {EXPENSE_ICONS[expense.category?.toLowerCase()] || EXPENSE_ICONS.other}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{expense.description || expense.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatCurrency(expense.amount)}</p>
                      {!expense.receipt_url && (
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Beleg fehlt
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Keine Ausgaben vorhanden
              </p>
            )}
            <Button variant="ghost" className="w-full mt-3 text-sm" size="sm">
              Alle Ausgaben anzeigen <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
