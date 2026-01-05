import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Gift, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Users,
  Award
} from "lucide-react";
import { useRewardInstances, useRewardCampaigns, useUserRewardProgress } from '@/hooks/useRewards';

export const RewardsOverview = () => {
  const { data: recentRewards } = useRewardInstances();
  const { data: activeCampaigns } = useRewardCampaigns({ status: 'active' });
  const { data: userProgress } = useUserRewardProgress();

  const getGoodieTypeIcon = (type: string) => {
    switch (type) {
      case 'amazon_voucher':
      case 'zalando_voucher':
        return <Gift className="h-4 w-4" />;
      case 'extra_vacation_day':
      case 'half_day_off':
        return <Clock className="h-4 w-4" />;
      case 'cash_bonus':
        return <Award className="h-4 w-4" />;
      default:
        return <Gift className="h-4 w-4" />;
    }
  };

  const getGoodieTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'amazon_voucher': 'Amazon Gutschein',
      'zalando_voucher': 'Zalando Gutschein',
      'extra_vacation_day': 'Extra Urlaubstag',
      'half_day_off': 'Halber freier Tag',
      'meal_voucher': 'Essensgutschein',
      'cash_bonus': 'Geldbonus',
      'donation_option': 'Spendenaktion',
      'physical_goodie': 'Physisches Goodie',
      'custom': 'Individuell'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Genehmigt
          </Badge>
        );
      case 'redeemed':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Eingelöst
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Ausstehend
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Abgelaufen
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Aktive Kampagnen */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Aktive Kampagnen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeCampaigns?.slice(0, 5).map((campaign) => (
              <div 
                key={campaign.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getGoodieTypeIcon(campaign.goodie_type)}
                  <div>
                    <h3 className="font-medium">{campaign.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getGoodieTypeLabel(campaign.goodie_type)} • €{campaign.goodie_value}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {campaign.current_participants} / {campaign.max_participants || '∞'}
                  </div>
                  <div className="text-xs text-muted-foreground">Teilnehmer</div>
                </div>
              </div>
            ))}
            
            {!activeCampaigns?.length && (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Keine aktiven Kampagnen</p>
                <p className="text-sm text-muted-foreground">
                  Erstellen Sie Ihre erste Belohnungskampagne
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mein Fortschritt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mein Fortschritt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userProgress?.slice(0, 3).map((progress) => (
              <div key={progress.campaignId} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">{progress.campaignName}</h4>
                  <span className="text-xs text-muted-foreground">
                    {progress.progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress.progressPercentage}%` }}
                  />
                </div>
                {progress.canRedeem && (
                  <Button size="sm" className="w-full">
                    Belohnung einlösen
                  </Button>
                )}
              </div>
            ))}
            
            {!userProgress?.length && (
              <div className="text-center py-4">
                <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Keine verfügbaren Belohnungen
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Letzte Belohnungen */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Letzte Belohnungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRewards?.slice(0, 8).map((reward) => (
              <div 
                key={reward.id} 
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getGoodieTypeIcon(reward.goodie_type)}
                  <div>
                    <h3 className="font-medium">
                      {reward.employee_name || 'Unbekannter Mitarbeiter'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getGoodieTypeLabel(reward.goodie_type)} • €{reward.goodie_value}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(reward.status)}
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {new Date(reward.created_at).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {!recentRewards?.length && (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Keine Belohnungen vorhanden</p>
                <p className="text-sm text-muted-foreground">
                  Belohnungen werden hier angezeigt, sobald sie verteilt werden
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};