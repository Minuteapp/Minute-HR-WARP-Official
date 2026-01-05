import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Clock, 
  Loader, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Send, 
  Download,
  AlertTriangle,
  Building2,
  Mail,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { useRewardPayouts } from '@/hooks/useRewardPayouts';
import { 
  PayoutStatus, 
  payoutStatusLabels, 
  payoutStatusColors,
  rewardTypeLabels,
  rewardTypeColors,
  payoutMethodLabels,
  RewardType
} from '@/types/reward-payouts';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const DistributionTab: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'all'>('all');
  const { 
    payouts, 
    payoutsLoading, 
    statistics, 
    distributionMethods,
    updateStatus,
    retryPayout,
    toggleMethod
  } = useRewardPayouts(statusFilter);

  const kpiCards = [
    {
      title: 'Ausstehend',
      value: statistics.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'In Bearbeitung',
      value: statistics.inProgress,
      icon: Loader,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Zugestellt',
      value: statistics.delivered,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Fehlgeschlagen',
      value: statistics.failed,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const methodIcons: Record<string, React.ReactNode> = {
    bank_transfer: <CreditCard className="h-6 w-6" />,
    email: <Mail className="h-6 w-6" />,
    hr_system: <Building2 className="h-6 w-6" />,
  };

  const handleMarkDelivered = (id: string) => {
    updateStatus({ 
      id, 
      status: 'delivered', 
      deliveredAt: new Date().toISOString().split('T')[0] 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ausgabe & Abwicklung</h2>
          <p className="text-muted-foreground">Verwalten Sie die Belohnungsauszahlungen und Verteilungsmethoden</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Failed Payouts Alert */}
      {statistics.failed > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Fehlgeschlagene Auszahlungen</AlertTitle>
          <AlertDescription>
            {statistics.failed} Auszahlung(en) konnten nicht verarbeitet werden. 
            Bitte überprüfen Sie die Details und versuchen Sie es erneut.
          </AlertDescription>
        </Alert>
      )}

      {/* Status Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as PayoutStatus | 'all')}>
        <TabsList>
          <TabsTrigger value="all">Alle ({statistics.total})</TabsTrigger>
          <TabsTrigger value="pending">Ausstehend ({statistics.pending})</TabsTrigger>
          <TabsTrigger value="in_progress">In Bearbeitung ({statistics.inProgress})</TabsTrigger>
          <TabsTrigger value="delivered">Zugestellt ({statistics.delivered})</TabsTrigger>
          <TabsTrigger value="failed">Fehlgeschlagen ({statistics.failed})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Belohnungsauszahlungen</CardTitle>
        </CardHeader>
        <CardContent>
          {payoutsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine Auszahlungen vorhanden
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Mitarbeiter</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Belohnung</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Typ</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Methode</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Angefordert</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Zugestellt</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={payout.employee_avatar} />
                            <AvatarFallback>
                              {payout.employee_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{payout.employee_name || 'Unbekannt'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{payout.reward_name}</p>
                          {payout.reward_value && (
                            <p className="text-sm text-muted-foreground">
                              €{payout.reward_value.toLocaleString('de-DE')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {payout.reward_type && (
                          <Badge className={rewardTypeColors[payout.reward_type as RewardType]}>
                            {rewardTypeLabels[payout.reward_type as RewardType]}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {payout.payout_method && payoutMethodLabels[payout.payout_method]}
                      </td>
                      <td className="py-3 px-2">
                        {format(new Date(payout.requested_at), 'dd.MM.yyyy', { locale: de })}
                      </td>
                      <td className="py-3 px-2">
                        {payout.delivered_at 
                          ? format(new Date(payout.delivered_at), 'dd.MM.yyyy', { locale: de })
                          : '-'
                        }
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={payoutStatusColors[payout.status]}>
                          {payoutStatusLabels[payout.status]}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {payout.status === 'pending' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleMarkDelivered(payout.id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {payout.status === 'failed' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => retryPayout(payout.id)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribution Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Verfügbare Verteilungsmethoden</CardTitle>
        </CardHeader>
        <CardContent>
          {distributionMethods.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Default Methods */}
              {[
                { name: 'Banküberweisung', type: 'bank_transfer', desc: 'Direkte Überweisung auf das Gehaltskonto' },
                { name: 'E-Mail Versand', type: 'email', desc: 'Gutschein-Codes per E-Mail' },
                { name: 'HR-System Integration', type: 'hr_system', desc: 'Automatische Übertragung ins HR-System' },
              ].map((method) => (
                <Card key={method.type} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {methodIcons[method.type]}
                        </div>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.desc}</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {distributionMethods.map((method) => (
                <Card key={method.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {methodIcons[method.method_type] || <CreditCard className="h-6 w-6" />}
                        </div>
                        <div>
                          <p className="font-medium">{method.method_name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={method.is_active}
                        onCheckedChange={(checked) => toggleMethod({ id: method.id, isActive: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DistributionTab;
