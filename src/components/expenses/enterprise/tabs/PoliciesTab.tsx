import { useState } from 'react';
import PoliciesStatsCards, { PolicyStats } from '../policies/PoliciesStatsCards';
import ExpensePoliciesList from '../policies/ExpensePoliciesList';
import { ExpensePolicy } from '../policies/ExpensePolicyCard';
import ComplianceRulesList from '../policies/ComplianceRulesList';
import { ComplianceRule } from '../policies/ComplianceRuleItem';
import PolicyViolationsTable, { PolicyViolation } from '../policies/PolicyViolationsTable';
import AIRecommendationsBox, { AIRecommendation } from '../policies/AIRecommendationsBox';
import NewPolicyDialog from '../policies/NewPolicyDialog';
import { toast } from 'sonner';
import { useExpensePermissions } from '@/hooks/useExpensePermissions';

const PoliciesTab = () => {
  const [policies] = useState<ExpensePolicy[]>([]);
  const [rules] = useState<ComplianceRule[]>([]);
  const [violations] = useState<PolicyViolation[]>([]);
  const [recommendations] = useState<AIRecommendation[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { canEditPolicies } = useExpensePermissions();

  const stats: PolicyStats = {
    activePolicies: policies.length,
    violations30Days: violations.length,
    complianceRate: policies.length > 0 ? 100 : 0,
  };

  const handleEditPolicy = (id: string) => {
    toast.info(`Richtlinie ${id} bearbeiten`);
  };

  const handleDeletePolicy = (id: string) => {
    toast.error(`Richtlinie ${id} löschen`);
  };

  const handleNewPolicy = (policy: {
    name: string;
    category: string;
    country?: string;
    limit: number;
    period: string;
    description: string;
  }) => {
    toast.success(`Richtlinie "${policy.name}" erstellt`);
  };

  return (
    <div className="space-y-6">
      <PoliciesStatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ExpensePoliciesList
            policies={policies}
            onEdit={handleEditPolicy}
            onDelete={handleDeletePolicy}
            onNewPolicy={() => setDialogOpen(true)}
            canEdit={canEditPolicies}
          />
          
          <PolicyViolationsTable violations={violations} />
        </div>
        
        <div className="space-y-6">
          <ComplianceRulesList rules={rules} />
          <AIRecommendationsBox recommendations={recommendations} />
        </div>
      </div>
      
      {canEditPolicies && (
        <NewPolicyDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleNewPolicy}
        />
      )}
    </div>
  );
};

export default PoliciesTab;
