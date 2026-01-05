
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Brain, Zap, TrendingUp, Star, Settings } from 'lucide-react';
import { useInnovation } from '@/hooks/useInnovation';

export const KITestLab = () => {
  const { kiFeatures, isLoading } = useInnovation();

  if (isLoading) {
    return <div className="p-6">Lade KI-Labor...</div>;
  }

  const getFeatureIcon = (type: string) => {
    switch (type) {
      case 'ai_comment': return Brain;
      case 'skill_matching': return TrendingUp;
      case 'auto_categorization': return Zap;
      case 'predictive_analysis': return Star;
      default: return Brain;
    }
  };

  const getFeatureLabel = (type: string) => {
    switch (type) {
      case 'ai_comment': return 'KI-Kommentare';
      case 'skill_matching': return 'Skill-Matching';
      case 'auto_categorization': return 'Auto-Kategorisierung';
      case 'predictive_analysis': return 'Vorhersage-Analyse';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">KI-Testlabor</h2>
          <p className="text-muted-foreground">
            Experimentieren Sie mit KI-Features zur Innovationsförderung
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Einstellungen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kiFeatures.length === 0 ? (
          <Card className="border-0 shadow-sm col-span-full">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine KI-Features verfügbar</h3>
              <p className="text-muted-foreground">
                KI-Features werden geladen oder sind noch nicht konfiguriert.
              </p>
            </CardContent>
          </Card>
        ) : (
          kiFeatures.map((feature: any) => {
            const IconComponent = getFeatureIcon(feature.feature_type);
            
            return (
              <Card key={feature.id} className="border-0 shadow-sm">
                <CardHeader className="border-b bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <IconComponent className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {getFeatureLabel(feature.feature_type)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={feature.is_enabled}
                      onCheckedChange={() => {
                        // TODO: Implement toggle functionality
                        console.log('Toggle feature:', feature.id);
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {feature.usage_count}
                        </div>
                        <p className="text-sm text-muted-foreground">Verwendungen</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {feature.feedback_score}%
                        </div>
                        <p className="text-sm text-muted-foreground">Bewertung</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Performance</span>
                        <span>{feature.feedback_score}%</span>
                      </div>
                      <Progress value={feature.feedback_score} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      <Badge 
                        variant={feature.is_enabled ? "default" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        {feature.is_enabled ? "Aktiv" : "Inaktiv"}
                      </Badge>
                      <Badge variant="outline">
                        Beta
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
