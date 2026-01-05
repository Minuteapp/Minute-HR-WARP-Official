import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface UpdateItem {
  id: string;
  title: string;
  type: 'status' | 'decision' | 'risk';
  author: string;
  authorInitials: string;
  date: Date;
  description: string;
  projectName: string;
}

interface UpdateCardProps {
  update: UpdateItem;
}

const UpdateCard = ({ update }: UpdateCardProps) => {
  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      'status': 'bg-blue-100 text-blue-600',
      'decision': 'bg-purple-100 text-purple-600',
      'risk': 'bg-red-100 text-red-600',
    };
    const labels: Record<string, string> = {
      'status': 'Status',
      'decision': 'Entscheidung',
      'risk': 'Risiko',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gray-100 text-gray-700 text-sm">
              {update.authorInitials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{update.title}</h4>
                {getTypeBadge(update.type)}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              {update.author} • {format(update.date, 'dd.MM.yyyy', { locale: de })}
            </p>
            
            <p className="text-sm mb-3">{update.description}</p>
            
            <span className="px-2 py-0.5 text-xs bg-gray-100 border border-gray-200 rounded text-gray-700">
              {update.projectName}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpdateCard;
