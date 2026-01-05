import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, MoreVertical, Eye, Send, Link as LinkIcon, Archive } from 'lucide-react';
import type { Document } from '@/types/documents';

interface DocumentsTableViewProps {
  documents: Document[];
}

export function DocumentsTableView({ documents }: DocumentsTableViewProps) {
  const navigate = useNavigate();
  const [documentType, setDocumentType] = useState('all');
  const [status, setStatus] = useState('all');
  const [department, setDepartment] = useState('all');
  const [employee, setEmployee] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [aiSearch, setAiSearch] = useState('');

  const handleOpenDocument = (docId: string) => {
    navigate(`/documents/detail/${docId}`);
  };

  // Mock-Daten für die Tabelle
  const mockDocuments: any[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Zur Freigabe': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Freigegeben': return 'bg-green-100 text-green-800 border-green-200';
      case 'Signiert': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Archiviert': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Entwurf': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* KI-gestützte Suche */}
      <div className="relative">
        <Input 
          placeholder='KI-gestützte Suche: z.B. "Zeige alle Verträge von Anna Müller aus 2024"'
          value={aiSearch}
          onChange={(e) => setAiSearch(e.target.value)}
          className="pl-10"
        />
        <Badge variant="secondary" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
          Vorschau
        </Badge>
      </div>

      {/* Filter-Leiste */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter</span>
        </div>
        <Button variant="link" className="text-sm" onClick={() => {
          setDocumentType('all');
          setStatus('all');
          setDepartment('all');
          setEmployee('all');
          setTimeRange('all');
        }}>
          Zurücksetzen
        </Button>
      </div>

      {/* Filter-Selects */}
      <div className="grid grid-cols-5 gap-4">
        <Select value={documentType} onValueChange={setDocumentType}>
          <SelectTrigger>
            <SelectValue placeholder="Dokumenttyp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="vertrag">Vertrag</SelectItem>
            <SelectItem value="lohnabrechnung">Lohnabrechnung</SelectItem>
            <SelectItem value="krankmeldung">Krankmeldung</SelectItem>
            <SelectItem value="weiterbildungsnachweis">Weiterbildungsnachweis</SelectItem>
            <SelectItem value="urlaubsantrag">Urlaubsantrag</SelectItem>
            <SelectItem value="arbeitszeugnis">Arbeitszeugnis</SelectItem>
            <SelectItem value="richtlinie">Richtlinie</SelectItem>
            <SelectItem value="datenschutz">Datenschutz</SelectItem>
            <SelectItem value="sonstiges">Sonstiges</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="entwurf">Entwurf</SelectItem>
            <SelectItem value="freigabe">Zur Freigabe</SelectItem>
            <SelectItem value="freigegeben">Freigegeben</SelectItem>
            <SelectItem value="signiert">Signiert</SelectItem>
            <SelectItem value="archiviert">Archiviert</SelectItem>
            <SelectItem value="abgelaufen">Abgelaufen</SelectItem>
          </SelectContent>
        </Select>

        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger>
            <SelectValue placeholder="Abteilung" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Abteilungen</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
            <SelectItem value="it">IT</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
          </SelectContent>
        </Select>

        <Select value={employee} onValueChange={setEmployee}>
          <SelectTrigger>
            <SelectValue placeholder="Mitarbeiter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Mitarbeiter</SelectItem>
            {/* ZERO-DATA: Mitarbeiter dynamisch aus DB laden */}
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger>
            <SelectValue placeholder="Zeitraum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Gesamter Zeitraum</SelectItem>
            <SelectItem value="today">Heute</SelectItem>
            <SelectItem value="week">Diese Woche</SelectItem>
            <SelectItem value="month">Dieser Monat</SelectItem>
            <SelectItem value="quarter">Dieses Quartal</SelectItem>
            <SelectItem value="year">Dieses Jahr</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabelle */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="w-12 px-4 py-3">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Name</th>
              <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Typ</th>
              <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Mitarbeiter</th>
              <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Abteilung</th>
              <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Status</th>
              <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Erstellt von</th>
              <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Letzte Änderung</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockDocuments.map((doc) => (
              <tr 
                key={doc.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleOpenDocument(doc.id)}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{doc.name}</span>
                    {doc.hasSignature && (
                      <Badge variant="outline" className="text-xs">Signatur</Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{doc.type}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{doc.employee}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{doc.department}</td>
                <td className="px-4 py-3">
                  <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{doc.createdBy}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{doc.lastModified}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDocument(doc.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Öffnen
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Send className="h-4 w-4 mr-2" />
                        Versionen anzeigen
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Verknüpfungen
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archivieren
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
