import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Users,
  Gift,
  Euro,
  Calendar,
  Target
} from "lucide-react";
import { useRewardStats, useRewardForecast } from '@/hooks/useRewards';

export const RewardAnalytics = () => {
  const { data: stats } = useRewardStats();
  const { data: forecast } = useRewardForecast();

  const monthNames = [
    'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI der Belohnungen</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              Produktivitätssteigerung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teilnahme-Rate</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              der Mitarbeiter aktiv
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durchschn. Reaktionszeit</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              Genehmigung bis Einlösung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zufriedenheits-Score</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              Mitarbeiter-Feedback
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monatliche Belohnungen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monatliche Belohnungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.monthlyRewards?.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">
                      {monthNames[parseInt(month.month.split('-')[1]) - 1]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {month.month.split('-')[0]}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      {month.count} Belohnungen
                    </div>
                    <div className="text-sm font-medium">
                      €{month.value.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {!stats?.monthlyRewards?.length && (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Daten verfügbar
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Goodie Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Beliebteste Belohnungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.topGoodieTypes?.map((goodie, index) => (
                <div key={goodie.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Gift className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {goodie.type.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {goodie.count} vergeben
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {goodie.percentage.toFixed(1)}%
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${goodie.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {!stats?.topGoodieTypes?.length && (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Daten verfügbar
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast */}
      {forecast && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Vorhersage für {forecast.period}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Geschätzte Belohnungen</div>
                <div className="text-2xl font-bold">{forecast.estimatedRewards}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Geschätztes Budget</div>
                <div className="text-2xl font-bold">€{forecast.estimatedBudget.toLocaleString()}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Budget-Auslastung</div>
                <div className="text-2xl font-bold">{forecast.budgetUtilization.toFixed(0)}%</div>
              </div>
            </div>

            {forecast.campaignImpact?.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Kampagnen-Auswirkungen</h4>
                <div className="space-y-2">
                  {forecast.campaignImpact.map((impact) => (
                    <div key={impact.campaignId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{impact.campaignName}</div>
                        <div className="text-sm text-muted-foreground">
                          {impact.estimatedTriggers} erwartete Auslöser
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">€{impact.estimatedCost.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {forecast.riskFactors?.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3 text-orange-600">Risikofaktoren</h4>
                <div className="space-y-2">
                  {forecast.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-orange-600">
                      <div className="w-2 h-2 bg-orange-600 rounded-full" />
                      {risk}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};