import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useSickLeaves } from '@/hooks/useSickLeaves';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { SickLeave } from '@/types/sick-leave';
import { Badge } from '@/components/ui/badge';
import { FileText, FileSpreadsheet, Filter, MoreHorizontal, Search, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSickLeaveDelete } from '@/hooks/useSickLeaveDelete';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const SickLeaveOverview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { sickLeaves, team, isLoading, error, fetchSickLeaves } = useSickLeaves();
  const { deleteSickLeave, isDeleting } = useSickLeaveDelete();
  const { toast } = useToast();
  
  const statusOptions = [
    { label: 'Alle Status', value: 'all' },
    { label: 'Anstehend', value: 'pending' },
    { label: 'Genehmigt', value: 'approved' },
    { label: 'Abgelehnt', value: 'rejected' },
    { label: 'Abgeschlossen', value: 'completed' }
  ];
  
  const filteredSickLeaves = sickLeaves.filter((sickLeave: SickLeave) => {
    const matchesSearch = 
      searchTerm === '' || 
      sickLeave.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sickLeave.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sickLeave.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      sickLeave.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Anstehend';
      case 'approved':
        return 'Genehmigt';
      case 'rejected':
        return 'Abgelehnt';
      case 'completed':
        return 'Abgeschlossen';
      default:
        return status;
    }
  };
  
  const handleDeleteSickLeave = async (id: string) => {
    try {
      await deleteSickLeave(id);
      fetchSickLeaves();
      toast({
        title: "Krankmeldung gelöscht",
        description: "Die Krankmeldung wurde erfolgreich gelöscht."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Die Krankmeldung konnte nicht gelöscht werden."
      });
    }
  };
  
  const handleRetry = () => {
    fetchSickLeaves();
  };

  // Fehler-Anzeige
  if (error && !isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error.message}</span>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Erneut versuchen
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-2">Krankmeldungen werden geladen...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <CardTitle>Übersicht Krankmeldungen</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            PDF Export
          </Button>
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Attest hochladen
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-1/3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label>Status Filter:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {filteredSickLeaves.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {sickLeaves.length === 0 ? 'Keine Krankmeldungen vorhanden' : 'Keine Krankmeldungen gefunden'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mitarbeiter</TableHead>
                  <TableHead>Abteilung</TableHead>
                  <TableHead>Zeitraum</TableHead>
                  <TableHead>Grund</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSickLeaves.map((leave: SickLeave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{leave.employee_name || 'Nicht angegeben'}</TableCell>
                    <TableCell>{leave.department || 'Nicht angegeben'}</TableCell>
                    <TableCell>
                      {format(parseISO(leave.start_date), 'dd.MM.yyyy', { locale: de })}
                      {leave.end_date && ` - ${format(parseISO(leave.end_date), 'dd.MM.yyyy', { locale: de })}`}
                    </TableCell>
                    <TableCell>{leave.description || 'Nicht angegeben'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeStyle(leave.status)}>
                        {getStatusLabel(leave.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => console.log('Details anzeigen', leave.id)}>
                            Details anzeigen
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log('Bearbeiten', leave.id)}>
                            Bearbeiten
                          </DropdownMenuItem>
                          {leave.status === 'pending' && (
                            <DropdownMenuItem onClick={() => console.log('Genehmigen', leave.id)}>
                              Genehmigen
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteSickLeave(leave.id)}
                            disabled={isDeleting}
                            className="text-red-600 focus:text-red-600"
                          >
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SickLeaveOverview;
