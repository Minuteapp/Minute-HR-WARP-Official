import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import ComplianceRuleItem, { ComplianceRule } from './ComplianceRuleItem';

interface ComplianceRulesListProps {
  rules: ComplianceRule[];
}

const ComplianceRulesList = ({ rules }: ComplianceRulesListProps) => {
  if (rules.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Compliance-Regeln</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Shield className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Keine Compliance-Regeln definiert</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Compliance-Regeln</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {rules.map((rule) => (
          <ComplianceRuleItem key={rule.id} rule={rule} />
        ))}
      </CardContent>
    </Card>
  );
};

export default ComplianceRulesList;
