
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  Star,
  BarChart3
} from 'lucide-react';
import { usePerformanceMetrics } from '@/hooks/usePerformance';

export const PerformanceAnalyticsView = () => {
  const { data: metrics, isLoading } = usePerformanceMetrics();

  // Mock analytics data für Demonstration
  const analyticsData = {
    departmentPerformance: [
      { name: 'IT', avgScore: 4.2, trend: 'up', employees: 25 },
      { name: 'Sales', avgScore: 3.8, trend: 'up', employees: 18 },
      { name: 'Marketing', avgScore: 4.0, trend: 'stable', employees: 12 },
      { name: 'HR', avgScore: 3.9, trend: 'down', employees: 8 },
    ],
    skillGaps: [
      { skill: 'Führungskompetenzen', gap: 35, priority: 'high' },
      { skill: 'Digitale Tools', gap: 28, priority: 'medium' },
      { skill: 'Projektmanagement', gap: 22, priority: 'medium' },
      { skill: 'Kommunikation', gap: 15, priority: 'low' },
    ],
    performanceTrends: {
      improving: 45,
      stable: 38,
      declining: 17
    },
    recommendations: [
      {
        title: 'Führungskräfte-Entwicklungsprogramm',
        description: 'Implementierung eines strukturierten Mentoring-Programms',
        impact: 'high',
        effort: 'medium'
      },
      {
        title: 'Digitale Schulungen',
        description: 'Erweiterte Schulungen für neue Software-Tools',
        impact: 'medium',
        effort: 'low'
      },
      {
        title: 'Feedback-Kultur stärken',
        description: 'Regelmäßige 1-on-1 Gespräche etablieren',
        impact: 'high',
        effort: 'high'
      }
    ]
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      'high': 'destructive',
      'medium': 'default',
      'low': 'secondary'
    } as const;

    const labels = {
      'high': 'Hoch',
      'medium': 'Mittel',
      'low': 'Niedrig'
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Lade Analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Performance-Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Verbesserung</span>
                <span className="text-sm font-medium text-green-600">{analyticsData.performanceTrends.improving}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Stabil</span>
                <span className="text-sm font-medium text-blue-600">{analyticsData.performanceTrends.stable}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rückgang</span>
                <span className="text-sm font-medium text-red-600">{analyticsData.performanceTrends.declining}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {metrics ? Math.round((metrics.completedReviews / metrics.totalReviews) * 100) : 0}%
              </div>
              <Progress 
                value={metrics ? (metrics.completedReviews / metrics.totalReviews) * 100 : 0} 
                className="h-2" 
              />
              <p className="text-sm text-gray-500">
                {metrics?.completedReviews || 0} von {metrics?.totalReviews || 0} Reviews
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Durchschnittsbewertung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{metrics?.averageScore?.toFixed(1) || '0.0'}</div>
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">von 5.0 Sternen</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Abteilungsleistung</CardTitle>
          <CardDescription>Performance-Überblick nach Abteilungen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.departmentPerformance.map(dept => (
              <div key={dept.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-medium">{dept.name}</h3>
                    <p className="text-sm text-gray-500">{dept.employees} Mitarbeiter</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(dept.trend)}
                    <span className="font-medium">{dept.avgScore.toFixed(1)}</span>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
                <Progress value={dept.avgScore * 20} className="w-24 h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills Gaps */}
      <Card>
        <CardHeader>
          <CardTitle>Skill-Lücken Analyse</CardTitle>
          <CardDescription>Identifizierte Verbesserungsbereiche</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.skillGaps.map(skill => (
              <div key={skill.skill} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{skill.skill}</h3>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(skill.priority)}
                      <span className="text-sm font-medium">{skill.gap}% Lücke</span>
                    </div>
                  </div>
                  <Progress value={skill.gap} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            KI-Empfehlungen
          </CardTitle>
          <CardDescription>Automatisch generierte Verbesserungsvorschläge</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">{rec.title}</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getImpactColor(rec.impact)}>
                      Impact: {rec.impact}
                    </Badge>
                    <Badge variant="outline">
                      Aufwand: {rec.effort}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{rec.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
