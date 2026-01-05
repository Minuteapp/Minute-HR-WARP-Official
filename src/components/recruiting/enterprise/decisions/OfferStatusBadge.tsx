import { Badge } from '@/components/ui/badge';

interface OfferStatusBadgeProps {
  status: string;
}

const OfferStatusBadge = ({ status }: OfferStatusBadgeProps) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'accepted':
        return 'bg-black text-white hover:bg-black';
      case 'sent':
        return 'bg-gray-100 text-gray-700 border border-gray-300';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'accepted':
        return 'Angenommen';
      case 'sent':
        return 'Versendet';
      case 'rejected':
        return 'Abgelehnt';
      case 'draft':
      default:
        return 'Entwurf';
    }
  };

  return (
    <Badge className={getStatusStyle()}>
      {getStatusLabel()}
    </Badge>
  );
};

export default OfferStatusBadge;
