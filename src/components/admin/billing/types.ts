
export type BillingStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

export type BillingRecord = {
  id: string;
  company_name: string;
  invoice_number: string;
  amount: number;
  date: string;
  status: BillingStatus;
};
