import { Check } from 'lucide-react';

export interface ComplianceRule {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
}

interface ComplianceRuleItemProps {
  rule: ComplianceRule;
}

const ComplianceRuleItem = ({ rule }: ComplianceRuleItemProps) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
      <div className="flex-shrink-0 p-1 rounded-full bg-green-50">
        <Check className="h-4 w-4 text-green-500" />
      </div>
      <div>
        <h4 className="font-medium text-foreground text-sm">{rule.title}</h4>
        <p className="text-sm text-muted-foreground">{rule.description}</p>
      </div>
    </div>
  );
};

export default ComplianceRuleItem;
