import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, AlertCircle, Lightbulb, Rocket, Target, Zap } from 'lucide-react';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending' | 'failed';
  icon: React.ComponentType<any>;
  estimatedTime?: string;
}

interface IdeaWorkflowTrackerProps {
  currentStatus: string;
  ideaId?: string;
}

export const IdeaWorkflowTracker = ({ currentStatus, ideaId }: IdeaWorkflowTrackerProps) => {
  const getWorkflowSteps = (status: string): WorkflowStep[] => {
    const steps: WorkflowStep[] = [
      {
        id: 'new',
        title: 'Idee eingereicht',
        description: 'Ihre Idee wurde erfolgreich eingereicht und wartet auf KI-Analyse',
        status: 'completed',
        icon: Lightbulb,
        estimatedTime: '0 Min'
      },
      {
        id: 'under_review',
        title: 'KI-Analyse & Bewertung',
        description: 'KI analysiert Potenzial, Machbarkeit und Ähnlichkeiten',
        status: status === 'new' ? 'active' : (getStatusOrder(status) > 1 ? 'completed' : 'pending'),
        icon: Zap,
        estimatedTime: '2-5 Min'
      },
      {
        id: 'approved',
        title: 'Expertenprüfung',
        description: 'Fachexperten bewerten die Idee und KI-Empfehlungen',
        status: status === 'under_review' ? 'active' : (getStatusOrder(status) > 2 ? 'completed' : 'pending'),
        icon: AlertCircle,
        estimatedTime: '1-3 Tage'
      },
      {
        id: 'in_development',
        title: 'Entwicklung/Pilotphase',
        description: 'Umsetzung der Idee in einem Pilotprojekt',
        status: status === 'approved' ? 'active' : (getStatusOrder(status) > 3 ? 'completed' : 'pending'),
        icon: Rocket,
        estimatedTime: '2-8 Wochen'
      },
      {
        id: 'implemented',
        title: 'Vollständige Umsetzung',
        description: 'Idee wurde erfolgreich implementiert und ist produktiv',
        status: status === 'in_development' ? 'active' : (getStatusOrder(status) > 4 ? 'completed' : 'pending'),
        icon: Target,
        estimatedTime: '4-12 Wochen'
      }
    ];

    // Handle rejected status
    if (status === 'rejected') {
      const rejectedStepIndex = steps.findIndex(step => step.id === 'approved');
      if (rejectedStepIndex > -1) {
        steps[rejectedStepIndex].status = 'failed';
      }
    }

    return steps;
  };

  const getStatusOrder = (status: string): number => {
    const statusOrder: Record<string, number> = {
      'new': 1,
      'under_review': 2,
      'approved': 3,
      'in_development': 4,
      'implemented': 5,
      'rejected': 2.5
    };
    return statusOrder[status] || 0;
  };

  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'active':
        return <Clock className="h-6 w-6 text-blue-600" />;
      case 'failed':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return <div className="h-6 w-6 rounded-full border-2 border-gray-300 bg-gray-100" />;
    }
  };

  const getStatusBadge = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Abgeschlossen</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Aktiv</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fehlgeschlagen</Badge>;
      default:
        return <Badge variant="outline">Ausstehend</Badge>;
    }
  };

  const steps = getWorkflowSteps(currentStatus);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Ideen-Workflow Status</h3>
            <p className="text-sm text-muted-foreground">
              Verfolgen Sie den Fortschritt Ihrer Idee durch den Innovationsprozess
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isLast = index === steps.length - 1;

              return (
                <div key={step.id} className="relative">
                  <div className="flex items-start space-x-4">
                    <div className="flex flex-col items-center">
                      <div className="relative z-10 bg-white">
                        {getStatusIcon(step.status)}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-12 mt-2 ${
                          step.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pb-8">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <StepIcon className="h-5 w-5 text-primary" />
                          <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(step.status)}
                          {step.estimatedTime && (
                            <span className="text-xs text-muted-foreground">
                              {step.estimatedTime}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      
                      {step.status === 'active' && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Aktueller Schritt</span>
                          </div>
                          <p className="text-xs text-blue-700 mt-1">
                            {step.id === 'under_review' && 'KI-Analyse läuft automatisch im Hintergrund...'}
                            {step.id === 'approved' && 'Warten auf Expertenprüfung...'}
                            {step.id === 'in_development' && 'Pilotprojekt in Entwicklung...'}
                            {step.id === 'implemented' && 'Finale Umsetzung...'}
                          </p>
                        </div>
                      )}

                      {step.status === 'failed' && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">Nicht genehmigt</span>
                          </div>
                          <p className="text-xs text-red-700 mt-1">
                            Die Idee wurde nach der Expertenprüfung abgelehnt. Sie können eine überarbeitete Version einreichen.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Steps */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Nächste Schritte</h4>
            <div className="text-sm text-gray-600">
              {currentStatus === 'new' && (
                <p>✅ Ihre Idee wird automatisch von der KI analysiert. Sie erhalten eine Benachrichtigung, sobald die Analyse abgeschlossen ist.</p>
              )}
              {currentStatus === 'under_review' && (
                <p>⏳ Die KI-Analyse ist abgeschlossen. Experten prüfen nun die Machbarkeit und den Geschäftswert Ihrer Idee.</p>
              )}
              {currentStatus === 'approved' && (
                <p>🎉 Glückwunsch! Ihre Idee wurde genehmigt und geht in die Entwicklung. Ein Pilotprojekt wird erstellt.</p>
              )}
              {currentStatus === 'in_development' && (
                <p>🚀 Ihr Pilotprojekt läuft! Sie können den Fortschritt im Pilotprojekte-Tab verfolgen.</p>
              )}
              {currentStatus === 'implemented' && (
                <p>🎯 Herzlichen Glückwunsch! Ihre Idee wurde erfolgreich umgesetzt und ist nun produktiv im Einsatz.</p>
              )}
              {currentStatus === 'rejected' && (
                <p>📝 Ihre Idee wurde abgelehnt, aber Sie können das Feedback nutzen, um eine verbesserte Version einzureichen.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};