import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BillingTable, { BillingEntry } from './BillingTable';

interface BillingStatusTabsProps {
  entries: BillingEntry[];
  onView: (id: string) => void;
  onSend: (id: string) => void;
}

const BillingStatusTabs = ({ entries, onView, onSend }: BillingStatusTabsProps) => {
  const pendingEntries = entries.filter(e => e.status === 'pending');
  const processingEntries = entries.filter(e => e.status === 'processing');
  const reimbursedEntries = entries.filter(e => e.status === 'reimbursed');

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="bg-muted/50 border-b border-border rounded-none w-full justify-start h-auto p-0">
        <TabsTrigger 
          value="pending" 
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-2"
        >
          Ausstehend ({pendingEntries.length})
        </TabsTrigger>
        <TabsTrigger 
          value="processing" 
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-2"
        >
          In Bearbeitung ({processingEntries.length})
        </TabsTrigger>
        <TabsTrigger 
          value="reimbursed" 
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-2"
        >
          Erstattet ({reimbursedEntries.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending" className="mt-4">
        <BillingTable entries={pendingEntries} onView={onView} onSend={onSend} />
      </TabsContent>
      
      <TabsContent value="processing" className="mt-4">
        <BillingTable entries={processingEntries} onView={onView} onSend={onSend} />
      </TabsContent>
      
      <TabsContent value="reimbursed" className="mt-4">
        <BillingTable entries={reimbursedEntries} onView={onView} onSend={onSend} />
      </TabsContent>
    </Tabs>
  );
};

export default BillingStatusTabs;
