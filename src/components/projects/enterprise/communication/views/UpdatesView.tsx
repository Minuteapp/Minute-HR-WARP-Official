import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UpdateCard from './UpdateCard';

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

interface UpdatesViewProps {
  updates: UpdateItem[];
}

const UpdatesView = ({ updates }: UpdatesViewProps) => {
  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Projekt-Updates</CardTitle>
      </CardHeader>
      <CardContent>
        {updates.length > 0 ? (
          <div className="space-y-4">
            {updates.map((update) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Keine Updates vorhanden
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpdatesView;
