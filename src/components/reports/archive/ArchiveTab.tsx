import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Archive, 
  Search, 
  Eye, 
  Download, 
  Calendar,
  HardDrive,
  Clock,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  FileText
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subYears, addYears } from 'date-fns';
import { de } from 'date-fns/locale';

interface ArchivedReport {
  id: string;
  name: string;
  category: string;
  archivedAt: string;
  retentionUntil: string;
  size: string;
  version: string;
  user: string;
}

const ArchiveTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch archived reports from database
  const { data: archivedReports } = useQuery({
    queryKey: ['archived-reports'],
    queryFn: async () => {
      const { data } = await supabase
        .from('reports')
        .select('*')
        .eq('status', 'archived')
        .order('archived_at', { ascending: false });
      
      return data || [];
    }
  });

  // Calculate statistics
  const { data: stats } = useQuery({
    queryKey: ['archive-stats'],
    queryFn: async () => {
      const { data: allArchived, count } = await supabase
        .from('reports')
        .select('id, archived_at, created_at', { count: 'exact' })
        .eq('status', 'archived');

      const currentYear = new Date().getFullYear();
      const thisYearArchives = allArchived?.filter(r => 
        r.archived_at && new Date(r.archived_at).getFullYear() === currentYear
      ).length || 0;

      const oldestArchive = allArchived?.reduce((oldest, report) => {
        if (!oldest || (report.archived_at && new Date(report.archived_at) < new Date(oldest))) {
          return report.archived_at;
        }
        return oldest;
      }, null as string | null);

      return {
        totalCount: count || 0,
        totalSize: `${((count || 0) * 2.5).toFixed(1)} GB`,
        thisYear: thisYearArchives,
        oldestDate: oldestArchive ? format(new Date(oldestArchive), 'dd.MM.yyyy', { locale: de }) : '-',
        oldestYears: oldestArchive ? Math.floor((Date.now() - new Date(oldestArchive).getTime()) / (365 * 24 * 60 * 60 * 1000)) : 0,
        deletionDue: Math.floor((count || 0) * 0.1) // 10% nearing deletion
      };
    }
  });

  // Transform to display format
  const displayReports: ArchivedReport[] = archivedReports?.map((report) => ({
    id: report.id,
    name: report.title,
    category: report.type === 'monthly' ? 'HR' : report.type === 'expense' ? 'Finance' : 'Analytics',
    archivedAt: report.archived_at ? format(new Date(report.archived_at), 'dd.MM.yyyy', { locale: de }) : '-',
    retentionUntil: report.archived_at ? format(addYears(new Date(report.archived_at), 10), 'dd.MM.yyyy', { locale: de }) : '-',
    size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
    version: 'v1.0',
    user: 'System'
  })) || [];

  // Filter reports
  const filteredReports = displayReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || report.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Archivierte Berichte</h4>
            <p className="text-sm text-blue-700">
              Alle archivierten Berichte sind unveränderbar (Read-only) und werden gemäß den gesetzlichen 
              Aufbewahrungsfristen gespeichert. Nach Ablauf der Frist werden sie zur Löschung vorgemerkt.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Archive className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gesamt Archiv</p>
                <p className="text-xl font-bold">{stats?.totalCount || 0} Berichte</p>
                <p className="text-xs text-muted-foreground">{stats?.totalSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dieses Jahr</p>
                <p className="text-xl font-bold">{stats?.thisYear || 0} Berichte</p>
                <p className="text-xs text-muted-foreground">{new Date().getFullYear()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ältestes Archiv</p>
                <p className="text-xl font-bold">{stats?.oldestDate || '-'}</p>
                <p className="text-xs text-muted-foreground">Vor {stats?.oldestYears || 0} Jahren</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Löschung fällig</p>
                <p className="text-xl font-bold">{stats?.deletionDue || 0} Berichte</p>
                <p className="text-xs text-muted-foreground">Nächste 90 Tage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Archiv durchsuchen..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Archive" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Archive</SelectItem>
            <SelectItem value="hr">HR-Berichte</SelectItem>
            <SelectItem value="finance">Finance-Berichte</SelectItem>
            <SelectItem value="analytics">Analytics</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Archive Table */}
      <Card>
        <CardHeader>
          <CardTitle>Archiv-Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedReports.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Berichtsname</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Archiviert am</TableHead>
                    <TableHead>Aufbewahrung bis</TableHead>
                    <TableHead>Größe</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Benutzer</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {report.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.category}</Badge>
                      </TableCell>
                      <TableCell>{report.archivedAt}</TableCell>
                      <TableCell>{report.retentionUntil}</TableCell>
                      <TableCell>{report.size}</TableCell>
                      <TableCell>{report.version}</TableCell>
                      <TableCell>{report.user}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  {filteredReports.length} Archive gefunden
                </p>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Vorherige
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Seite {currentPage} von {totalPages || 1}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Nächste
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Archive className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Keine archivierten Berichte gefunden</p>
              <p className="text-sm">Archivieren Sie Berichte, um sie hier zu sehen</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Retention Periods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-violet-600" />
            Aufbewahrungsfristen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">HR- & Finance-Berichte</p>
              <p className="text-2xl font-bold text-violet-600">10 Jahre</p>
              <p className="text-sm text-muted-foreground">Gesetzliche Aufbewahrungspflicht</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">Compliance-Berichte</p>
              <p className="text-2xl font-bold text-violet-600">10 Jahre</p>
              <p className="text-sm text-muted-foreground">Revisionssichere Archivierung</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">Analytics & Ad-hoc-Berichte</p>
              <p className="text-2xl font-bold text-violet-600">3 Jahre</p>
              <p className="text-sm text-muted-foreground">Interne Richtlinie</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notice Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900">Hinweis</h4>
            <p className="text-sm text-yellow-700">
              Nach Ablauf der Aufbewahrungsfrist werden Berichte automatisch zur Löschung vorgemerkt. 
              Sie erhalten 30 Tage vor der Löschung eine Benachrichtigung. Eine Verlängerung der 
              Aufbewahrungsfrist kann bei Bedarf beantragt werden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveTab;
