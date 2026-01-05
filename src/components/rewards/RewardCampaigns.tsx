import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Gift,
  Users,
  Calendar,
  Euro
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRewardCampaigns, useUpdateRewardCampaign, useDeleteRewardCampaign } from '@/hooks/useRewards';
import type { RewardCampaign } from '@/types/rewards';

export const RewardCampaigns = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<RewardCampaign | null>(null);
  const { data: campaigns, isLoading } = useRewardCampaigns();
  const updateCampaign = useUpdateRewardCampaign();
  const deleteCampaign = useDeleteRewardCampaign();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Entwurf', className: 'bg-gray-100 text-gray-800' },
      active: { label: 'Aktiv', className: 'bg-green-100 text-green-800' },
      paused: { label: 'Pausiert', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Abgeschlossen', className: 'bg-blue-100 text-blue-800' },
      cancelled: { label: 'Abgebrochen', className: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getTriggerTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'project_completion': 'Projektabschluss',
      'goal_achievement': 'Zielerreichung',
      'performance_score': 'Performance',
      'anniversary': 'Jubiläum',
      'birthday': 'Geburtstag',
      'innovation_idea': 'Innovation',
      'peer_nomination': 'Peer-Nominierung',
      'custom_event': 'Benutzerdefiniert'
    };
    return labels[type] || type;
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

  const handleStatusChange = (campaign: RewardCampaign, newStatus: string) => {
    updateCampaign.mutate({
      id: campaign.id,
      updates: { status: newStatus as any }
    });
  };

  const handleDelete = (campaign: RewardCampaign) => {
    if (window.confirm(`Sind Sie sicher, dass Sie die Kampagne "${campaign.name}" löschen möchten?`)) {
      deleteCampaign.mutate(campaign.id);
    }
  };

  const getBudgetUtilization = (campaign: RewardCampaign) => {
    if (!campaign.max_budget) return 0;
    return (campaign.used_budget / campaign.max_budget) * 100;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns?.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  {getStatusBadge(campaign.status)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedCampaign(campaign)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </DropdownMenuItem>
                    {campaign.status === 'active' ? (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(campaign, 'paused')}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pausieren
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(campaign, 'active')}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Aktivieren
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => handleDelete(campaign)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {campaign.description || 'Keine Beschreibung verfügbar'}
              </p>
              
              {/* Trigger & Belohnung */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-muted-foreground">Trigger:</span>
                  <span className="font-medium">
                    {getTriggerTypeLabel(campaign.trigger_type)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Gift className="h-4 w-4 text-gray-500" />
                  <span className="text-muted-foreground">Belohnung:</span>
                  <span className="font-medium">
                    {getGoodieTypeLabel(campaign.goodie_type)}
                  </span>
                </div>
              </div>

              {/* Statistiken */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    Teilnehmer
                  </div>
                  <div className="text-sm font-medium">
                    {campaign.current_participants} / {campaign.max_participants || '∞'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Euro className="h-3 w-3" />
                    Budget
                  </div>
                  <div className="text-sm font-medium">
                    €{campaign.used_budget.toLocaleString()} / €{campaign.max_budget?.toLocaleString() || '∞'}
                  </div>
                </div>
              </div>

              {/* Budget-Fortschritt */}
              {campaign.max_budget && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Budget-Nutzung</span>
                    <span className="font-medium">{getBudgetUtilization(campaign).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        getBudgetUtilization(campaign) > 80 
                          ? 'bg-red-500' 
                          : getBudgetUtilization(campaign) > 60 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(getBudgetUtilization(campaign), 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Laufzeit */}
              {campaign.start_date && (
                <div className="text-xs text-muted-foreground">
                  <span>Laufzeit: </span>
                  {new Date(campaign.start_date).toLocaleDateString('de-DE')}
                  {campaign.end_date && (
                    <span> - {new Date(campaign.end_date).toLocaleDateString('de-DE')}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!campaigns?.length && (
        <Card>
          <CardContent className="text-center py-12">
            <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Kampagnen vorhanden</h3>
            <p className="text-muted-foreground mb-4">
              Erstellen Sie Ihre erste Belohnungskampagne, um Ihr Team zu motivieren.
            </p>
            <Button>Kampagne erstellen</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};