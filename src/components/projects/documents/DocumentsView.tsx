import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, Upload, Download, Folder, FileText, Code, MessageSquare, 
  Star, MoreVertical, Presentation, FileCheck, BarChart, Filter, Eye, FolderOpen, Tag
} from "lucide-react";
import { useState } from "react";

const documentsData = {
  categories: [
    { name: 'Projektdokumentation', count: 24, icon: Folder, color: 'bg-blue-100 text-blue-600' },
    { name: 'Verträge & Legal', count: 8, icon: FileText, color: 'bg-purple-100 text-purple-600' },
    { name: 'Technische Specs', count: 15, icon: Code, color: 'bg-green-100 text-green-600' },
    { name: 'Meeting Notes', count: 32, icon: MessageSquare, color: 'bg-orange-100 text-orange-600' }
  ],
  documents: [
    {
      id: 1,
      name: 'ERP_Migration_Projektplan_v3.pdf',
      project: 'ERP Migration',
      type: 'PDF',
      size: '2.4 MB',
      version: 'v3',
      author: 'AS Anna Schmidt',
      date: '15.10.2025',
      status: 'aktuell',
      favorite: true,
      badges: ['Aktuell']
    },
    {
      id: 2,
      name: 'Kickoff_Präsentation.pptx',
      project: 'Cloud Infrastructure',
      type: 'PPTX',
      size: '8.7 MB',
      version: 'v1',
      author: 'SW Sarah Weber',
      date: '10.10.2025',
      status: 'aktuell',
      favorite: false,
      badges: ['Aktuell']
    },
    {
      id: 3,
      name: 'Abnahmeprotokoll_HR_Portal.pdf',
      project: 'HR Portal',
      type: 'PDF',
      size: '1.2 MB',
      version: 'v2',
      author: 'TF Tom Fischer',
      date: '14.10.2025',
      status: 'signiert',
      favorite: false,
      badges: ['Signiert', 'Signiert']
    },
    {
      id: 4,
      name: 'API_Spezifikation_Gateway.docx',
      project: 'API Gateway',
      type: 'DOCX',
      size: '456 KB',
      version: 'v5',
      author: 'AS Anna Schmidt',
      date: '16.10.2025',
      status: 'review',
      favorite: true,
      badges: ['Review']
    },
    {
      id: 5,
      name: 'Security_Assessment_Cloud.pdf',
      project: 'Cloud Infrastructure',
      type: 'PDF',
      size: '3.8 MB',
      version: 'v1',
      author: 'SW Sarah Weber',
      date: '12.10.2025',
      status: 'aktuell',
      favorite: false,
      badges: ['Aktuell']
    }
  ],
  templates: [
    { name: 'Kickoff Deck', description: 'Standard Projektstart-Präsentation', icon: Presentation },
    { name: 'Pflichtenheft', description: 'Anforderungsdokumentation Template', icon: FileText },
    { name: 'Abnahmeprotokoll', description: 'Gate Review & Sign-off', icon: FileCheck },
    { name: 'Statusreport', description: 'Wöchentlicher Projektbericht', icon: BarChart }
  ],
  versions: [
    { version: 'v3', author: 'AS', description: 'Finale Freigabe', date: '15.10.2025', status: 'current' },
    { version: 'v2', author: 'AS', description: 'Budget aktualisiert', date: '12.10.2025', status: 'old' },
    { version: 'v1', author: 'AS', description: 'Initiale Version', date: '08.10.2025', status: 'old' }
  ],
  workflows: [
    { title: 'Abnahmeprotokoll HR Portal', signatures: ['TF HR'], status: 'completed' },
    { title: 'Vertrag Cloud Provider', signatures: ['SY ggf'], status: 'pending' },
    { title: 'Pflichtenheft API Gateway', signatures: ['AGolu'], status: 'in_review' }
  ]
};

