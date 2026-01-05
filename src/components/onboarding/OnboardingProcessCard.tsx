
import { CalendarDays, CheckCircle, User, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useOnboardingProcess } from '@/hooks/useOnboardingProcess';

interface OnboardingProcessCardProps {
  process: any;
}

const OnboardingProcessCard = ({ process }: OnboardingProcessCardProps) => {
  const navigate = useNavigate();
  const { checklistItems } = useOnboardingProcess(process.id);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'not_started': return 'bg-gray-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'not_started': return 'Nicht gestartet';
      case 'in_progress': return 'In Bearbeitung';
      case 'completed': return 'Abgeschlossen';
      default: return status;
    }
  };

  const progress = checklistItems?.length 
    ? (checklistItems.filter(item => item.status === 'completed').length / checklistItems.length) * 100
    : 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nicht festgelegt';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <Card className="overflow-hidden">
      <div className={`h-2 ${getStatusColor(process.status)}`} />
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">
              {process.employee?.name || `${process.employee?.first_name || ''} ${process.employee?.last_name || ''}`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {process.employee?.position || 'Keine Position'}
            </p>
          </div>
          <Badge variant={process.status === 'completed' ? 'default' : process.status === 'in_progress' ? 'default' : 'secondary'}>
            {getStatusText(process.status)}
          </Badge>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">Abteilung:</span>
            <span className="ml-2">{process.employee?.department || 'Nicht zugewiesen'}</span>
          </div>
          <div className="flex items-center text-sm">
            <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">Startdatum:</span>
            <span className="ml-2">{formatDate(process.start_date)}</span>
          </div>
          {process.mentor && (
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">Mentor:</span>
              <span className="ml-2">{process.mentor.name}</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Fortschritt</span>
            </div>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-3">
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={() => navigate(`/onboarding/process/${process.id}`)}
        >
          Details anzeigen
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OnboardingProcessCard;
