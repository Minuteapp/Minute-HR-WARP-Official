
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Download, 
  Filter, 
  Search, 
  Plus, 
  FileText, 
  Star, 
  Clock, 
  BarChart4,
  Printer,
  Share2
} from "lucide-react";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Report {
  id: string;
  title: string;
  description: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  author: string;
  status: 'draft' | 'published' | 'archived';
  favorited: boolean;
}

const SustainabilityReports = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Beispieldaten für Berichte
  const reports: Report[] = [
    {
      id: '1',
      title: 'Jährlicher Nachhaltigkeitsbericht 2024',
      description: 'Umfassender Bericht über alle Nachhaltigkeitsaktivitäten des vergangenen Geschäftsjahres.',
      type: 'annual',
      createdAt: new Date(2024, 2, 15),
      updatedAt: new Date(2024, 3, 10),
      author: 'Maria Schmidt',
      status: 'published',
      favorited: true
    },
    {
      id: '2',
      title: 'CO2-Emissionsbericht Q1 2024',
      description: 'Detaillierte Analyse der CO2-Emissionen im ersten Quartal 2024.',
      type: 'quarterly',
      createdAt: new Date(2024, 3, 5),
      updatedAt: new Date(2024, 3, 5),
      author: 'Thomas Müller',
      status: 'published',
      favorited: false
    },
    {
      id: '3',
      title: 'Energieverbrauchsanalyse März 2024',
      description: 'Monatliche Analyse des Energieverbrauchs mit Verbesserungsvorschlägen.',
      type: 'monthly',
      createdAt: new Date(2024, 3, 2),
      updatedAt: new Date(2024, 3, 2),
      author: 'Julia Weber',
      status: 'published',
      favorited: true
    },
    {
      id: '4',
      title: 'Abfallmanagement-Optimierung (Entwurf)',
      description: 'Entwurf für neue Abfallmanagementstrategien im Unternehmen.',
      type: 'special',
      createdAt: new Date(2024, 3, 12),
      updatedAt: new Date(2024, 3, 18),
      author: 'Stefan Bauer',
      status: 'draft',
      favorited: false
    },
    {
      id: '5',
      title: 'Wasserverbrauchsreport 2023',
      description: 'Rückblickende Analyse des Wasserverbrauchs im Jahr 2023.',
      type: 'annual',
      createdAt: new Date(2023, 11, 28),
      updatedAt: new Date(2024, 0, 5),
      author: 'Lisa Hoffmann',
      status: 'archived',
      favorited: false
    },
  ];
  
  // Filtern der Berichte basierend auf dem Suchbegriff und dem ausgewählten Filter
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'favorites') return matchesSearch && report.favorited;
    if (filter === 'published') return matchesSearch && report.status === 'published';
    if (filter === 'draft') return matchesSearch && report.status === 'draft';
    if (filter === 'archived') return matchesSearch && report.status === 'archived';
    
    // Filter nach Berichtstyp
    if (filter === 'annual') return matchesSearch && report.type === 'annual';
    if (filter === 'quarterly') return matchesSearch && report.type === 'quarterly';
    if (filter === 'monthly') return matchesSearch && report.type === 'monthly';
    
    return matchesSearch;
  });
  
  const recentReports = [...reports].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 3);
  const favoritedReports = reports.filter(report => report.favorited);
  
  const handlePrintReport = (report: Report) => {
    toast({
      title: "Bericht wird gedruckt",
      description: `Bereite "${report.title}" für den Druck vor...`,
    });
    
    try {
      // Erstellen eines neuen jsPDF-Dokuments
      const doc = new jsPDF();
      
      // Titel und Metadaten
      doc.setFontSize(20);
      doc.text(report.title, 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Erstellt von: ${report.author}`, 20, 30);
      doc.text(`Datum: ${format(report.updatedAt, 'dd. MMMM yyyy', { locale: de })}`, 20, 37);
      
      // Beschreibung
      doc.setFontSize(14);
      doc.text('Beschreibung:', 20, 47);
      doc.setFontSize(12);
      doc.text(report.description, 20, 55);
      
      // Einen Beispiel-Inhalt einfügen
      doc.setFontSize(14);
      doc.text('Zusammenfassung:', 20, 70);
      doc.setFontSize(12);
      doc.text('Dieser Bericht bietet einen Überblick über die Nachhaltigkeitsleistung des Unternehmens.', 20, 78);
      doc.text('Er beinhaltet Kennzahlen zu Energieverbrauch, CO2-Emissionen und Ressourcenmanagement.', 20, 85);
      
      // Beispieltabelle mit Kennzahlen
      (doc as any).autoTable({
        startY: 95,
        head: [['Kennzahl', 'Wert', 'Veränderung zum Vorjahr']],
        body: [
          ['CO2-Emissionen', '2.450 t', '-8,5%'],
          ['Energieverbrauch', '1.250.000 kWh', '-5,2%'],
          ['Wasserverbrauch', '32.500 m³', '-3,8%'],
          ['Abfallaufkommen', '185 t', '-12,2%'],
          ['Recyclingquote', '78%', '+6,4%'],
        ],
      });

      // Seitenzahl hinzufügen (basierend auf der Gesamtanzahl der Seiten)
      const pageCount = doc.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text('Seite ' + i + ' von ' + pageCount, doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 10);
      }
      
      // PDF speichern oder anzeigen
      doc.save(`${report.title}.pdf`);
      
      toast({
        title: "PDF erstellt",
        description: `"${report.title}" wurde als PDF heruntergeladen.`,
      });
    } catch (error) {
      console.error("Fehler beim Erstellen des PDFs:", error);
      toast({
        title: "Fehler",
        description: "Beim Erstellen des PDFs ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };
  
  const handleCreateNewReport = () => {
    toast({
      title: "Neuer Bericht",
      description: "Funktion zum Erstellen eines neuen Berichts wird geöffnet.",
    });
  };
  
  const handleShareReport = (report: Report) => {
    // Simulierte Funktion zum Teilen eines Berichts
    toast({
      title: "Bericht geteilt",
      description: `Ein Link zu "${report.title}" wurde in die Zwischenablage kopiert.`,
    });
  };
  
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link to="/environment">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Nachhaltigkeitsberichte</h1>
        </div>
        
        <Button onClick={handleCreateNewReport}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Bericht
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Suche nach Berichten..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Berichte</SelectItem>
              <SelectItem value="favorites">Favoriten</SelectItem>
              <SelectItem value="published">Veröffentlicht</SelectItem>
              <SelectItem value="draft">Entwürfe</SelectItem>
              <SelectItem value="archived">Archiviert</SelectItem>
              <SelectItem value="annual">Jährliche Berichte</SelectItem>
              <SelectItem value="quarterly">Quartalsberichte</SelectItem>
              <SelectItem value="monthly">Monatsberichte</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Alle Berichte
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Neueste
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Favoriten
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            Analytik
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.length > 0 ? (
              filteredReports.map(report => (
                <Card key={report.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {report.type === 'annual' && 'Jahresbericht'}
                          {report.type === 'quarterly' && 'Quartalsbericht'}
                          {report.type === 'monthly' && 'Monatsbericht'}
                          {report.type === 'special' && 'Spezialbericht'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {report.favorited && (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        )}
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          report.status === 'published' ? 'bg-green-100 text-green-800' : 
                          report.status === 'draft' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status === 'published' ? 'Veröffentlicht' : 
                          report.status === 'draft' ? 'Entwurf' : 'Archiviert'}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
                    <div className="mt-4 flex flex-col gap-1 text-xs text-gray-500">
                      <div>Autor: {report.author}</div>
                      <div>Aktualisiert: {format(report.updatedAt, 'dd.MM.yyyy', { locale: de })}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 flex justify-between pt-2">
                    <Button variant="ghost" size="sm" onClick={() => handlePrintReport(report)}>
                      <Printer className="h-4 w-4 mr-1" />
                      Drucken
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleShareReport(report)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">Keine Berichte gefunden</h3>
                <p className="text-gray-500 mt-1">
                  Es wurden keine Berichte gefunden, die den Filterkriterien entsprechen.
                </p>
                <Button className="mt-4" onClick={handleCreateNewReport}>
                  Neuen Bericht erstellen
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="recent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentReports.map(report => (
              <Card key={report.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {report.type === 'annual' && 'Jahresbericht'}
                        {report.type === 'quarterly' && 'Quartalsbericht'}
                        {report.type === 'monthly' && 'Monatsbericht'}
                        {report.type === 'special' && 'Spezialbericht'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {report.favorited && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        report.status === 'published' ? 'bg-green-100 text-green-800' : 
                        report.status === 'draft' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status === 'published' ? 'Veröffentlicht' : 
                        report.status === 'draft' ? 'Entwurf' : 'Archiviert'}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
                  <div className="mt-4 flex flex-col gap-1 text-xs text-gray-500">
                    <div>Autor: {report.author}</div>
                    <div>Aktualisiert: {format(report.updatedAt, 'dd.MM.yyyy', { locale: de })}</div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={() => handlePrintReport(report)}>
                    <Printer className="h-4 w-4 mr-1" />
                    Drucken
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleShareReport(report)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="favorites">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritedReports.length > 0 ? (
              favoritedReports.map(report => (
                <Card key={report.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {report.type === 'annual' && 'Jahresbericht'}
                          {report.type === 'quarterly' && 'Quartalsbericht'}
                          {report.type === 'monthly' && 'Monatsbericht'}
                          {report.type === 'special' && 'Spezialbericht'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          report.status === 'published' ? 'bg-green-100 text-green-800' : 
                          report.status === 'draft' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status === 'published' ? 'Veröffentlicht' : 
                          report.status === 'draft' ? 'Entwurf' : 'Archiviert'}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
                    <div className="mt-4 flex flex-col gap-1 text-xs text-gray-500">
                      <div>Autor: {report.author}</div>
                      <div>Aktualisiert: {format(report.updatedAt, 'dd.MM.yyyy', { locale: de })}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 flex justify-between pt-2">
                    <Button variant="ghost" size="sm" onClick={() => handlePrintReport(report)}>
                      <Printer className="h-4 w-4 mr-1" />
                      Drucken
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleShareReport(report)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">Keine Favoriten gefunden</h3>
                <p className="text-gray-500 mt-1">
                  Sie haben noch keine Berichte als Favoriten markiert.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Berichtsübersicht</CardTitle>
                <CardDescription>Verteilung der Berichte nach Typ und Status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Berichtstypen</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Jahresberichte</span>
                        <span className="font-medium">{reports.filter(r => r.type === 'annual').length}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${(reports.filter(r => r.type === 'annual').length / reports.length) * 100}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Quartalsberichte</span>
                        <span className="font-medium">{reports.filter(r => r.type === 'quarterly').length}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${(reports.filter(r => r.type === 'quarterly').length / reports.length) * 100}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Monatsberichte</span>
                        <span className="font-medium">{reports.filter(r => r.type === 'monthly').length}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 rounded-full" 
                          style={{ width: `${(reports.filter(r => r.type === 'monthly').length / reports.length) * 100}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Spezialberichte</span>
                        <span className="font-medium">{reports.filter(r => r.type === 'special').length}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full" 
                          style={{ width: `${(reports.filter(r => r.type === 'special').length / reports.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Berichtsstatus</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Veröffentlicht</span>
                        <span className="font-medium">{reports.filter(r => r.status === 'published').length}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${(reports.filter(r => r.status === 'published').length / reports.length) * 100}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Entwürfe</span>
                        <span className="font-medium">{reports.filter(r => r.status === 'draft').length}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${(reports.filter(r => r.status === 'draft').length / reports.length) * 100}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Archiviert</span>
                        <span className="font-medium">{reports.filter(r => r.status === 'archived').length}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gray-500 rounded-full" 
                          style={{ width: `${(reports.filter(r => r.status === 'archived').length / reports.length) * 100}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Favoriten</span>
                        <span className="font-medium">{reports.filter(r => r.favorited).length}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 rounded-full" 
                          style={{ width: `${(reports.filter(r => r.favorited).length / reports.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Aktivste Berichtsautoren</CardTitle>
                  <CardDescription>Autoren mit den meisten Berichten</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from(new Set(reports.map(r => r.author))).map(author => {
                      const authorReports = reports.filter(r => r.author === author);
                      return (
                        <div key={author} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {author.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{author}</span>
                              <span>{authorReports.length} Berichte</span>
                            </div>
                            <div className="h-2 mt-1 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${(authorReports.length / reports.length) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Letzte Aktivitäten</CardTitle>
                  <CardDescription>Kürzlich aktualisierte Berichte</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...reports].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 5).map(report => (
                      <div key={report.id} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{report.title}</div>
                          <div className="text-sm text-gray-500">
                            Aktualisiert am {format(report.updatedAt, 'dd.MM.yyyy', { locale: de })} von {report.author}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SustainabilityReports;
