import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Layers, CheckCircle, Clock, Users, Target, Lightbulb, MessageSquare, Calendar, BarChart3, Loader2 } from "lucide-react";
import { useModuleActivations } from "@/hooks/useModuleActivations";

const iconMap: Record<string, any> = {
  workforce_planning: Users,
  innovation_hub: Lightbulb,
  feedback_360: MessageSquare,
  okr_manager: Target,
  event_manager: Calendar,
  analytics_pro: BarChart3,
};

const ModulesFeaturesTab = () => {
  const { data, isLoading } = useModuleActivations();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aktiv": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aktiv</Badge>;
      case "Beta": return <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Beta</Badge>;
      case "Veraltet": return <Badge variant="secondary">Veraltet</Badge>;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3">Lade Module...</span>
      </div>
    );
  }

  const modules = data?.modules || [];
  const tenantActivations = data?.tenantActivations || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Module & Feature-Management</h2>
        <p className="text-sm text-muted-foreground">Zentrale Verwaltung aller Plattform-Module</p>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Verfügbare Module</h3>
        <div className="grid grid-cols-3 gap-4">
          {modules.map((module, index) => {
            const Icon = iconMap[module.key] || Layers;
            return (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    {getStatusBadge(module.status)}
                  </div>
                  <h4 className="font-medium mb-1">{module.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{module.version}</span>
                    <span>{module.activations} Aktivierungen</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Mandanten-spezifische Modul-Aktivierungen</h3>
        {tenantActivations.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center text-muted-foreground">
              Keine Modul-Aktivierungen gefunden
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tenantActivations.map((tenant) => (
              <Card key={tenant.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="font-medium">{tenant.name}</h4>
                        <span className="text-sm text-muted-foreground">{tenant.id.slice(0, 8)}</span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Aktive Module ({tenant.activeModules.length})</span>
                          <div className="flex gap-2 ml-2 flex-wrap">
                            {tenant.activeModules.map((mod, i) => (
                              <Badge key={i} variant="outline" className="border-primary text-primary">{mod}</Badge>
                            ))}
                          </div>
                        </div>

                        {tenant.availableModules.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Verfügbar ({tenant.availableModules.length})</span>
                            <div className="flex gap-2 ml-2 flex-wrap">
                              {tenant.availableModules.slice(0, 3).map((mod, i) => (
                                <Badge key={i} variant="secondary">{mod}</Badge>
                              ))}
                              {tenant.availableModules.length > 3 && (
                                <Badge variant="secondary">+{tenant.availableModules.length - 3}</Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium mb-2">Feature-Limits</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Projekte</span>
                                <span>{tenant.limits.projects.used} / {tenant.limits.projects.max}</span>
                              </div>
                              <Progress value={(tenant.limits.projects.used / tenant.limits.projects.max) * 100} className="h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Umfragen</span>
                                <span>{tenant.limits.surveys.used} / {tenant.limits.surveys.max}</span>
                              </div>
                              <Progress value={(tenant.limits.surveys.used / tenant.limits.surveys.max) * 100} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Konfigurieren</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModulesFeaturesTab;