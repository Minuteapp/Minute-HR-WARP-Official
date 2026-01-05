import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Copy, Star, Users, BarChart3, Target, Trophy, Briefcase, Loader2, FileText } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

interface PerformanceTemplate {
  id: string;
  name: string;
  description: string;
  template_type: 'classic' | 'okr_based' | 'sales_scorecard' | 'support_scorecard' | 'custom';
  sections: any[];
  rating_scale: '1-5' | '1-10' | 'percentage' | 'qualitative';
  is_public: boolean;
  usage_count: number;
  created_by: string;
}

export const PerformanceTemplatesView = () => {
  const { tenantCompany } = useTenant();
  const currentCompanyId = tenantCompany?.id;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  // ECHTE DATEN: Laden aus Supabase mit company_id Filter
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['performance-templates', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      
      const { data, error } = await supabase
        .from('performance_templates')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('usage_count', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        return [];
      }

      return (data || []).map((template: any): PerformanceTemplate => ({
        id: template.id,
        name: template.name || 'Unbenannte Vorlage',
        description: template.description || '',
        template_type: template.template_type || 'classic',
        sections: template.sections || [],
        rating_scale: template.rating_scale || '1-5',
        is_public: template.is_public || false,
        usage_count: template.usage_count || 0,
        created_by: template.created_by_name || 'System'
      }));
    },
    enabled: !!currentCompanyId
  });

  const getTypeIcon = (type: PerformanceTemplate['template_type']) => {
    switch (type) {
      case 'classic': return <Users className="h-4 w-4" />;
      case 'okr_based': return <Target className="h-4 w-4" />;
      case 'sales_scorecard': return <Trophy className="h-4 w-4" />;
      case 'support_scorecard': return <Briefcase className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: PerformanceTemplate['template_type']) => {
    switch (type) {
      case 'classic': return 'bg-blue-100 text-blue-800';
      case 'okr_based': return 'bg-green-100 text-green-800';
      case 'sales_scorecard': return 'bg-yellow-100 text-yellow-800';
      case 'support_scorecard': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeName = (type: PerformanceTemplate['template_type']) => {
    switch (type) {
      case 'classic': return 'Klassisch';
      case 'okr_based': return 'OKR-basiert';
      case 'sales_scorecard': return 'Sales Scorecard';
      case 'support_scorecard': return 'Support Scorecard';
      default: return 'Benutzerdefiniert';
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || template.template_type === selectedType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Performance-Vorlagen</h2>
          <p className="text-sm text-gray-500">Vordefinierte Bewertungsvorlagen und Scorecards</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neue Vorlage
        </Button>
      </div>

      {/* Filter und Suche */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Vorlagen durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Typ auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="classic">Klassisch</SelectItem>
            <SelectItem value="okr_based">OKR-basiert</SelectItem>
            <SelectItem value="sales_scorecard">Sales Scorecard</SelectItem>
            <SelectItem value="support_scorecard">Support Scorecard</SelectItem>
            <SelectItem value="custom">Benutzerdefiniert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Vorlagen</h3>
              <p className="text-muted-foreground mb-4">
                Es wurden noch keine Performance-Vorlagen erstellt.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Erste Vorlage erstellen
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(template.template_type)}
                      <Badge 
                        variant="outline" 
                        className={`${getTypeColor(template.template_type)} border-0`}
                      >
                        {getTypeName(template.template_type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {template.is_public && (
                        <Badge variant="outline" className="text-xs">
                          Öffentlich
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Star className="h-3 w-3" />
                        {template.usage_count}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Bewertungsskala */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Bewertungsskala:</span>
                      <span className="font-medium">{template.rating_scale}</span>
                    </div>
                    
                    {/* Sections Preview */}
                    <div>
                      <p className="text-sm font-medium mb-2">Abschnitte ({template.sections.length}):</p>
                      <div className="space-y-1">
                        {template.sections.slice(0, 3).map((section: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">{section.name}</span>
                            <span className="font-medium">{section.weight}%</span>
                          </div>
                        ))}
                        {template.sections.length > 3 && (
                          <p className="text-xs text-gray-500">+{template.sections.length - 3} weitere</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Copy className="h-3 w-3 mr-1" />
                        Kopieren
                      </Button>
                      <Button size="sm" className="flex-1">
                        Verwenden
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Template Quick Creation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-dashed hover:border-solid hover:shadow-md transition-all cursor-pointer">
          <CardContent className="p-6 text-center space-y-3">
            <div className="mx-auto w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium">Klassische Vorlage</h4>
              <p className="text-xs text-gray-600">Standard Mitarbeiterbewertung</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed hover:border-solid hover:shadow-md transition-all cursor-pointer">
          <CardContent className="p-6 text-center space-y-3">
            <div className="mx-auto w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium">OKR Template</h4>
              <p className="text-xs text-gray-600">Objectives & Key Results</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed hover:border-solid hover:shadow-md transition-all cursor-pointer">
          <CardContent className="p-6 text-center space-y-3">
            <div className="mx-auto w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-medium">Sales Scorecard</h4>
              <p className="text-xs text-gray-600">Vertriebsbewertung</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed hover:border-solid hover:shadow-md transition-all cursor-pointer">
          <CardContent className="p-6 text-center space-y-3">
            <div className="mx-auto w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Plus className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium">Benutzerdefiniert</h4>
              <p className="text-xs text-gray-600">Von Grund auf erstellen</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
