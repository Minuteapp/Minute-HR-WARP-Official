
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Receipt, 
  Eye, 
  Edit, 
  Trash2,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExpenseItem } from '@/types/expenses';
import { formatCurrency } from '@/utils/currencyUtils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ExpenseListProps {
  expenses: ExpenseItem[];
  isLoading: boolean;
}

const ExpenseList = ({ expenses, isLoading }: ExpenseListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return "bg-green-100 text-green-800 border-green-200";
      case 'rejected':
        return "bg-red-100 text-red-800 border-red-200";
      case 'pending':
      case 'submitted':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'in_review':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'paid':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'draft':
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Entwurf';
      case 'submitted': return 'Eingereicht';
      case 'in_review': return 'In Prüfung';
      case 'approved': return 'Genehmigt';
      case 'rejected': return 'Abgelehnt';
      case 'paid': return 'Bezahlt';
      case 'cancelled': return 'Storniert';
      default: return status;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'travel': return 'Reisekosten';
      case 'accommodation': return 'Unterkunft';
      case 'meals': return 'Verpflegung';
      case 'training': return 'Weiterbildung';
      case 'equipment': return 'Ausrüstung';
      case 'office_supplies': return 'Büromaterial';
      case 'software': return 'Software';
      case 'telecommunications': return 'Telekommunikation';
      case 'transport': return 'Transport';
      case 'entertainment': return 'Bewirtung';
      case 'events': return 'Veranstaltungen';
      case 'marketing': return 'Marketing';
      case 'other': return 'Sonstiges';
      default: return category;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Keine Ausgaben gefunden
          </h3>
          <p className="text-gray-500">
            Es wurden keine Ausgaben gefunden, die Ihren Filterkriterien entsprechen.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <Card key={expense.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">
                    {expense.description}
                  </h3>
                  <Badge className={getStatusColor(expense.status)}>
                    {getStatusText(expense.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Receipt className="h-3 w-3" />
                    {getCategoryText(expense.category)}
                  </span>
                  <span>
                    {format(new Date(expense.date), 'dd.MM.yyyy', { locale: de })}
                  </span>
                  {expense.cost_center && (
                    <span>Kostenstelle: {expense.cost_center}</span>
                  )}
                </div>

                {expense.attachments && expense.attachments.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Receipt className="h-3 w-3" />
                    {expense.attachments.length} Beleg(e) vorhanden
                  </div>
                )}
              </div>

              <div className="text-right space-y-2">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(expense.amount, expense.currency)}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Anzeigen
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Belege herunterladen
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExpenseList;
