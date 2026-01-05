import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rewardsService } from '@/services/rewardsService';
import { useToast } from '@/hooks/use-toast';
import type { 
  RewardCampaign, 
  RewardInstance, 
  RewardTemplate,
  CreateRewardCampaignRequest,
  PeerReward
} from '@/types/rewards';

// Kampagnen Hooks
export const useRewardCampaigns = (filters?: { status?: string; trigger_type?: string }) => {
  return useQuery({
    queryKey: ['reward-campaigns', filters],
    queryFn: () => rewardsService.getCampaigns(filters),
  });
};

export const useRewardCampaign = (id: string) => {
  return useQuery({
    queryKey: ['reward-campaign', id],
    queryFn: () => rewardsService.getCampaignById(id),
    enabled: !!id,
  });
};

export const useCreateRewardCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (campaign: CreateRewardCampaignRequest) => 
      rewardsService.createCampaign(campaign),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-campaigns'] });
      toast({
        title: "Kampagne erstellt",
        description: "Die Belohnungskampagne wurde erfolgreich erstellt.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Die Kampagne konnte nicht erstellt werden.",
        variant: "destructive",
      });
      console.error('Error creating campaign:', error);
    },
  });
};

export const useUpdateRewardCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<RewardCampaign> }) =>
      rewardsService.updateCampaign(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-campaigns'] });
      toast({
        title: "Kampagne aktualisiert",
        description: "Die Änderungen wurden erfolgreich gespeichert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Kampagne konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteRewardCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => rewardsService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-campaigns'] });
      toast({
        title: "Kampagne gelöscht",
        description: "Die Kampagne wurde erfolgreich entfernt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Kampagne konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });
};

// Belohnungs-Instanzen Hooks
export const useRewardInstances = (filters?: { 
  employee_id?: string; 
  campaign_id?: string; 
  status?: string; 
}) => {
  return useQuery({
    queryKey: ['reward-instances', filters],
    queryFn: () => rewardsService.getRewardInstances(filters),
  });
};

export const useApproveReward = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => rewardsService.approveReward(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-instances'] });
      toast({
        title: "Belohnung genehmigt",
        description: "Die Belohnung wurde erfolgreich genehmigt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Belohnung konnte nicht genehmigt werden.",
        variant: "destructive",
      });
    },
  });
};

export const useRedeemReward = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, voucher_code }: { id: string; voucher_code?: string }) =>
      rewardsService.redeemReward(id, voucher_code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-instances'] });
      toast({
        title: "Belohnung eingelöst",
        description: "Ihre Belohnung wurde erfolgreich eingelöst.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Belohnung konnte nicht eingelöst werden.",
        variant: "destructive",
      });
    },
  });
};

// Templates Hooks
export const useRewardTemplates = (category?: string) => {
  return useQuery({
    queryKey: ['reward-templates', category],
    queryFn: () => rewardsService.getTemplates(category),
  });
};

export const useCreateCampaignFromTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ templateId, overrides }: { 
      templateId: string; 
      overrides: Partial<CreateRewardCampaignRequest> 
    }) => rewardsService.createCampaignFromTemplate(templateId, overrides),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['reward-templates'] });
      toast({
        title: "Kampagne aus Vorlage erstellt",
        description: "Die Kampagne wurde erfolgreich aus der Vorlage erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Kampagne konnte nicht aus der Vorlage erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

// Peer Rewards Hooks
export const usePeerRewards = (userId?: string) => {
  return useQuery({
    queryKey: ['peer-rewards', userId],
    queryFn: () => rewardsService.getPeerRewards(userId),
  });
};

export const useCreatePeerReward = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (peerReward: Omit<PeerReward, 'id' | 'created_at'>) =>
      rewardsService.createPeerReward(peerReward),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peer-rewards'] });
      toast({
        title: "Kollegen-Belohnung erstellt",
        description: "Die Nominierung wurde erfolgreich eingereicht.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Nominierung konnte nicht eingereicht werden.",
        variant: "destructive",
      });
    },
  });
};

// Statistiken und Forecast Hooks
export const useRewardStats = () => {
  return useQuery({
    queryKey: ['reward-stats'],
    queryFn: () => rewardsService.getRewardStats(),
    refetchInterval: 5 * 60 * 1000, // Alle 5 Minuten
  });
};

export const useRewardForecast = (period: string = 'next_quarter') => {
  return useQuery({
    queryKey: ['reward-forecast', period],
    queryFn: () => rewardsService.getRewardForecast(period),
    refetchInterval: 10 * 60 * 1000, // Alle 10 Minuten
  });
};

// Benutzer-spezifische Hooks
export const useUserRewards = () => {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await import('@/integrations/supabase/client').then(m => m.supabase.auth.getUser());
      return user;
    }
  });

  return useRewardInstances({ 
    employee_id: user?.id 
  });
};

export const useUserRewardProgress = () => {
  const { data: campaigns } = useRewardCampaigns({ status: 'active' });
  const { data: userRewards } = useUserRewards();

  const progress = campaigns?.map(campaign => {
    const userRewardsForCampaign = userRewards?.filter(r => r.campaign_id === campaign.id) || [];
    const eligibleForReward = true; // Hier würde echte Logik stehen
    
    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      progressPercentage: eligibleForReward ? 100 : 50, // Vereinfacht
      canRedeem: eligibleForReward && userRewardsForCampaign.length === 0,
      description: campaign.description,
      goodieType: campaign.goodie_type,
      goodieValue: campaign.goodie_value
    };
  }) || [];

  return { data: progress };
};