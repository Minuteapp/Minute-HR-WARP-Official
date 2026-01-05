
import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeftRight, 
  Plus, 
  FileText, 
  Filter, 
  Download, 
  TrendingUp, 
  Calendar,
  Users,
  Settings,
  Clock,
  CreditCard,
  Building,
  BarChart3,
  RefreshCw,
  UploadCloud,
  Heart
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";
// import { useExpenses } from '@/hooks/useExpenses';
import ExpenseSummaryCards from './ExpenseSummaryCards';
import ExpenseFilterBar from './ExpenseFilterBar';
import ExpenseList from './ExpenseList';
import { ExpenseCalendarView } from './ExpenseCalendarView';
import ExpenseChart from './ExpenseChart';
import { NewExpenseDialog } from './NewExpenseDialog';
import { SickLeaveDialog } from './SickLeaveDialog';
import { formatCurrency } from '@/utils/currencyUtils';

const ExpenseOverview = () => {
  const [isNewExpenseDialogOpen, setIsNewExpenseDialogOpen] = useState(false);
  const [isSickLeaveDialogOpen, setIsSickLeaveDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  
  // Mock data für Ausgaben
  const expenses = [];
  const summary = {
    totalExpenses: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
    currency: 'EUR' as const
  };
  const isLoading = false;
  const [filter, setFilter] = useState({});
  const refetchExpenses = () => {};
  const createExpense = (data: any) => {};

  const handleCreateExpense = (expenseData: any) => {
    createExpense(expenseData);
    setIsNewExpenseDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Ausgaben</h1>
          <p className="text-sm text-gray-500">Verwalten Sie alle Unternehmensausgaben an einem Ort</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetchExpenses()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Aktualisieren
          </Button>
          <Button
            variant="outline"
            className="gap-2"
          >
            <UploadCloud className="h-4 w-4" />
            Import
          </Button>
          <Button
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsSickLeaveDialogOpen(true)}
            className="gap-2"
          >
            <Heart className="h-4 w-4" />
            Krankmeldung
          </Button>
          <Button
            onClick={() => setIsNewExpenseDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Neue Ausgabe
          </Button>
        </div>
      </div>

      {summary && (
        <ExpenseSummaryCards summary={summary} />
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Ausgabenübersicht</CardTitle>
              <CardDescription>
                Alle Ausgaben im Unternehmen
              </CardDescription>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList>
                <TabsTrigger value="list">
                  <FileText className="h-4 w-4 mr-2" />
                  Liste
                </TabsTrigger>
                <TabsTrigger value="calendar">
                  <Calendar className="h-4 w-4 mr-2" />
                  Kalender
                </TabsTrigger>
                <TabsTrigger value="chart">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analyse
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Separator className="mt-4" />
          <ExpenseFilterBar 
            filter={filter} 
            onFilterChange={setFilter} 
          />
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="list" className="m-0">
              <ExpenseList 
                expenses={expenses || []} 
                isLoading={isLoading} 
              />
            </TabsContent>
            <TabsContent value="calendar" className="m-0">
              <ExpenseCalendarView 
                onDayClick={(day) => console.log('Tag ausgewählt:', day)}
              />
            </TabsContent>
            <TabsContent value="chart" className="m-0">
              <ExpenseChart 
                expenses={expenses || []} 
                isLoading={isLoading} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <NewExpenseDialog 
        open={isNewExpenseDialogOpen} 
        onOpenChange={setIsNewExpenseDialogOpen} 
        onSave={handleCreateExpense}
      />

      <SickLeaveDialog 
        open={isSickLeaveDialogOpen} 
        onOpenChange={setIsSickLeaveDialogOpen} 
      />
    </div>
  );
};

export default ExpenseOverview;
