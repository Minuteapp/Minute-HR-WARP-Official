import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Send,
  Eye,
  MessageSquare,
  ArrowRight,
  User,
  DollarSign,
  FileText,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

interface ExpenseApprovalWorkflowProps {
  tripId: string;
  expenses: any[];
}

const ExpenseApprovalWorkflow = ({ tripId, expenses }: ExpenseApprovalWorkflowProps) => {
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Approval chain data - empty by default, will be loaded from database
  const mockApprovalChain: {
    step: number;
    role: string;
    approver: string;
    status: string;
    decision: string | null;
    comments: string | null;
    processedAt: string | null;
  }[] = [];

  const getStatusIcon = (status: string, decision?: string) => {
    switch (status) {
      case "completed":
        return decision === "approved" 
          ? <CheckCircle className="h-5 w-5 text-green-500" />
          : <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "waiting":
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string, decision?: string) => {
    switch (status) {
      case "completed":
        return decision === "approved" 
          ? <Badge className="bg-green-100 text-green-800">Genehmigt</Badge>
          : <Badge className="bg-red-100 text-red-800">Abgelehnt</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">In Bearbeitung</Badge>;
      case "waiting":
        return <Badge variant="outline">Wartend</Badge>;
      default:
        return <Badge variant="outline">Ausstehend</Badge>;
    }
  };

  const submitExpenseForApproval = async (expenseId: string) => {
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Ausgabe zur Genehmigung eingereicht!");
    } catch (error) {
      toast.error("Fehler beim Einreichen");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addComment = async (expenseId: string) => {
    if (!comment.trim()) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Kommentar hinzugefügt!");
      setComment("");
    } catch (error) {
      toast.error("Fehler beim Hinzufügen des Kommentars");
    }
  };

  return (
    <div className="space-y-6">
      {/* Übersicht der Ausgaben */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ausgaben-Genehmigung
          </CardTitle>
          <CardDescription>
            Status und Workflow der Spesenprüfung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div 
                key={expense.id} 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedExpense?.id === expense.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedExpense(expense)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(expense.approval_status)}
                    <div>
                      <h4 className="font-medium">{expense.description}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Badge variant="secondary">{expense.category}</Badge>
                        <span>{expense.expense_date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">
                        {expense.amount.toFixed(2)} {expense.currency}
                      </p>
                      {getStatusBadge(expense.approval_status)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExpense(expense);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Eingereichte Ausgaben können kommentiert werden */}
                {expense.approval_status === "draft" && (
                  <div className="mt-3 pt-3 border-t">
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        submitExpenseForApproval(expense.id);
                      }}
                      disabled={isSubmitting}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Zur Genehmigung einreichen
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailansicht des ausgewählten Expense */}
      {selectedExpense && (
        <Card>
          <CardHeader>
            <CardTitle>Genehmigungsworkflow: {selectedExpense.description}</CardTitle>
            <CardDescription>
              Aktueller Status und Verlauf der Genehmigung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Workflow-Schritte */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Genehmigungsschritte
              </h4>
              
              <div className="relative">
                {/* Workflow-Timeline */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {mockApprovalChain.map((step, index) => (
                  <div key={step.step} className="relative flex items-start gap-4 pb-6">
                    <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white border-2 border-gray-200 rounded-full">
                      {getStatusIcon(step.status, step.decision)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h5 className="font-medium">{step.role}</h5>
                          <p className="text-sm text-gray-600">{step.approver}</p>
                        </div>
                        {getStatusBadge(step.status, step.decision)}
                      </div>
                      
                      {step.comments && (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                          <MessageSquare className="h-4 w-4 inline mr-2" />
                          {step.comments}
                        </div>
                      )}
                      
                      {step.processedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(step.processedAt).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA und Fristen */}
            <Card className="p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Service Level Agreement (SLA)</span>
              </div>
              <div className="text-sm text-blue-800">
                <div className="flex justify-between mb-1">
                  <span>Bearbeitungszeit pro Stufe:</span>
                  <span className="font-medium">max. 2 Werktage</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Maximale Gesamtdauer:</span>
                  <span className="font-medium">7 Werktage</span>
                </div>
                <div className="flex justify-between">
                  <span>Verbleibende Zeit:</span>
                  <span className="font-medium text-green-700">4 Tage, 2 Stunden</span>
                </div>
              </div>
            </Card>

            {/* Kommentar hinzufügen */}
            <div className="space-y-3">
              <Label htmlFor="comment">Kommentar hinzufügen</Label>
              <Textarea
                id="comment"
                placeholder="Fügen Sie eine Notiz oder Frage zur Ausgabe hinzu..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
              />
              <Button 
                onClick={() => addComment(selectedExpense.id)}
                disabled={!comment.trim()}
                size="sm"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Kommentar hinzufügen
              </Button>
            </div>

            {/* Ausgaben-Details */}
            <Card className="p-4">
              <h5 className="font-medium mb-3">Ausgaben-Details</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Betrag:</span>
                  <span className="ml-2 font-medium">
                    {selectedExpense.amount.toFixed(2)} {selectedExpense.currency}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Datum:</span>
                  <span className="ml-2">{selectedExpense.expense_date}</span>
                </div>
                <div>
                  <span className="text-gray-600">Kategorie:</span>
                  <span className="ml-2">{selectedExpense.category}</span>
                </div>
                <div>
                  <span className="text-gray-600">Beleg:</span>
                  <span className="ml-2">
                    {selectedExpense.receipt_upload_path ? (
                      <Badge className="bg-green-100 text-green-800">Vorhanden</Badge>
                    ) : (
                      <Badge variant="outline">Nicht vorhanden</Badge>
                    )}
                  </span>
                </div>
                {selectedExpense.mileage_km && (
                  <div>
                    <span className="text-gray-600">Kilometer:</span>
                    <span className="ml-2">{selectedExpense.mileage_km} km</span>
                  </div>
                )}
              </div>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Eingereicht</p>
              <p className="text-2xl font-bold">
                {expenses.filter(e => e.approval_status !== "draft").length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">In Prüfung</p>
              <p className="text-2xl font-bold">
                {expenses.filter(e => e.approval_status === "in_review").length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Genehmigt</p>
              <p className="text-2xl font-bold">
                {expenses.filter(e => e.approval_status === "approved").length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Ausgezahlt</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExpenseApprovalWorkflow;