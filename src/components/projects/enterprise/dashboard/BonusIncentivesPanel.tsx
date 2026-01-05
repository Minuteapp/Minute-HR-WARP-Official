import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Award, 
  DollarSign, 
  Target, 
  Clock,
  TrendingUp,
  Gift,
  Plus
} from 'lucide-react';
import { EnterpriseProject } from '@/types/project-enterprise';

interface BonusIncentivesPanelProps {
  project: EnterpriseProject;
  onUpdate?: (project: EnterpriseProject) => void;
}

export const BonusIncentivesPanel: React.FC<BonusIncentivesPanelProps> = ({
  project,
  onUpdate
}) => {
  // Dummy-Daten für Bonus Triggers
  const bonusTriggers = [
    {
      id: '1',
      trigger_type: 'completion',
      condition_data: { target_date: '2024-03-15' },
      reward_type: 'monetary',
      reward_value: 500,
      reward_description: 'Pünktlicher Projektabschluss',
      status: 'active'
    },
    {
      id: '2',
      trigger_type: 'budget_under',
      condition_data: { percentage: 10 },
      reward_type: 'time_off',
      reward_value: 1,
      reward_description: 'Ein zusätzlicher Urlaubstag',
      status: 'active'
    },
    {
      id: '3',
      trigger_type: 'quality_score',
      condition_data: { min_score: 90 },
      reward_type: 'recognition',
      reward_description: 'Team Excellence Award',
      status: 'triggered'
    },
    {
      id: '4',
      trigger_type: 'okr_achievement',
      condition_data: { achievement_rate: 100 },
      reward_type: 'promotion_points',
      reward_value: 50,
      reward_description: 'Beförderungspunkte',
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'triggered': return 'default';
      case 'active': return 'default';
      case 'paid': return 'default';
      case 'expired': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getRewardIcon = (rewardType: string) => {
    switch (rewardType) {
      case 'monetary': return <DollarSign className="h-4 w-4" />;
      case 'time_off': return <Clock className="h-4 w-4" />;
      case 'recognition': return <Award className="h-4 w-4" />;
      case 'promotion_points': return <TrendingUp className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  const getTriggerProgress = (trigger: any) => {
    switch (trigger.trigger_type) {
      case 'completion':
        const targetDate = new Date(trigger.condition_data.target_date);
        const now = new Date();
        const projectStart = new Date(project.start_date || now);
        const totalDuration = targetDate.getTime() - projectStart.getTime();
        const elapsed = now.getTime() - projectStart.getTime();
        return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      
      case 'budget_under':
        const budgetUtilization = project.actual_cost / project.budget_breakdown.reduce((acc, cat) => acc + cat.allocated_amount, 0) * 100;
        return Math.max(0, 100 - budgetUtilization);
      
      case 'quality_score':
        return project.quality_score;
      
      case 'okr_achievement':
        return project.okr_progress;
      
      default:
        return 0;
    }
  };

  const getProgressDescription = (trigger: any) => {
    const progress = getTriggerProgress(trigger);
    
    switch (trigger.trigger_type) {
      case 'completion':
        return `${progress.toFixed(1)}% der Zeit vergangen`;
      case 'budget_under':
        return `${progress.toFixed(1)}% unter Budget`;
      case 'quality_score':
        return `${progress.toFixed(1)} von ${trigger.condition_data.min_score} Punkten`;
      case 'okr_achievement':
        return `${progress.toFixed(1)}% OKR Fortschritt`;
      default:
        return '';
    }
  };

  const triggeredCount = bonusTriggers.filter(trigger => trigger.status === 'triggered').length;
  const totalValue = bonusTriggers
    .filter(trigger => trigger.status === 'triggered' && trigger.reward_type === 'monetary')
    .reduce((sum, trigger) => sum + (trigger.reward_value || 0), 0);

  return (
    <div className="space-y-6">
      {/* Bonus Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aktive Trigger</p>
                <p className="text-2xl font-bold">{bonusTriggers.filter(t => t.status === 'active').length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Erreicht</p>
                <p className="text-2xl font-bold">{triggeredCount}</p>
                <Badge variant={triggeredCount > 0 ? 'default' : 'secondary'} className="mt-1">
                  {triggeredCount > 0 ? 'Erfolgreich' : 'Ausstehend'}
                </Badge>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bonus Wert</p>
                <p className="text-2xl font-bold">{totalValue}€</p>
                <p className="text-xs text-muted-foreground">erreicht</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={getStatusColor(project.incentive_status)}>
                  {project.incentive_status}
                </Badge>
              </div>
              <Gift className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bonus Triggers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Bonus Trigger
          </CardTitle>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Neuer Trigger
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bonusTriggers.map((trigger, index) => {
              const progress = getTriggerProgress(trigger);
              const isTriggered = trigger.status === 'triggered';
              
              return (
                <div key={index} className={`p-4 border rounded-lg ${isTriggered ? 'border-green-500 bg-green-50/50' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getRewardIcon(trigger.reward_type)}
                      <div>
                        <h4 className="font-medium text-sm">{trigger.reward_description}</h4>
                        <p className="text-xs text-muted-foreground capitalize">
                          {trigger.trigger_type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(trigger.status)}>
                      {trigger.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Fortschritt</span>
                      <span>{getProgressDescription(trigger)}</span>
                    </div>
                    <Progress 
                      value={progress} 
                      className={`h-2 ${isTriggered ? 'bg-green-100' : ''}`} 
                    />
                  </div>
                  
                  {trigger.reward_value && (
                    <div className="mt-3 p-2 bg-muted/30 rounded text-xs">
                      <p className="font-medium">Belohnung:</p>
                      <p>
                        {trigger.reward_type === 'monetary' && `${trigger.reward_value}€`}
                        {trigger.reward_type === 'time_off' && `${trigger.reward_value} Tag(e) frei`}
                        {trigger.reward_type === 'promotion_points' && `${trigger.reward_value} Punkte`}
                        {trigger.reward_type === 'recognition' && 'Auszeichnung'}
                      </p>
                    </div>
                  )}
                  
                  {isTriggered && (
                    <div className="mt-3 flex justify-end">
                      <Button size="sm" variant="outline">
                        Auszahlen
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Team Incentive Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Team Performance für Incentives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mb-2">
                <div className="text-3xl font-bold text-green-600">{project.quality_score.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Qualitätsscore</div>
              </div>
              <Progress value={project.quality_score} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                Ziel: 90+ für Quality Bonus
              </div>
            </div>
            
            <div className="text-center">
              <div className="mb-2">
                <div className="text-3xl font-bold text-blue-600">{project.okr_progress.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">OKR Fortschritt</div>
              </div>
              <Progress value={project.okr_progress} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                Ziel: 100% für OKR Bonus
              </div>
            </div>
            
            <div className="text-center">
              <div className="mb-2">
                <div className="text-3xl font-bold text-purple-600">{project.productivity_score.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Produktivität</div>
              </div>
              <Progress value={project.productivity_score} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                Ziel: 85+ für Effizienz Bonus
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};