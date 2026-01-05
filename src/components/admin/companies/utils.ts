
import { CompanyData } from "./types";

export const getSubscriptionBadgeVariant = (status: string | null) => {
  switch (status) {
    case 'premium':
      return 'default';
    case 'enterprise':
      return 'secondary';
    case 'basic':
      return 'outline';
    case 'free':
      return 'secondary';
    default:
      return 'secondary';
  }
};
