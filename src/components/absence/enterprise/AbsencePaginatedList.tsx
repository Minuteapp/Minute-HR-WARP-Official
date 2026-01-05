import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Clock,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAbsenceData } from './AbsenceDataProvider';
import { BulkSelectCheckbox } from './AbsenceBulkActions';
import { AbsenceDetailDialog } from '../AbsenceDetailDialog';
import { AbsenceRequest } from '@/types/absence.types';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { label: 'Ausstehend', color: 'bg-warning/10 text-warning' },
    approved: { label: 'Genehmigt', color: 'bg-success/10 text-success' },
    rejected: { label: 'Abgelehnt', color: 'bg-destructive/10 text-destructive' }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || 
    { label: status, color: 'bg-secondary text-secondary-foreground' };
  
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
};

const getTypeBadge = (type: string) => {
  const typeConfig = {
    vacation: { label: 'Urlaub', icon: Calendar },
    sick: { label: 'Krankenstand', icon: Clock },
    training: { label: 'Fortbildung', icon: FileText },
    other: { label: 'Sonstiges', icon: User }
  };
  
  const config = typeConfig[type as keyof typeof typeConfig] || 
    { label: type, icon: User };
  
  return (
    <div className="flex items-center gap-2">
      <config.icon className="h-4 w-4 text-muted-foreground" />
      <span>{config.label}</span>
    </div>
  );
};

export const AbsencePaginatedList: React.FC = () => {
  const { 
    requests, 
    isLoading, 
    pagination, 
    updatePagination,
    selectedRequests 
  } = useAbsenceData();

  const [selectedRequest, setSelectedRequest] = useState<AbsenceRequest | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updatePagination({ page: newPage });
    }
  };

  const handlePageSizeChange = (newPageSize: string) => {
    updatePagination({ 
      pageSize: parseInt(newPageSize), 
      page: 1 
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Abwesenheitsanträge
            <Badge variant="outline">
              {pagination.total} gesamt
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Einträge pro Seite:</span>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Keine Anträge gefunden
            </h3>
            <p className="text-gray-600">
              Es wurden keine Abwesenheitsanträge gefunden, die Ihren Filterkriterien entsprechen.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      {/* Bulk selection handled by BulkActions component */}
                    </TableHead>
                    <TableHead>Mitarbeiter</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Zeitraum</TableHead>
                    <TableHead>Dauer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Eingereicht</TableHead>
                    <TableHead>Grund</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow 
                      key={request.id}
                      className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedRequests.includes(request.id) ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailDialog(true);
                      }}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <BulkSelectCheckbox requestId={request.id} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {request.employee_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium">{request.employee_name || 'Unbekannt'}</div>
                            <div className="text-sm text-gray-500">{request.department || 'Keine Abteilung'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(request.type)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {format(new Date(request.start_date), 'dd.MM.yyyy', { locale: de })}
                          </div>
                          <div className="text-gray-500">
                            bis {format(new Date(request.end_date), 'dd.MM.yyyy', { locale: de })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {calculateDuration(request.start_date, request.end_date)} Tage
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(request.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate">
                        {request.reason || 'Kein Grund angegeben'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Zeige {((pagination.page - 1) * pagination.pageSize) + 1} bis{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} von{' '}
                {pagination.total} Einträgen
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, pagination.page - 2) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={pagination.page === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Detail Dialog */}
      <AbsenceDetailDialog
        request={selectedRequest}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />
    </Card>
  );
};