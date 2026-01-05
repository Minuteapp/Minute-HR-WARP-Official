
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle, 
  XCircle, 
  Download, 
  Send, 
  Edit, 
  Trash, 
  FilePlus, 
  MessageSquare, 
  Clock, 
  Calendar, 
  User, 
  Tag, 
  CreditCard, 
  Building, 
  FileText, 
  Loader2 
} from "lucide-react";
import { format } from "date-fns";
import { ExpenseItem, Attachment, ExpenseComment } from "@/types/expenses";
import { formatCurrency } from "@/utils/currencyUtils";
import { useExpenses } from "@/hooks/useExpenses";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ExpenseDetailsDialogProps {
  expenseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExpenseDetailsDialog = ({ expenseId, open, onOpenChange }: ExpenseDetailsDialogProps) => {
  const [expense, setExpense] = useState<ExpenseItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    getExpense, 
    submitExpense, 
    approveExpense, 
    rejectExpense, 
    addComment: addCommentToExpense,
    addAttachment
  } = useExpenses();

  useEffect(() => {
    if (open && expenseId) {
      setIsLoading(true);
      getExpense(expenseId)
        .then((data) => {
          if (data) {
            setExpense(data);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to load expense details:", error);
          setIsLoading(false);
        });
    }
  }, [expenseId, open, getExpense]);

  const handleSubmitExpense = async () => {
    if (!expense) return;
    setIsSubmitting(true);
    try {
      await submitExpense(expense.id);
      // Aktualisieren der Details nach erfolgreichem Einreichen
      const updatedExpense = await getExpense(expense.id);
      if (updatedExpense) {
        setExpense(updatedExpense);
      }
    } catch (error) {
      console.error("Failed to submit expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveExpense = async () => {
    if (!expense) return;
    setIsSubmitting(true);
    try {
      await approveExpense({ id: expense.id, comment: comment || undefined });
      // Aktualisieren der Details nach erfolgreicher Genehmigung
      const updatedExpense = await getExpense(expense.id);
      if (updatedExpense) {
        setExpense(updatedExpense);
      }
      setComment("");
    } catch (error) {
      console.error("Failed to approve expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectExpense = async () => {
    if (!expense || !comment) return;
    setIsSubmitting(true);
    try {
      await rejectExpense({ id: expense.id, comment });
      // Aktualisieren der Details nach erfolgreicher Ablehnung
      const updatedExpense = await getExpense(expense.id);
      if (updatedExpense) {
        setExpense(updatedExpense);
      }
      setComment("");
    } catch (error) {
      console.error("Failed to reject expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!expense || !comment) return;
    setIsSubmitting(true);
    try {
      await addCommentToExpense({ 
        expenseId: expense.id, 
        comment, 
        isInternal: false 
      });
      // Aktualisieren der Details nach erfolgreicher Kommentarhinzufügung
      const updatedExpense = await getExpense(expense.id);
      if (updatedExpense) {
        setExpense(updatedExpense);
      }
      setComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!expense || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsSubmitting(true);
    
    try {
      await addAttachment({ expenseId: expense.id, file });
      // Aktualisieren der Details nach erfolgreichem Upload
      const updatedExpense = await getExpense(expense.id);
      if (updatedExpense) {
        setExpense(updatedExpense);
      }
    } catch (error) {
      console.error("Failed to upload file:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: ExpenseItem['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Entwurf</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Eingereicht</Badge>;
      case 'in_review':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">In Prüfung</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Genehmigt</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Abgelehnt</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Bezahlt</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Storniert</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  const getCategoryLabel = (category: ExpenseItem['category']) => {
    const labels: Record<string, string> = {
      travel: 'Reise',
      accommodation: 'Unterkunft',
      meals: 'Verpflegung',
      training: 'Fortbildung',
      equipment: 'Ausstattung',
      office_supplies: 'Büromaterial',
      software: 'Software',
      telecommunications: 'Telekommunikation',
      transport: 'Transport',
      entertainment: 'Bewirtung',
      events: 'Veranstaltungen',
      marketing: 'Marketing',
      other: 'Sonstiges'
    };
    return labels[category] || category;
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <div className="flex items-center justify-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!expense) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Ausgabe nicht gefunden</DialogTitle>
            <DialogDescription>
              Die angeforderte Ausgabe konnte nicht gefunden werden.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{expense.description}</DialogTitle>
              <DialogDescription className="mt-1 flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                {format(new Date(expense.date), 'dd.MM.yyyy')}
                <span className="mx-2">•</span>
                {getStatusBadge(expense.status)}
              </DialogDescription>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">
                {formatCurrency(expense.amount, expense.currency)}
              </div>
              <div className="text-sm text-muted-foreground">
                {expense.tax_amount && (
                  <>MwSt: {formatCurrency(expense.tax_amount, expense.currency)}</>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="attachments">
              Belege 
              {expense.attachments && expense.attachments.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {expense.attachments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="comments">
              Kommentare
              {expense.comments && expense.comments.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {expense.comments.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm">Kategorie</Label>
                <div className="flex items-center mt-1">
                  <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                  {getCategoryLabel(expense.category)}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Zahlungsmethode</Label>
                <div className="flex items-center mt-1">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  {expense.payment_method === 'company_card' ? 'Firmenkarte' : 
                   expense.payment_method === 'personal_card' ? 'Persönliche Karte' :
                   expense.payment_method === 'cash' ? 'Bargeld' :
                   expense.payment_method === 'bank_transfer' ? 'Überweisung' :
                   expense.payment_method === 'company_account' ? 'Firmenkonto' : 'Sonstiges'}
                </div>
              </div>
            </div>

            {expense.cost_center && (
              <div>
                <Label className="text-muted-foreground text-sm">Kostenstelle</Label>
                <div className="flex items-center mt-1">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  {expense.cost_center}
                </div>
              </div>
            )}

            {expense.project_id && (
              <div>
                <Label className="text-muted-foreground text-sm">Projekt</Label>
                <div className="flex items-center mt-1">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  {expense.project_id}
                </div>
              </div>
            )}

            {expense.business_trip_id && (
              <div>
                <Label className="text-muted-foreground text-sm">Geschäftsreise</Label>
                <div className="flex items-center mt-1">
                  <Plane className="h-4 w-4 mr-2 text-muted-foreground" />
                  {expense.business_trip_id}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <Label className="text-muted-foreground text-sm">Erstellungsdatum</Label>
              <div className="flex items-center mt-1">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                {format(new Date(expense.created_at), 'dd.MM.yyyy HH:mm')}
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground text-sm">Eingereicht von</Label>
              <div className="flex items-center mt-1">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                {expense.submitted_by}
              </div>
            </div>

            {expense.approval_chain && expense.approval_chain.length > 0 && (
              <div>
                <Label className="text-muted-foreground text-sm">Genehmigungsprozess</Label>
                <div className="space-y-2 mt-2">
                  {expense.approval_chain.map((step, index) => (
                    <div key={index} className="flex items-center">
                      {step.status === 'approved' ? (
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      ) : step.status === 'rejected' ? (
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                      ) : (
                        <Clock className="h-4 w-4 mr-2 text-orange-500" />
                      )}
                      <span>{step.role}</span>
                      {step.approver_id && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({step.approver_id})
                        </span>
                      )}
                      {step.timestamp && (
                        <span className="text-sm text-muted-foreground ml-2">
                          {format(new Date(step.timestamp), 'dd.MM.yyyy HH:mm')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="attachments" className="space-y-4 mt-4">
            {expense.attachments && expense.attachments.length > 0 ? (
              <div className="space-y-4">
                {expense.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center">
                      <FileIcon fileType={attachment.file_type} />
                      <div className="ml-3">
                        <div className="font-medium">{attachment.file_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(attachment.file_size)} • 
                          {format(new Date(attachment.upload_date), 'dd.MM.yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">Keine Belege vorhanden</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Fügen Sie Belege hinzu, um die Ausgabe zu dokumentieren.
                </p>
              </div>
            )}

            {expense.status === 'draft' && (
              <div className="mt-4">
                <Label htmlFor="file-upload" className="block mb-2">Neuen Beleg hochladen</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <FilePlus className="h-4 w-4" />
                    Datei auswählen
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isSubmitting}
                  />
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 mt-4">
            {expense.comments && expense.comments.length > 0 ? (
              <div className="space-y-4">
                {expense.comments.map((comment, index) => (
                  <div key={index} className="flex space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {comment.user_id.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center">
                        <span className="font-medium">{comment.user_id}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {format(new Date(comment.timestamp), 'dd.MM.yyyy HH:mm')}
                        </span>
                        {comment.is_internal && (
                          <Badge variant="outline" className="ml-2 text-xs">Intern</Badge>
                        )}
                      </div>
                      <p className="text-sm">{comment.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">Keine Kommentare vorhanden</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Fügen Sie Kommentare hinzu, um mit den Beteiligten zu kommunizieren.
                </p>
              </div>
            )}

            <div className="mt-4">
              <Label htmlFor="comment" className="block mb-2">Neuer Kommentar</Label>
              <Textarea
                id="comment"
                placeholder="Geben Sie Ihren Kommentar ein..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-3"
              />
              <Button
                onClick={handleAddComment}
                disabled={!comment || isSubmitting}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Kommentar hinzufügen
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          {expense.status === 'draft' && (
            <>
              <Button
                variant="outline"
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Bearbeiten
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash className="h-4 w-4" />
                Löschen
              </Button>
              <Button
                onClick={handleSubmitExpense}
                disabled={isSubmitting}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Einreichen
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </Button>
            </>
          )}

          {expense.status === 'submitted' && (
            <>
              <Button
                variant="outline"
                className="gap-2 text-destructive hover:text-destructive"
                onClick={handleRejectExpense}
                disabled={!comment || isSubmitting}
              >
                <XCircle className="h-4 w-4" />
                Ablehnen
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </Button>
              <Button
                onClick={handleApproveExpense}
                disabled={isSubmitting}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Genehmigen
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </Button>
            </>
          )}

          {(expense.status === 'approved' || expense.status === 'rejected' || expense.status === 'paid') && (
            <Button
              variant="outline"
              className="gap-2"
              asChild
            >
              <a href="#" download>
                <Download className="h-4 w-4" />
                Exportieren
              </a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Hilfsfunktion für die Formatierung der Dateigröße
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Komponente zur Anzeige eines Dateityp-Icons
const FileIcon = ({ fileType }: { fileType: string }) => {
  let icon = <FileText className="h-6 w-6 text-blue-500" />;
  
  if (fileType.startsWith('image/')) {
    icon = <ImageIcon className="h-6 w-6 text-green-500" />;
  } else if (fileType === 'application/pdf') {
    icon = <PdfIcon className="h-6 w-6 text-red-500" />;
  } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
    icon = <SpreadsheetIcon className="h-6 w-6 text-green-700" />;
  } else if (fileType.includes('wordprocessing') || fileType.includes('word')) {
    icon = <DocIcon className="h-6 w-6 text-blue-700" />;
  }
  
  return icon;
};

// Icon-Komponenten
const ImageIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const PdfIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M10 13a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2v-1a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-2 0" />
    <path d="M6 13v-1a1 1 0 0 1 1-1h.5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-1" />
    <path d="M16 12v4h1" />
  </svg>
);

const SpreadsheetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M8 13h2" />
    <path d="M8 17h2" />
    <path d="M14 13h2" />
    <path d="M14 17h2" />
  </svg>
);

const DocIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);

const Plane = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 4 2 2 4 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
);

export default ExpenseDetailsDialog;
