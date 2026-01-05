import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  Star, 
  Gift,
  TrendingUp,
  Award,
  Heart,
  Briefcase,
  Calendar
} from "lucide-react";
import { useRewardTemplates, useCreateCampaignFromTemplate } from '@/hooks/useRewards';

export const RewardTemplates = () => {
  const { data: templates, isLoading } = useRewardTemplates();
  const createFromTemplate = useCreateCampaignFromTemplate();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'projects':
        return <Briefcase className="h-4 w-4" />;
      case 'goals':
        return <TrendingUp className="h-4 w-4" />;
      case 'performance':
        return <Award className="h-4 w-4" />;
      case 'innovation':
        return <Star className="h-4 w-4" />;
      case 'sustainability':
        return <Heart className="h-4 w-4" />;
      case 'personal':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Gift className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'projects': 'Projekte',
      'goals': 'Ziele',
      'performance': 'Performance',
      'innovation': 'Innovation',
      'sustainability': 'Nachhaltigkeit',
      'personal': 'Persönlich',
      'general': 'Allgemein'
    };
    return labels[category] || category;
  };

  const getTriggerTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'project_completion': 'Projektabschluss',
      'goal_achievement': 'Zielerreichung',
      'performance_score': 'Performance',
      'anniversary': 'Jubiläum',
      'birthday': 'Geburtstag',
      'innovation_idea': 'Innovation',
      'peer_nomination': 'Peer-Nominierung',
      'custom_event': 'Benutzerdefiniert'
    };
    return labels[type] || type;
  };

  const getGoodieTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'amazon_voucher': 'Amazon Gutschein',
      'zalando_voucher': 'Zalando Gutschein',
      'extra_vacation_day': 'Extra Urlaubstag',
      'half_day_off': 'Halber freier Tag',
      'meal_voucher': 'Essensgutschein',
      'cash_bonus': 'Geldbonus',
      'donation_option': 'Spendenaktion',
      'physical_goodie': 'Physisches Goodie',
      'custom': 'Individuell'
    };
    return labels[type] || type;
  };

  const handleUseTemplate = (template: any) => {
    const campaignName = `${template.name} - ${new Date().toLocaleDateString('de-DE')}`;
    
    createFromTemplate.mutate({
      templateId: template.id,
      overrides: {
        name: campaignName,
        description: `Basierend auf Vorlage: ${template.name}`
      }
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Belohnungsvorlagen</h2>
          <p className="text-sm text-muted-foreground">
            Verwenden Sie vordefinierte Vorlagen oder erstellen Sie eigene
          </p>
        </div>
        <Button variant="outline">
          Eigene Vorlage erstellen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getCategoryIcon(template.category)}
                    {template.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {getCategoryLabel(template.category)}
                    </Badge>
                    {template.is_system_template && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        <Star className="h-3 w-3 mr-1" />
                        System
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {template.description || 'Keine Beschreibung verfügbar'}
              </p>

              {/* Template Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trigger:</span>
                  <span className="font-medium">
                    {getTriggerTypeLabel(template.trigger_type)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Belohnung:</span>
                  <span className="font-medium">
                    {getGoodieTypeLabel(template.default_goodie_type)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Wert:</span>
                  <span className="font-medium">
                    €{template.default_goodie_value}
                  </span>
                </div>
                {template.suggested_budget && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vorgeschlagenes Budget:</span>
                    <span className="font-medium">
                      €{template.suggested_budget.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Verwendungsstatistik */}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {template.usage_count}x verwendet
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => handleUseTemplate(template)}
                    disabled={createFromTemplate.isPending}
                    className="gap-2"
                  >
                    <Copy className="h-3 w-3" />
                    Verwenden
                  </Button>
                </div>
              </div>

              {/* Trigger-Bedingungen */}
              {Object.keys(template.default_conditions).length > 0 && (
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Bedingungen:</div>
                  <div className="space-y-1">
                    {Object.entries(template.default_conditions).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-muted-foreground">{key}:</span>{' '}
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!templates?.length && (
        <Card>
          <CardContent className="text-center py-12">
            <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Vorlagen verfügbar</h3>
            <p className="text-muted-foreground">
              Vorlagen werden hier angezeigt, sobald sie verfügbar sind.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};