export type PayoutStatus = 'pending' | 'in_progress' | 'delivered' | 'failed';
export type PayoutMethod = 'bank_transfer' | 'email' | 'hr_system' | 'eventbrite' | 'manual';
export type RewardType = 'bank_transfer' | 'voucher' | 'non_financial' | 'experience';

export interface RewardPayout {
  id: string;
  employee_id?: string;
  employee_name?: string;
  employee_avatar?: string;
  reward_name: string;
  reward_value?: number;
  reward_type?: RewardType;
  payout_method?: PayoutMethod;
  requested_at: string;
  delivered_at?: string;
  status: PayoutStatus;
  error_message?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PayoutStatistics {
  pending: number;
  inProgress: number;
  delivered: number;
  failed: number;
  total: number;
}

export interface DistributionMethod {
  id: string;
  method_name: string;
  method_type: string;
  description?: string;
  is_active: boolean;
  company_id?: string;
  created_at: string;
}

export const payoutStatusLabels: Record<PayoutStatus, string> = {
  pending: 'Ausstehend',
  in_progress: 'In Bearbeitung',
  delivered: 'Zugestellt',
  failed: 'Fehlgeschlagen',
};

export const payoutStatusColors: Record<PayoutStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export const rewardTypeLabels: Record<RewardType, string> = {
  bank_transfer: 'Banküberweisung',
  voucher: 'Gutschein',
  non_financial: 'Nicht-finanziell',
  experience: 'Erlebnis',
};

export const rewardTypeColors: Record<RewardType, string> = {
  bank_transfer: 'bg-emerald-100 text-emerald-800',
  voucher: 'bg-purple-100 text-purple-800',
  non_financial: 'bg-orange-100 text-orange-800',
  experience: 'bg-pink-100 text-pink-800',
};

export const payoutMethodLabels: Record<PayoutMethod, string> = {
  bank_transfer: 'Banküberweisung',
  email: 'E-Mail Versand',
  hr_system: 'HR-System',
  eventbrite: 'Eventbrite',
  manual: 'Manuell',
};
