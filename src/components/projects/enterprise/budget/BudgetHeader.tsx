import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const BudgetHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Budget & Kosten</h2>
        <p className="text-muted-foreground">Portfolio-weites Budget-Controlling</p>
      </div>
      <Button className="bg-black text-white hover:bg-gray-800">
        <Plus className="h-4 w-4 mr-2" />
        Budget-Position hinzufügen
      </Button>
    </div>
  );
};

export default BudgetHeader;
