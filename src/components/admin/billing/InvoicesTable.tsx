
import { useState } from "react";
import { CalendarIcon, Download, FileSpreadsheet, Search, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { utils, writeFile } from "xlsx";
import type { BillingRecord } from "./types";

export interface InvoicesTableProps {
  invoices: BillingRecord[] | undefined;
  isLoading: boolean;
  onDownload: (invoiceId: string) => void;
}

export const InvoicesTable = ({ invoices, isLoading, onDownload }: InvoicesTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Handle filter reset
  const resetFilters = () => {
    setStatusFilter("");
    setShowFilters(false);
  };

  // Filter invoices based on search query and status filter
  const filteredInvoices = invoices?.filter((invoice) => {
    const matchesSearch = 
      invoice.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Export to Excel functionality
  const handleExportToExcel = () => {
    if (!filteredInvoices || filteredInvoices.length === 0) return;
    
    const worksheet = utils.json_to_sheet(filteredInvoices.map(invoice => ({
      Unternehmen: invoice.company_name,
      Rechnungsnummer: invoice.invoice_number,
      Datum: new Date(invoice.date).toLocaleDateString('de-DE'),
      Betrag: `€${invoice.amount.toFixed(2)}`,
      Status: invoice.status
    })));
    
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Abrechnungen");
    
    writeFile(workbook, "Abrechnungen.xlsx");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-4" align="end" alignOffset={0} sideOffset={8}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Status</h4>
                  <Select 
                    value={statusFilter} 
                    onValueChange={(value) => {
                      setStatusFilter(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Alle Status" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="">Alle Status</SelectItem>
                      <SelectItem value="paid">Bezahlt</SelectItem>
                      <SelectItem value="pending">Ausstehend</SelectItem>
                      <SelectItem value="overdue">Überfällig</SelectItem>
                      <SelectItem value="cancelled">Storniert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetFilters} 
                  className="w-full"
                >
                  Filter zurücksetzen
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" size="sm" onClick={handleExportToExcel} className="gap-1">
            <FileSpreadsheet className="h-4 w-4" />
            Excel-Export
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unternehmen</TableHead>
              <TableHead>Rechnungsnr.</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Betrag</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                    <div>Lädt...</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : !filteredInvoices || filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  {invoices && invoices.length > 0 
                    ? "Keine Ergebnisse für die aktuelle Filterung" 
                    : "Keine Abrechnungsdaten verfügbar"}
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.company_name}</TableCell>
                  <TableCell>{record.invoice_number}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {new Date(record.date).toLocaleDateString('de-DE')}
                    </div>
                  </TableCell>
                  <TableCell>€{record.amount.toFixed(2)}</TableCell>
                  <TableCell><InvoiceStatusBadge status={record.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDownload(record.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
