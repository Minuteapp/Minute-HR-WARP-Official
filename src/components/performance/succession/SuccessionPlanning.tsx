import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Crown, AlertTriangle, CheckCircle, Clock, Users, Target, Shield, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

interface SuccessionPlan {
  id: string;
  position_title: string;
  department: string;
  incumbent_name?: string;
  business_criticality: 'low' | 'medium' | 'high' | 'critical';
  succession_risk: 'low' | 'medium' | 'high';
  ready_now_candidates: { name: string; readiness: number }[];
  development_candidates: { name: string; readiness_timeframe: string; development_needs: string[] }[];
  emergency_plan: boolean;
  last_review: string;
}

export const SuccessionPlanning = () => {
  const { tenantCompany } = useTenant();
  const currentCompanyId = tenantCompany?.id;
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('all');
  
  // ECHTE DATEN: Laden aus Supabase mit company_id Filter
  const { data: successionPlans = [], isLoading } = useQuery({
    queryKey: ['succession-plans', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      
      const { data, error } = await supabase
        .from('succession_plans')
        .select(`
          id,
          position_title,
          department,
          business_criticality,
          succession_risk,
          ready_now_candidates,
          development_candidates,
          emergency_plan,
          last_review,
          incumbent:employees!succession_plans_incumbent_id_fkey(first_name, last_name)
        `)
        .eq('company_id', currentCompanyId)
        .order('business_criticality', { ascending: false });

      if (error) {
        console.error('Error fetching succession plans:', error);
        return [];
      }

      return (data || []).map((plan: any): SuccessionPlan => ({
        id: plan.id,
        position_title: plan.position_title || 'Unbekannte Position',
        department: plan.department || 'Unbekannt',
        incumbent_name: plan.incumbent 
          ? `${plan.incumbent.first_name || ''} ${plan.incumbent.last_name || ''}`.trim() || undefined
          : undefined,
        business_criticality: plan.business_criticality || 'medium',
        succession_risk: plan.succession_risk || 'medium',
        ready_now_candidates: plan.ready_now_candidates || [],
        development_candidates: plan.development_candidates || [],
        emergency_plan: plan.emergency_plan || false,
        last_review: plan.last_review || new Date().toISOString()
      }));
    },
    enabled: !!currentCompanyId
  });

  const getCriticalityColor = (criticality: SuccessionPlan['business_criticality']) => {
    switch (criticality) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
    }
  };

  const getCriticalityIcon = (criticality: SuccessionPlan['business_criticality']) => {
    switch (criticality) {
      case 'critical': return <AlertTriangle className="h-3 w-3" />;
      case 'high': return <Shield className="h-3 w-3" />;
      default: return <CheckCircle className="h-3 w-3" />;
    }
  };

  const getRiskColor = (risk: SuccessionPlan['succession_risk']) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
    }
  };

  const getCriticalityName = (criticality: SuccessionPlan['business_criticality']) => {
    switch (criticality) {
      case 'low': return 'Niedrig';
      case 'medium': return 'Mittel';
      case 'high': return 'Hoch';
      case 'critical': return 'Kritisch';
    }
  };

  const filteredPlans = successionPlans.filter(plan => {
    const matchesDepartment = selectedDepartment === 'all' || plan.department === selectedDepartment;
    const matchesCriticality = selectedCriticality === 'all' || plan.business_criticality === selectedCriticality;
    return matchesDepartment && matchesCriticality;
  });

  const isReviewOverdue = (lastReview: string) => {
    const reviewDate = new Date(lastReview);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return reviewDate < sixMonthsAgo;
  };

  const getSuccessionRiskLevel = (plan: SuccessionPlan) => {
    if (plan.ready_now_candidates.length === 0 && plan.business_criticality === 'critical') {
      return 'high';
    }
    if (plan.ready_now_candidates.length > 0) {
      return 'low';
    }
    return 'medium';
  };

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
          <h2 className="text-xl font-semibold">Nachfolgeplanung</h2>
          <p className="text-sm text-gray-500">Strategische Nachfolgeplanung für Schlüsselpositionen</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Nachfolgeplan
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Abteilung" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Abteilungen</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="Product">Product</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="Human Resources">Human Resources</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedCriticality} onValueChange={setSelectedCriticality}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Kritikalität" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Stufen</SelectItem>
            <SelectItem value="critical">Kritisch</SelectItem>
            <SelectItem value="high">Hoch</SelectItem>
            <SelectItem value="medium">Mittel</SelectItem>
            <SelectItem value="low">Niedrig</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Nachfolgepläne</h3>
              <p className="text-muted-foreground mb-4">
                Es wurden noch keine Nachfolgepläne erstellt.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ersten Nachfolgeplan erstellen
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Succession Plans */}
          <div className="space-y-6">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className={`hover:shadow-md transition-shadow ${getSuccessionRiskLevel(plan) === 'high' ? 'border-red-200 bg-red-50/30' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary" />
                        <CardTitle>{plan.position_title}</CardTitle>
                        <Badge 
                          variant="outline" 
                          className={`${getCriticalityColor(plan.business_criticality)} border-0`}
                        >
                          {getCriticalityIcon(plan.business_criticality)}
                          <span className="ml-1">{getCriticalityName(plan.business_criticality)}</span>
                        </Badge>
                        {!plan.emergency_plan && (
                          <Badge variant="destructive" className="text-xs">
                            Kein Notfallplan
                          </Badge>
                        )}
                        {isReviewOverdue(plan.last_review) && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                            Review überfällig
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        {plan.department} • Amtsinhaber: {plan.incumbent_name || 'Vakant'}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={`${getRiskColor(plan.succession_risk)} border-0`}
                      >
                        Risiko: {plan.succession_risk}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Ready Now Candidates */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Sofort verfügbare Kandidaten ({plan.ready_now_candidates.length})
                    </h4>
                    {plan.ready_now_candidates.length > 0 ? (
                      <div className="space-y-3">
                        {plan.ready_now_candidates.map((candidate, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Users className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="font-medium">{candidate.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Bereitschaft:</span>
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                {candidate.readiness}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 rounded-lg text-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-2" />
                        <p className="text-sm text-red-800 font-medium">Keine sofort verfügbaren Kandidaten</p>
                        <p className="text-xs text-red-600">Hohes Nachfolgerisiko</p>
                      </div>
                    )}
                  </div>

                  {/* Development Pipeline */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-1">
                      <Target className="h-4 w-4 text-blue-600" />
                      Entwicklungspipeline ({plan.development_candidates.length})
                    </h4>
                    {plan.development_candidates.length > 0 ? (
                      <div className="space-y-3">
                        {plan.development_candidates.map((candidate, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Users className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="font-medium">{candidate.name}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {candidate.readiness_timeframe}
                              </Badge>
                            </div>
                            {candidate.development_needs.length > 0 && (
                              <div>
                                <p className="text-sm text-gray-600 mb-2">Entwicklungsbedarf:</p>
                                <div className="flex flex-wrap gap-1">
                                  {candidate.development_needs.map((need, needIndex) => (
                                    <Badge key={needIndex} variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                                      {need}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Keine Kandidaten in der Entwicklungspipeline</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Letzter Review: {new Date(plan.last_review).toLocaleDateString('de-DE')}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Review planen
                      </Button>
                      <Button size="sm">
                        Details bearbeiten
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Risk Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {successionPlans.filter(p => p.business_criticality === 'critical' && p.ready_now_candidates.length === 0).length}
                </div>
                <p className="text-sm text-gray-600">Kritische Risiken</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {successionPlans.filter(p => p.ready_now_candidates.length > 0).length}
                </div>
                <p className="text-sm text-gray-600">Abgedeckte Positionen</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {successionPlans.reduce((sum, p) => sum + p.development_candidates.length, 0)}
                </div>
                <p className="text-sm text-gray-600">Kandidaten in Entwicklung</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {successionPlans.filter(p => !p.emergency_plan).length}
                </div>
                <p className="text-sm text-gray-600">Ohne Notfallplan</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Create Succession Plan */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">KI-unterstützte Nachfolgeplanung</h3>
              <p className="text-sm text-gray-600 mt-1">
                Identifizieren Sie automatisch Schlüsselpositionen und potenzielle Nachfolger 
                basierend auf Performance-Daten und Kompetenzprofilen
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <Button variant="outline">Risikoanalyse starten</Button>
              <Button>KI-Empfehlungen generieren</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
