import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, UserPlus, GraduationCap, FileText, Package } from "lucide-react";
import { useWorkforceExtended } from "@/hooks/useWorkforceExtended";

export const RequestsCenter = () => {
  const { requests, dashboardKPIs, createRequest, isLoading } = useWorkforceExtended();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hiring': return <UserPlus className="h-4 w-4" />;
      case 'training': return <GraduationCap className="h-4 w-4" />;
      case 'contract_change': return <FileText className="h-4 w-4" />;
      case 'certification': return <FileText className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hiring': return 'bg-blue-100 text-blue-800';
      case 'training': return 'bg-green-100 text-green-800';
      case 'contract_change': return 'bg-purple-100 text-purple-800';
      case 'certification': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const requestStats = requests?.reduce((acc, request) => {
    acc.total++;
    acc[request.status]++;
    acc[request.request_type]++;
    return acc;
  }, {
    total: 0,
    open: 0,
    in_review: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    hiring: 0,
    training: 0,
    contract_change: 0,
    certification: 0,
    equipment: 0
  } as Record<string, number>) || {};

  const avgROI = requests?.length ? 
    requests.reduce((sum, r) => sum + r.roi_estimate, 0) / requests.length : 0;

  const totalCostEstimate = requests?.reduce((sum, r) => sum + r.cost_estimate, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Requests</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardKPIs.openRequests}</div>
            <p className="text-xs text-muted-foreground">
              Benötigen Bearbeitung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Bearbeitung</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requestStats.in_review || 0}</div>
            <p className="text-xs text-muted-foreground">
              Werden geprüft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kostenschätzung</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCostEstimate.toLocaleString('de-DE')}€</div>
            <p className="text-xs text-muted-foreground">
              Alle offenen Requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø ROI</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgROI.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Erwarteter Return
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Neue Anfrage erstellen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => createRequest.mutate({
                request_type: 'hiring',
                title: 'Neue Stellenausschreibung',
                priority: 'medium',
                cost_estimate: 0,
                roi_estimate: 0,
                request_data: {}
              })}
            >
              <UserPlus className="h-6 w-6 mb-2" />
              Hiring Request
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => createRequest.mutate({
                request_type: 'training',
                title: 'Weiterbildungsantrag',
                priority: 'medium',
                cost_estimate: 0,
                roi_estimate: 0,
                request_data: {}
              })}
            >
              <GraduationCap className="h-6 w-6 mb-2" />
              Training Request
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Vertragsänderung
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Zertifizierung
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Package className="h-6 w-6 mb-2" />
              Equipment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Alle Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests?.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(request.request_type)}
                    <div className="font-medium">{request.title}</div>
                    <Badge variant="secondary" className={getTypeColor(request.request_type)}>
                      {request.request_type}
                    </Badge>
                  </div>
                  {request.description && (
                    <div className="text-sm text-muted-foreground mb-2">
                      {request.description}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Abteilung: {request.department || 'Nicht spezifiziert'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Erstellt: {new Date(request.created_at).toLocaleDateString('de-DE')}
                  </div>
                  {request.due_date && (
                    <div className="text-sm text-muted-foreground">
                      Fällig: {new Date(request.due_date).toLocaleDateString('de-DE')}
                    </div>
                  )}
                </div>
                <div className="text-right space-y-2">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                    <Badge variant="secondary" className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium">
                    {request.cost_estimate.toLocaleString('de-DE')}€
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ROI: {request.roi_estimate.toFixed(1)}%
                  </div>
                  {request.time_to_fill_days && (
                    <div className="text-sm text-muted-foreground">
                      TTF: {request.time_to_fill_days} Tage
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(!requests || requests.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine Requests gefunden</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Request Types Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Request-Statistiken nach Typ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {['hiring', 'training', 'contract_change', 'certification', 'equipment'].map((type) => (
              <div key={type} className="text-center p-4 border rounded-lg">
                <div className="flex justify-center mb-2">
                  {getTypeIcon(type)}
                </div>
                <div className="text-2xl font-bold">{requestStats[type] || 0}</div>
                <div className="text-sm text-muted-foreground capitalize">{type}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};