export const DocumentsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Dokumente durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Projekt" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Projekte</SelectItem>
            <SelectItem value="erp">ERP Migration</SelectItem>
            <SelectItem value="cloud">Cloud Infrastructure</SelectItem>
            <SelectItem value="mobile">Mobile App Redesign</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="docx">DOCX</SelectItem>
            <SelectItem value="pptx">PPTX</SelectItem>
            <SelectItem value="xlsx">XLSX</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="aktuell">Aktuell</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="signiert">Signiert</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-primary/10' : ''}
          >
            <Folder className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-primary/10' : ''}
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Batch Download
        </Button>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Hochladen
        </Button>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {documentsData.categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card key={category.name} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${category.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-sm text-muted-foreground">{category.count} Dokumente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* All Documents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alle Dokumente</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <FolderOpen className="h-3 w-3" />
                4 Ordner
              </Badge>
              <Badge variant="outline" className="gap-1">
                <FileText className="h-3 w-3" />
                {documentsData.documents.length} Dateien
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documentsData.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
                <div className="flex items-center gap-3 flex-1">
                  {doc.favorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                  <div className="flex-1">
                    <p className="font-medium">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{doc.project}</span>
                      <span>•</span>
                      <span>{doc.type} | {doc.size}</span>
                      <span>•</span>
                      <span>Version {doc.version}</span>
                      <span>•</span>
                      <span>{doc.author}</span>
                      <span>•</span>
                      <span>{doc.date}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Badge variant="outline" className="text-xs gap-1">
                        <Tag className="h-3 w-3" />
                        Projekt
                      </Badge>
                      <Badge variant="outline" className="text-xs gap-1">
                        <Tag className="h-3 w-3" />
                        Dokumentation
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {doc.badges.map((badge, idx) => (
                    <Badge 
                      key={idx}
                      className={
                        badge === 'Aktuell' ? 'bg-green-500' :
                        badge === 'Signiert' ? idx === 0 ? 'bg-green-500' : 'bg-blue-500' :
                        badge === 'Review' ? 'bg-orange-500' : ''
                      }
                    >
                      {badge}
                    </Badge>
                  ))}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedDoc(doc);
                      setShowPreview(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dokumenten-Vorlagen</CardTitle>
            <Button variant="outline" size="sm">Alle anzeigen</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {documentsData.templates.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card key={template.name} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{template.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Version History */}
        <Card>
          <CardHeader>
            <CardTitle>Versionsverlauf</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documentsData.versions.map((version) => (
                <div key={version.version} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                      {version.author}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{version.version}</p>
                      <p className="text-xs text-muted-foreground">{version.description}</p>
                      <p className="text-xs text-muted-foreground">{version.date}</p>
                    </div>
                  </div>
                  {version.status === 'current' ? (
                    <Badge className="bg-green-500">Aktuell</Badge>
                  ) : (
                    <Button variant="link" size="sm" className="text-blue-600">
                      Wiederherstellen
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* E-Signature Workflows */}
        <Card>
          <CardHeader>
            <CardTitle>E-Signatur Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documentsData.workflows.map((workflow, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <p className="font-semibold mb-2">{workflow.title}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Unterschriften:</span>
                      {workflow.signatures.map((sig, sidx) => (
                        <div key={sidx} className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                          {sig}
                        </div>
                      ))}
                    </div>
                    <Badge 
                      className={
                        workflow.status === 'completed' ? 'bg-green-500' :
                        workflow.status === 'pending' ? 'bg-orange-500' :
                        'bg-blue-500'
                      }
                    >
                      {workflow.status === 'completed' ? 'Abgeschlossen' :
                       workflow.status === 'pending' ? 'Ausstehend' :
                       'In Prüfung'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Document Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{selectedDoc?.name}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedDoc?.project} • Version {selectedDoc?.version}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Kommentar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 flex gap-4 overflow-hidden">
            {/* Preview Area */}
            <div className="flex-1 bg-muted/30 rounded-lg overflow-auto">
              {selectedDoc?.type === 'PDF' ? (
                <div className="h-full flex flex-col items-center p-8">
                  <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-8 mb-4">
                    <div className="space-y-6">
                      <div className="border-b pb-4">
                        <h2 className="text-2xl font-bold">Projektplan: {selectedDoc.project}</h2>
                        <p className="text-sm text-muted-foreground mt-2">Version {selectedDoc.version}</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">1. Projektziele</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Migration des bestehenden ERP-Systems zur modernen Cloud-basierten Lösung 
                            mit verbesserter Performance und Skalierbarkeit.
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">2. Zeitplan</h3>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Phase 1: Anforderungsanalyse (KW 40-42)</li>
                            <li>Phase 2: Systemdesign (KW 43-45)</li>
                            <li>Phase 3: Implementation (KW 46-52)</li>
                            <li>Phase 4: Testing & Rollout (KW 01-04/2026)</li>
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">3. Ressourcen</h3>
                          <p className="text-sm text-muted-foreground">
                            Team: 5 Entwickler, 2 DevOps Engineers, 1 Projektleiter
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">Seite 1 / 8</Button>
                    <Button variant="outline" size="sm">← Zurück</Button>
                    <Button variant="outline" size="sm">Weiter →</Button>
                  </div>
                </div>
              ) : selectedDoc?.type === 'PPTX' ? (
                <div className="h-full flex flex-col items-center justify-center p-8">
                  <div className="w-full max-w-4xl aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-2xl p-12 text-white flex flex-col justify-center">
                    <h1 className="text-5xl font-bold mb-8">Kickoff Präsentation</h1>
                    <h2 className="text-3xl mb-4">{selectedDoc.project}</h2>
                    <p className="text-xl opacity-90">Oktober 2025</p>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button variant="outline" size="sm">Folie 1 / 15</Button>
                    <Button variant="outline" size="sm">← Zurück</Button>
                    <Button variant="outline" size="sm">Weiter →</Button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">Dokumentenvorschau</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedDoc?.type} • {selectedDoc?.size}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar with Metadata & Comments */}
            <div className="w-80 space-y-4 overflow-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Dokumentdetails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Erstellt von</p>
                    <p className="font-medium">{selectedDoc?.author}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Datum</p>
                    <p className="font-medium">{selectedDoc?.date}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Größe</p>
                    <p className="font-medium">{selectedDoc?.size}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge className="bg-green-500">{selectedDoc?.status}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Kommentare</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                        MM
                      </div>
                      <div>
                        <p className="text-xs font-medium">Max Müller</p>
                        <p className="text-xs text-muted-foreground">vor 2 Stunden</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Bitte Performance-Metriken in Abschnitt 3 ergänzen.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                        SW
                      </div>
                      <div>
                        <p className="text-xs font-medium">Sarah Weber</p>
                        <p className="text-xs text-muted-foreground">gestern</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Sieht gut aus. Freigabe erfolgt nach Review des Budgets.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
