
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface AbwesenheitsArt {
  id: string;
  name: string;
  kategorie: string;
  farbe: string;
  icon?: string;
  ist_aktiv: boolean;
  erfordert_genehmigung: boolean;
  erfordert_nachweis: boolean;
  max_tage_pro_jahr?: number;
  max_aufeinanderfolgende_tage?: number;
  nachweis_ab_tag?: number;
  vorlaufzeit_tage?: number;
  wird_von_urlaub_abgezogen: boolean;
}

interface AbsenceSettings {
  id: string;
  absence_type: string;
  requires_approval: boolean;
  requires_document: boolean;
  annual_limit?: number;
  max_consecutive_days?: number;
  document_days?: number;
  color?: string;
  icon?: string;
}

const AbsenceSettings = () => {
  const { toast } = useToast();
  const [abwesenheitsArten, setAbwesenheitsArten] = useState<AbwesenheitsArt[]>([]);
  const [absenceSettings, setAbsenceSettings] = useState<AbsenceSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [currentArt, setCurrentArt] = useState<AbwesenheitsArt | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    kategorie: "urlaub",
    farbe: "#3B82F6",
    icon: "",
    erfordert_genehmigung: true,
    erfordert_nachweis: false,
    max_tage_pro_jahr: null as number | null,
    max_aufeinanderfolgende_tage: null as number | null,
    nachweis_ab_tag: 3,
    vorlaufzeit_tage: 14,
    wird_von_urlaub_abgezogen: false,
  });

  // Lade Daten beim Start
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Lade Abwesenheitsarten
      const { data: arten, error: artenError } = await supabase
        .from('abwesenheitsarten')
        .select('*')
        .eq('ist_aktiv', true)
        .order('prioritaet', { ascending: true });

      if (artenError) throw artenError;

      // Lade Absence Settings
      const { data: settings, error: settingsError } = await supabase
        .from('absence_settings')
        .select('*');

      if (settingsError) throw settingsError;

      setAbwesenheitsArten(arten || []);
      setAbsenceSettings(settings || []);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Abwesenheitsdaten konnten nicht geladen werden.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAbwesenheitsArt = async () => {
    try {
      const { data, error } = await supabase
        .from('abwesenheitsarten')
        .insert({
          name: formData.name,
          kategorie: formData.kategorie,
          farbe: formData.farbe,
          icon: formData.icon || null,
          erfordert_genehmigung: formData.erfordert_genehmigung,
          erfordert_nachweis: formData.erfordert_nachweis,
          max_tage_pro_jahr: formData.max_tage_pro_jahr,
          max_aufeinanderfolgende_tage: formData.max_aufeinanderfolgende_tage,
          nachweis_ab_tag: formData.nachweis_ab_tag,
          vorlaufzeit_tage: formData.vorlaufzeit_tage,
          wird_von_urlaub_abgezogen: formData.wird_von_urlaub_abgezogen,
          ist_aktiv: true,
        })
        .select();

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Abwesenheitsart wurde erstellt.",
      });

      loadData();
      setShowDialog(false);
      resetForm();
    } catch (error) {
      console.error('Fehler beim Erstellen:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Abwesenheitsart konnte nicht erstellt werden.",
      });
    }
  };

  const handleUpdateAbwesenheitsArt = async () => {
    if (!currentArt) return;

    try {
      const { error } = await supabase
        .from('abwesenheitsarten')
        .update({
          name: formData.name,
          kategorie: formData.kategorie,
          farbe: formData.farbe,
          icon: formData.icon || null,
          erfordert_genehmigung: formData.erfordert_genehmigung,
          erfordert_nachweis: formData.erfordert_nachweis,
          max_tage_pro_jahr: formData.max_tage_pro_jahr,
          max_aufeinanderfolgende_tage: formData.max_aufeinanderfolgende_tage,
          nachweis_ab_tag: formData.nachweis_ab_tag,
          vorlaufzeit_tage: formData.vorlaufzeit_tage,
          wird_von_urlaub_abgezogen: formData.wird_von_urlaub_abgezogen,
        })
        .eq('id', currentArt.id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Abwesenheitsart wurde aktualisiert.",
      });

      loadData();
      setShowDialog(false);
      resetForm();
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Abwesenheitsart konnte nicht aktualisiert werden.",
      });
    }
  };

  const handleDeleteAbwesenheitsArt = async (id: string) => {
    if (!confirm("Sind Sie sicher, dass Sie diese Abwesenheitsart löschen möchten?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('abwesenheitsarten')
        .update({ ist_aktiv: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Abwesenheitsart wurde deaktiviert.",
      });

      loadData();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Abwesenheitsart konnte nicht gelöscht werden.",
      });
    }
  };

  const handleEditAbwesenheitsArt = (art: AbwesenheitsArt) => {
    setCurrentArt(art);
    setFormData({
      name: art.name,
      kategorie: art.kategorie,
      farbe: art.farbe,
      icon: art.icon || "",
      erfordert_genehmigung: art.erfordert_genehmigung,
      erfordert_nachweis: art.erfordert_nachweis,
      max_tage_pro_jahr: art.max_tage_pro_jahr,
      max_aufeinanderfolgende_tage: art.max_aufeinanderfolgende_tage,
      nachweis_ab_tag: art.nachweis_ab_tag || 3,
      vorlaufzeit_tage: art.vorlaufzeit_tage || 14,
      wird_von_urlaub_abgezogen: art.wird_von_urlaub_abgezogen,
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setCurrentArt(null);
    setFormData({
      name: "",
      kategorie: "urlaub",
      farbe: "#3B82F6",
      icon: "",
      erfordert_genehmigung: true,
      erfordert_nachweis: false,
      max_tage_pro_jahr: null,
      max_aufeinanderfolgende_tage: null,
      nachweis_ab_tag: 3,
      vorlaufzeit_tage: 14,
      wird_von_urlaub_abgezogen: false,
    });
  };

  const openNewDialog = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleSave = () => {
    toast({
      title: "Einstellungen gespeichert",
      description: "Die Abwesenheitseinstellungen wurden aktualisiert.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-80 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="management" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="management">Verwaltung</TabsTrigger>
          <TabsTrigger value="vacation">Urlaub</TabsTrigger>
          <TabsTrigger value="sick">Krankheit</TabsTrigger>
          <TabsTrigger value="other">Sonstige</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-4 mt-6">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Abwesenheitsarten</h3>
              <Button onClick={openNewDialog}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Neue Abwesenheitsart
              </Button>
            </div>

            {abwesenheitsArten.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Keine Abwesenheitsarten vorhanden.</p>
                <Button onClick={openNewDialog}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Erste Abwesenheitsart erstellen
                </Button>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Kategorie</TableHead>
                      <TableHead>Genehmigung</TableHead>
                      <TableHead>Nachweis</TableHead>
                      <TableHead>Max. Tage/Jahr</TableHead>
                      <TableHead>Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {abwesenheitsArten.map((art) => (
                      <TableRow key={art.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: art.farbe }}
                            />
                            {art.name}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{art.kategorie}</TableCell>
                        <TableCell>
                          {art.erfordert_genehmigung ? "Ja" : "Nein"}
                        </TableCell>
                        <TableCell>
                          {art.erfordert_nachweis ? `Ab Tag ${art.nachweis_ab_tag}` : "Nein"}
                        </TableCell>
                        <TableCell>
                          {art.max_tage_pro_jahr || "Unbegrenzt"}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditAbwesenheitsArt(art)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteAbwesenheitsArt(art.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="vacation" className="space-y-4 mt-6">
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Urlaubsanspruch</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Standard-Urlaubstage pro Jahr</Label>
                  <div className="flex">
                    <Input type="number" defaultValue="30" className="rounded-r-none" />
                    <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                      Tage
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Mindesturlaub (gesetzlich)</Label>
                  <div className="flex">
                    <Input type="number" defaultValue="24" className="rounded-r-none" />
                    <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                      Tage
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Resturlaub ins Folgejahr übertragen</Label>
                  <p className="text-sm text-gray-500">
                    Nicht genommener Urlaub wird übertragen
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label>Verfallsdatum für Resturlaub</Label>
                <Select defaultValue="march">
                  <SelectTrigger>
                    <SelectValue placeholder="Verfallsdatum wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="january">31. Januar</SelectItem>
                    <SelectItem value="march">31. März</SelectItem>
                    <SelectItem value="june">30. Juni</SelectItem>
                    <SelectItem value="september">30. September</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Urlaubsantrag</h3>
              
              <div className="space-y-2">
                <Label>Genehmigungsprozess</Label>
                <Select defaultValue="manager">
                  <SelectTrigger>
                    <SelectValue placeholder="Prozess wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatische Genehmigung</SelectItem>
                    <SelectItem value="manager">Durch Vorgesetzten</SelectItem>
                    <SelectItem value="hr">Durch Personalabteilung</SelectItem>
                    <SelectItem value="both">Vorgesetzter & Personalabteilung</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Urlaubssperre ermöglichen</Label>
                  <p className="text-sm text-gray-500">
                    Bestimmte Zeiträume können für Urlaub gesperrt werden
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mindestzeitraum vor Urlaubsbeginn</Label>
                  <p className="text-sm text-gray-500">
                    Urlaub muss mit Vorlauf beantragt werden
                  </p>
                </div>
                <div className="flex">
                  <Input type="number" defaultValue="14" className="w-20 rounded-r-none" />
                  <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                    Tage
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="sick" className="space-y-4 mt-6">
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Krankmeldung</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Krankmeldung am ersten Tag</Label>
                  <p className="text-sm text-gray-500">
                    Mitarbeiter müssen sich am ersten Krankheitstag melden
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Attest erforderlich ab</Label>
                  <p className="text-sm text-gray-500">
                    Ärztliches Attest ist ab diesem Tag erforderlich
                  </p>
                </div>
                <div className="flex">
                  <Input type="number" defaultValue="3" className="w-20 rounded-r-none" />
                  <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                    Tag
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Benachrichtigung bei Krankmeldung an</Label>
                <Select defaultValue="manager">
                  <SelectTrigger>
                    <SelectValue placeholder="Empfänger wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Niemanden</SelectItem>
                    <SelectItem value="manager">Vorgesetzten</SelectItem>
                    <SelectItem value="hr">Personalabteilung</SelectItem>
                    <SelectItem value="both">Vorgesetzten & Personalabteilung</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Lohnfortzahlung</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Zeitraum der Lohnfortzahlung</Label>
                  <p className="text-sm text-gray-500">
                    Gesetzlich sind 6 Wochen vorgeschrieben
                  </p>
                </div>
                <div className="flex">
                  <Input type="number" defaultValue="42" className="w-20 rounded-r-none" />
                  <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                    Tage
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="other" className="space-y-4 mt-6">
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Sonderurlaub</h3>
              
              <div className="space-y-2">
                <Label>Hochzeit</Label>
                <div className="flex">
                  <Input type="number" defaultValue="2" className="w-20 rounded-r-none" />
                  <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                    Tage
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Geburt eines Kindes</Label>
                <div className="flex">
                  <Input type="number" defaultValue="2" className="w-20 rounded-r-none" />
                  <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                    Tage
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Todesfall in der Familie</Label>
                <div className="flex">
                  <Input type="number" defaultValue="3" className="w-20 rounded-r-none" />
                  <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                    Tage
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Umzug</Label>
                <div className="flex">
                  <Input type="number" defaultValue="1" className="w-20 rounded-r-none" />
                  <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                    Tag
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Unbezahlter Urlaub</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Unbezahlten Urlaub erlauben</Label>
                  <p className="text-sm text-gray-500">
                    Mitarbeiter können unbezahlten Urlaub beantragen
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maximaler Zeitraum pro Jahr</Label>
                </div>
                <div className="flex">
                  <Input type="number" defaultValue="30" className="w-20 rounded-r-none" />
                  <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                    Tage
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-4">
        <Button variant="outline">Zurücksetzen</Button>
        <Button onClick={handleSave}>Speichern</Button>
      </div>

      {/* Dialog für Abwesenheitsarten erstellen/bearbeiten */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentArt ? "Abwesenheitsart bearbeiten" : "Neue Abwesenheitsart"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="z.B. Erholungsurlaub"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kategorie">Kategorie</Label>
                <Select 
                  value={formData.kategorie} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, kategorie: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urlaub">Urlaub</SelectItem>
                    <SelectItem value="krankheit">Krankheit</SelectItem>
                    <SelectItem value="sonderurlaub">Sonderurlaub</SelectItem>
                    <SelectItem value="unbezahlt">Unbezahlter Urlaub</SelectItem>
                    <SelectItem value="weiterbildung">Weiterbildung</SelectItem>
                    <SelectItem value="sonstiges">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farbe">Farbe</Label>
                <div className="flex gap-2">
                  <Input
                    id="farbe"
                    type="color"
                    value={formData.farbe}
                    onChange={(e) => setFormData(prev => ({ ...prev, farbe: e.target.value }))}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.farbe}
                    onChange={(e) => setFormData(prev => ({ ...prev, farbe: e.target.value }))}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (optional)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="calendar, clock, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_tage_pro_jahr">Max. Tage pro Jahr</Label>
                <Input
                  id="max_tage_pro_jahr"
                  type="number"
                  value={formData.max_tage_pro_jahr || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    max_tage_pro_jahr: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  placeholder="z.B. 30"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_aufeinanderfolgende_tage">Max. aufeinanderfolgende Tage</Label>
                <Input
                  id="max_aufeinanderfolgende_tage"
                  type="number"
                  value={formData.max_aufeinanderfolgende_tage || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    max_aufeinanderfolgende_tage: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  placeholder="z.B. 21"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nachweis_ab_tag">Nachweis erforderlich ab Tag</Label>
                <Input
                  id="nachweis_ab_tag"
                  type="number"
                  value={formData.nachweis_ab_tag}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    nachweis_ab_tag: parseInt(e.target.value) || 3 
                  }))}
                  placeholder="z.B. 3"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vorlaufzeit_tage">Vorlaufzeit in Tagen</Label>
                <Input
                  id="vorlaufzeit_tage"
                  type="number"
                  value={formData.vorlaufzeit_tage}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    vorlaufzeit_tage: parseInt(e.target.value) || 14 
                  }))}
                  placeholder="z.B. 14"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Genehmigung erforderlich</Label>
                  <p className="text-sm text-gray-500">
                    Anträge müssen genehmigt werden
                  </p>
                </div>
                <Switch
                  checked={formData.erfordert_genehmigung}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    erfordert_genehmigung: checked 
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nachweis erforderlich</Label>
                  <p className="text-sm text-gray-500">
                    Dokumente/Nachweise sind erforderlich
                  </p>
                </div>
                <Switch
                  checked={formData.erfordert_nachweis}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    erfordert_nachweis: checked 
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Wird vom Urlaub abgezogen</Label>
                  <p className="text-sm text-gray-500">
                    Tage werden vom Urlaubsanspruch abgezogen
                  </p>
                </div>
                <Switch
                  checked={formData.wird_von_urlaub_abgezogen}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    wird_von_urlaub_abgezogen: checked 
                  }))}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={currentArt ? handleUpdateAbwesenheitsArt : handleCreateAbwesenheitsArt}
            >
              {currentArt ? "Aktualisieren" : "Erstellen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AbsenceSettings;
