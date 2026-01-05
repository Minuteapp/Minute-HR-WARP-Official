export type KudosCategory = 
  | 'expertise'
  | 'helpfulness'
  | 'teamwork'
  | 'innovation'
  | 'leadership'
  | 'dedication';

export interface PeerKudos {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_name?: string;
  receiver_name?: string;
  sender_avatar?: string;
  receiver_avatar?: string;
  category: KudosCategory;
  message: string;
  kudos_amount: number;
  likes_count: number;
  company_id?: string;
  created_at: string;
}

export interface KudosStatistics {
  totalKudos: number;
  thisMonth: number;
  lastMonth: number;
  monthlyChange: number;
  participationRate: number;
  avgPerPerson: number;
  topGivers: Array<{
    id: string;
    name: string;
    avatar?: string;
    count: number;
  }>;
  topReceivers: Array<{
    id: string;
    name: string;
    avatar?: string;
    count: number;
  }>;
  categoryStats: Array<{
    category: KudosCategory;
    count: number;
    percentage: number;
  }>;
}

export const KUDOS_CATEGORY_LABELS: Record<KudosCategory, string> = {
  expertise: 'Expertise',
  helpfulness: 'Hilfsbereitschaft',
  teamwork: 'Teamwork',
  innovation: 'Innovation',
  leadership: 'Führung',
  dedication: 'Engagement'
};

export const KUDOS_CATEGORY_COLORS: Record<KudosCategory, string> = {
  expertise: '#8b5cf6',
  helpfulness: '#10b981',
  teamwork: '#3b82f6',
  innovation: '#f59e0b',
  leadership: '#ec4899',
  dedication: '#06b6d4'
};
