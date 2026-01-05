import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, CheckCircle, Briefcase, User, Calendar, Filter } from 'lucide-react';
import type { DocumentStatus } from '@/types/documents';

export interface DocumentFilters {
  status?: DocumentStatus;
  dateFrom?: Date;
  dateTo?: Date;
  documentType?: string;
  department?: string;
  employee?: string;
}

interface DocumentFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilter: (filters: DocumentFilters) => void;
  compact?: boolean;
}

export const DocumentFilterDialog = ({
  open,
  onOpenChange,
  onFilter,
  compact = false,
}: DocumentFilterDialogProps) => {
  const [filters, setFilters] = useState<DocumentFilters>({});

  const handleApplyFilters = () => {
    onFilter(filters);
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    setFilters({});
    onFilter({});
  };

  if (compact) {
    // Mobile/Compact view with Accordion
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filter
          </div>
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Zurücksetzen
          </Button>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="documentType">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Dokumenttyp
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Select
                value={filters.documentType}
                onValueChange={(value) => setFilters({ ...filters, documentType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Typ auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Vertrag</SelectItem>
                  <SelectItem value="policy">Richtlinie</SelectItem>
                  <SelectItem value="certificate">Zeugnis</SelectItem>
                  <SelectItem value="invoice">Rechnung</SelectItem>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="status">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Status
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 bg-white rounded-lg border">
                {['Alle Status', 'Entwurf', 'Zur Freigabe', 'Freigegeben', 'Signiert', 'Archiviert', 'Abgelaufen'].map((statusOption) => (
                  <button
                    key={statusOption}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm"
                    onClick={() => {
                      const statusMap: Record<string, DocumentStatus | undefined> = {
                        'Alle Status': undefined,
                        'Entwurf': 'draft',
                        'Zur Freigabe': 'pending',
                        'Freigegeben': 'approved',
                        'Signiert': 'approved',
                        'Archiviert': 'archived',
                        'Abgelaufen': 'archived'
                      };
                      setFilters({ ...filters, status: statusMap[statusOption] });
                    }}
                  >
                    {statusOption}
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="department">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Abteilung
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Select
                value={filters.department}
                onValueChange={(value) => setFilters({ ...filters, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Abteilung auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hr">Personalwesen</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="finance">Finanzen</SelectItem>
                  <SelectItem value="sales">Vertrieb</SelectItem>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="employee">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Mitarbeiter
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Select
                value={filters.employee}
                onValueChange={(value) => setFilters({ ...filters, employee: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mitarbeiter auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="timeframe">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Zeitraum
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Zeitraum auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Heute</SelectItem>
                  <SelectItem value="week">Diese Woche</SelectItem>
                  <SelectItem value="month">Dieser Monat</SelectItem>
                  <SelectItem value="year">Dieses Jahr</SelectItem>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button onClick={handleApplyFilters} className="w-full">
          Filter anwenden
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dokumente filtern</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={filters.status || ''} 
              onValueChange={(value) => setFilters({ ...filters, status: value as DocumentStatus })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="approved">Genehmigt</SelectItem>
                <SelectItem value="rejected">Abgelehnt</SelectItem>
                <SelectItem value="archived">Archiviert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClearFilters}>
            Zurücksetzen
          </Button>
          <Button onClick={handleApplyFilters}>
            Filter anwenden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
