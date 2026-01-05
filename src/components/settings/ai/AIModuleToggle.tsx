import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Zap, TrendingUp, Users, Target, Shield } from "lucide-react";

interface AIModule {
  id: string;
  name: string;
  description: string;
  category: 'hr' | 'finance' | 'security' | 'analytics';
  enabled: boolean;
  icon: any;
}

interface AIModuleToggleProps {
  modules: AIModule[];
  onToggle: (moduleId: string, enabled: boolean) => void;
}

const categoryIcons = {
  hr: Users,
  finance: TrendingUp,
  security: Shield,
  analytics: Target
};

const categoryLabels = {
  hr: 'HR & Personal',
  finance: 'Budget & Finanzen',
  security: 'Sicherheit',
  analytics: 'Analytics'
};

const categoryColors = {
  hr: 'bg-blue-100 text-blue-800',
  finance: 'bg-green-100 text-green-800',
  security: 'bg-red-100 text-red-800',
  analytics: 'bg-purple-100 text-purple-800'
};

export function AIModuleToggle({ modules, onToggle }: AIModuleToggleProps) {
  const groupedModules = modules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, AIModule[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          KI-Module aktivieren/deaktivieren
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedModules).map(([category, categoryModules]) => {
          const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
          
          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <CategoryIcon className="h-4 w-4" />
                <h3 className="font-medium text-sm">{categoryLabels[category as keyof typeof categoryLabels]}</h3>
                <Badge className={categoryColors[category as keyof typeof categoryColors]}>
                  {categoryModules.filter(m => m.enabled).length}/{categoryModules.length} aktiv
                </Badge>
              </div>
              
              <div className="grid gap-3">
                {categoryModules.map((module) => {
                  const ModuleIcon = module.icon;
                  
                  return (
                    <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <ModuleIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{module.name}</div>
                          <div className="text-xs text-muted-foreground">{module.description}</div>
                        </div>
                      </div>
                      
                      <Switch
                        checked={module.enabled}
                        onCheckedChange={(checked) => onToggle(module.id, checked)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}