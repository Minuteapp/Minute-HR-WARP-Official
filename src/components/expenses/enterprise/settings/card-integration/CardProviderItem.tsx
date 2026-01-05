
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

interface CardProviderItemProps {
  id: string;
  name: string;
  connectedCards: number;
  status: 'active' | 'inactive';
  iconColor: 'purple' | 'yellow';
  onConnect: (id: string) => void;
}

const CardProviderItem = ({ 
  id, 
  name, 
  connectedCards, 
  status, 
  iconColor,
  onConnect 
}: CardProviderItemProps) => {
  const iconBgColor = iconColor === 'purple' ? 'bg-purple-100' : 'bg-yellow-100';
  const iconTextColor = iconColor === 'purple' ? 'text-purple-600' : 'text-yellow-600';

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${iconBgColor}`}>
          <CreditCard className={`h-5 w-5 ${iconTextColor}`} />
        </div>
        <div>
          <h4 className="font-medium text-foreground">{name}</h4>
          <p className="text-sm text-muted-foreground">
            {status === 'active' 
              ? `${connectedCards} Karten verbunden` 
              : 'Nicht verbunden'}
          </p>
        </div>
      </div>
      <div>
        {status === 'active' ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-green-600 border border-green-300">
            Aktiv
          </span>
        ) : (
          <Button 
            onClick={() => onConnect(id)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Verbinden
          </Button>
        )}
      </div>
    </div>
  );
};

export default CardProviderItem;
