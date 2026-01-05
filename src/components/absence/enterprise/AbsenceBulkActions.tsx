import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  ChevronDown, 
  FileText, 
  Send,
  Download,
  Settings
} from 'lucide-react';
import { useAbsenceData } from './AbsenceDataProvider';
import { useToast } from '@/hooks/use-toast';

export const AbsenceBulkActions: React.FC = () => {
  const { 
    requests, 
    selectedRequests, 
    setSelectedRequests, 
    bulkAction,
    refreshData 
  } = useAbsenceData();
  const { toast } = useToast();
  
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: string;
    title: string;
    description: string;
  } | null>(null);

  const isAllSelected = requests.length > 0 && selectedRequests.length === requests.length;
  const isPartialSelected = selectedRequests.length > 0 && selectedRequests.length < requests.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(requests.map(r => r.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleItemSelect = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests([...selectedRequests, requestId]);
    } else {
      setSelectedRequests(selectedRequests.filter(id => id !== requestId));
    }
  };

  const confirmAction = (type: string, title: string, description: string) => {
    setPendingAction({ type, title, description });
    setIsActionDialogOpen(true);
  };

  const executeBulkAction = async () => {
    if (!pendingAction) return;

    try {
      await bulkAction(pendingAction.type, selectedRequests);
      toast({
        title: "Aktion erfolgreich",
        description: `${selectedRequests.length} Anträge wurden ${
          pendingAction.type === 'approve' ? 'genehmigt' :
          pendingAction.type === 'reject' ? 'abgelehnt' : 'gelöscht'
        }.`,
      });
      setSelectedRequests([]);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Aktion konnte nicht ausgeführt werden.",
        variant: "destructive",
      });
    } finally {
      setIsActionDialogOpen(false);
      setPendingAction(null);
    }
  };

  const exportSelected = () => {
    const selectedData = requests.filter(r => selectedRequests.includes(r.id));
    const csvContent = [
      ['Name', 'Typ', 'Start', 'Ende', 'Status', 'Grund'].join(','),
      ...selectedData.map(r => [
        r.employee_name || 'Unbekannt',
        r.type,
        r.start_date,
        r.end_date,
        r.status,
        r.reason || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abwesenheiten_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (selectedRequests.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">
                Alle auswählen ({requests.length} Anträge)
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Wählen Sie Anträge für Massenaktionen aus
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-4 border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
              <Badge variant="secondary" className="text-blue-700 bg-blue-100">
                {selectedRequests.length} ausgewählt
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* Primary Actions */}
              <Button
                size="sm"
                onClick={() => confirmAction(
                  'approve',
                  'Anträge genehmigen',
                  `Möchten Sie ${selectedRequests.length} Anträge genehmigen?`
                )}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Genehmigen
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => confirmAction(
                  'reject',
                  'Anträge ablehnen',
                  `Möchten Sie ${selectedRequests.length} Anträge ablehnen?`
                )}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Ablehnen
              </Button>

              {/* More Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-1" />
                    Mehr
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={exportSelected}>
                    <Download className="h-4 w-4 mr-2" />
                    Als CSV exportieren
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>
                    <FileText className="h-4 w-4 mr-2" />
                    Bericht erstellen
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>
                    <Send className="h-4 w-4 mr-2" />
                    E-Mail senden
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => confirmAction(
                      'delete',
                      'Anträge löschen',
                      `Möchten Sie ${selectedRequests.length} Anträge unwiderruflich löschen?`
                    )}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedRequests([])}
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.description}
              <br />
              <strong>Diese Aktion kann nicht rückgängig gemacht werden.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeBulkAction}
              className={pendingAction?.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Bestätigen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

};

// Helper component for individual row selection
export const BulkSelectCheckbox: React.FC<{ requestId: string }> = ({ requestId }) => {
  const { selectedRequests, setSelectedRequests } = useAbsenceData();
  
  const handleItemSelect = (checked: boolean) => {
    if (checked) {
      setSelectedRequests([...selectedRequests, requestId]);
    } else {
      setSelectedRequests(selectedRequests.filter(id => id !== requestId));
    }
  };

  return (
    <Checkbox
      checked={selectedRequests.includes(requestId)}
      onCheckedChange={handleItemSelect}
    />
  );
};