import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Milestone {
  id: string;
  title: string;
  projectName: string;
  dueDate: Date;
}

interface UpcomingMilestonesProps {
  milestones: Milestone[];
}

const UpcomingMilestones = ({ milestones }: UpcomingMilestonesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Kommende Meilensteine (nächste 30 Tage)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Keine Meilensteine in den nächsten 30 Tagen
          </p>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{milestone.title}</p>
                  <p className="text-sm text-muted-foreground">{milestone.projectName}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(milestone.dueDate, 'd. MMM yyyy', { locale: de })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingMilestones;
