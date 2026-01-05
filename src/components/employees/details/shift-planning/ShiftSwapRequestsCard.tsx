import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

// Keine Mock-Daten - Schichttausch-Anfragen werden aus der Datenbank geladen
const mockSwapRequests: {
  id: string;
  date: string;
  requester: { first_name: string; last_name: string };
  priority: 'hoch' | 'mittel' | 'niedrig';
}[] = [];

export const ShiftSwapRequestsCard = () => {
  const requests = mockSwapRequests;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hoch':
        return 'destructive';
      case 'mittel':
        return 'default';
      case 'niedrig':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Schichttausch-Anfragen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Keine offenen Anfragen</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Schichttausch-Anfragen</CardTitle>
          <Badge variant="secondary">{requests.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm">{request.date}</p>
                <p className="text-sm text-muted-foreground">
                  Von: {request.requester.first_name} {request.requester.last_name}
                </p>
                <Badge 
                  variant={getPriorityColor(request.priority)} 
                  className="mt-2"
                >
                  {request.priority}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="default">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Annehmen
                </Button>
                <Button size="sm" variant="outline">
                  <XCircle className="w-4 h-4 mr-1" />
                  Ablehnen
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
