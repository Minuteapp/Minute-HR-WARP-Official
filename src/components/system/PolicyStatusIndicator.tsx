import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Shield, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';
import { usePolicyEngine } from '@/hooks/system/usePolicyEngine';

interface PolicyStatusIndicatorProps {
  moduleName?: string;
  showDetails?: boolean;
  compact?: boolean;
}

const PolicyStatusIndicator = ({
  moduleName,
  showDetails = true,
  compact = false
}: PolicyStatusIndicatorProps) => {
  const { policies, conflicts, loading } = usePolicyEngine();
  const [relevantPolicies, setRelevantPolicies] = useState<any[]>([]);
  const [relevantConflicts, setRelevantConflicts] = useState<any[]>([]);

  useEffect(() => {
    if (moduleName) {
      // Filter policies relevant to this module
      const filtered = policies.filter(policy => 
        policy.is_active && (
          policy.affected_modules.includes(moduleName) ||
          policy.affected_modules.length === 0
        )
      );
      setRelevantPolicies(filtered);

      // Filter conflicts relevant to this module  
      const filteredConflicts = conflicts.filter(conflict => {
        const primaryPolicy = policies.find(p => p.id === conflict.primary_policy_id);
        const conflictingPolicy = policies.find(p => p.id === conflict.conflicting_policy_id);
        
        return (
          (primaryPolicy?.affected_modules.includes(moduleName) || primaryPolicy?.affected_modules.length === 0) ||
          (conflictingPolicy?.affected_modules.includes(moduleName) || conflictingPolicy?.affected_modules.length === 0)
        );
      });
      setRelevantConflicts(filteredConflicts);
    } else {
      setRelevantPolicies(policies.filter(p => p.is_active));
      setRelevantConflicts(conflicts);
    }
  }, [policies, conflicts, moduleName]);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        {!compact && <span className="text-sm text-muted-foreground">Lade Policies...</span>}
      </div>
    );
  }

  const hasConflicts = relevantConflicts.length > 0;
  const activePolicies = relevantPolicies.length;
  const criticalConflicts = relevantConflicts.filter(c => c.severity === 'critical').length;

  const getStatusColor = () => {
    if (criticalConflicts > 0) return 'destructive';
    if (hasConflicts) return 'secondary';
    if (activePolicies > 0) return 'default';
    return 'outline';
  };

  const getStatusIcon = () => {
    if (criticalConflicts > 0) return <AlertTriangle className="h-3 w-3" />;
    if (hasConflicts) return <Clock className="h-3 w-3" />;
    if (activePolicies > 0) return <Shield className="h-3 w-3" />;
    return <CheckCircle className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (criticalConflicts > 0) return `${criticalConflicts} kritische Konflikte`;
    if (hasConflicts) return `${relevantConflicts.length} Konflikte`;
    if (activePolicies > 0) return `${activePolicies} aktive Policies`;
    return 'Keine Policies aktiv';
  };

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2">
            {getStatusIcon()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Policy Status</span>
              {moduleName && (
                <Badge variant="outline" className="text-xs">
                  {moduleName}
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Aktive Policies:</span>
                <Badge variant="secondary">{activePolicies}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Konflikte:</span>
                <Badge variant={hasConflicts ? 'destructive' : 'secondary'}>
                  {relevantConflicts.length}
                </Badge>
              </div>
              
              {criticalConflicts > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">Kritische Konflikte:</span>
                  <Badge variant="destructive">{criticalConflicts}</Badge>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  if (!showDetails) {
    return (
      <Badge variant={getStatusColor() as any} className="text-xs">
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </Badge>
    );
  }

  return (
    <Card className={`${hasConflicts ? 'border-yellow-200' : ''} ${criticalConflicts > 0 ? 'border-red-200' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Policy Status</span>
            {moduleName && (
              <Badge variant="outline" className="text-xs">
                {moduleName}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor() as any}>
              {getStatusIcon()}
              <span className="ml-1">{getStatusText()}</span>
            </Badge>
          </div>
        </div>

        {/* Active Policies */}
        {relevantPolicies.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Aktive Policies ({relevantPolicies.length})
            </h4>
            <div className="space-y-1">
              {relevantPolicies.slice(0, 3).map((policy) => (
                <div key={policy.id} className="text-xs text-muted-foreground">
                  <span className="font-mono">{policy.policy_key}</span> - {policy.policy_name}
                </div>
              ))}
              {relevantPolicies.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  ... und {relevantPolicies.length - 3} weitere
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conflicts */}
        {relevantConflicts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              Policy-Konflikte ({relevantConflicts.length})
            </h4>
            <div className="space-y-1">
              {relevantConflicts.slice(0, 2).map((conflict) => (
                <div key={conflict.id} className="text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs mr-1">
                    {conflict.severity}
                  </Badge>
                  {conflict.conflict_description.substring(0, 50)}...
                </div>
              ))}
              {relevantConflicts.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  ... und {relevantConflicts.length - 2} weitere Konflikte
                </div>
              )}
            </div>
          </div>
        )}

        {/* No policies */}
        {relevantPolicies.length === 0 && relevantConflicts.length === 0 && (
          <div className="text-center py-2">
            <Eye className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">
              {moduleName ? `Keine Policies für ${moduleName} aktiv` : 'Keine aktiven Policies'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PolicyStatusIndicator;