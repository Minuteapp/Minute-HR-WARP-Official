import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectBudgetEntry } from '@/types/project.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BudgetListProps {
  projectId: string;
}

const BudgetList = ({ projectId }: BudgetListProps) => {
  const { data: entries, isLoading } = useQuery({
    queryKey: ['projectBudget', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_budget_entries')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectBudgetEntry[];
    },
  });

  if (isLoading) {
    return <div>Loading budget entries...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries?.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              Keine Budgeteinträge gefunden
            </div>
          ) : (
            entries?.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{entry.description}</h3>
                  <p className="text-sm text-gray-500">{entry.category}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-medium ${
                    entry.entry_type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {entry.entry_type === 'expense' ? '-' : '+'} 
                    {entry.amount.toLocaleString()} €
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetList;
