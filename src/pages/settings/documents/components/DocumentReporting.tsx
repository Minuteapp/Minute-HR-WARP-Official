import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, FileText, Download, Calendar, TrendingUp, Users, Eye, Archive } from "lucide-react";

export default function DocumentReporting() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dokumenten-Statistiken
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium">Verträge</h4>
                </div>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-sm text-muted-foreground">Aktive Arbeitsverträge</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Archive className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium">Krankmeldungen</h4>
                </div>
                <div className="text-2xl font-bold">384</div>
                <p className="text-sm text-muted-foreground">Dieses Jahr</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <h4 className="font-medium">Zertifikate</h4>
                </div>
                <div className="text-2xl font-bold">892</div>
                <p className="text-sm text-muted-foreground">Gültige Qualifikationen</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-purple-500" />
                  <h4 className="font-medium">Uploads</h4>
                </div>
                <div className="text-2xl font-bold">156</div>
                <p className="text-sm text-muted-foreground">Letzte 30 Tage</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Übersicht nach Dokumenttyp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">📄 HR-Dokumente</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Arbeitsverträge</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <span className="text-sm font-medium">1,247</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Gehaltsabrechnungen</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                    <span className="text-sm font-medium">2,891</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Krankmeldungen</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '34%'}}></div>
                    </div>
                    <span className="text-sm font-medium">384</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Zeugnisse</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '67%'}}></div>
                    </div>
                    <span className="text-sm font-medium">756</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">📊 Compliance-Dokumente</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sicherheitszertifikate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                    <span className="text-sm font-medium">234</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Datenschutzschulungen</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '89%'}}></div>
                    </div>
                    <span className="text-sm font-medium">1,156</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Führungszeugnisse</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '78%'}}></div>
                    </div>
                    <span className="text-sm font-medium">987</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Arbeitserlaubnisse</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{width: '23%'}}></div>
                    </div>
                    <span className="text-sm font-medium">89</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Ablaufende Dokumente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-red-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-red-600 mb-2">⚠️ Nächste 30 Tage</h4>
                <div className="text-2xl font-bold mb-1">23</div>
                <p className="text-sm text-muted-foreground">Dokumente laufen ab</p>
                <ul className="text-xs mt-2 space-y-1">
                  <li>• 12 Zertifikate</li>
                  <li>• 8 Visa</li>
                  <li>• 3 Verträge</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-yellow-600 mb-2">⏰ Nächste 90 Tage</h4>
                <div className="text-2xl font-bold mb-1">67</div>
                <p className="text-sm text-muted-foreground">Dokumente laufen ab</p>
                <ul className="text-xs mt-2 space-y-1">
                  <li>• 34 Schulungszertifikate</li>
                  <li>• 18 Gesundheitszeugnisse</li>
                  <li>• 15 Sonstige</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-600 mb-2">📅 Nächste 365 Tage</h4>
                <div className="text-2xl font-bold mb-1">234</div>
                <p className="text-sm text-muted-foreground">Dokumente zur Erneuerung</p>
                <ul className="text-xs mt-2 space-y-1">
                  <li>• 89 Weiterbildungen</li>
                  <li>• 78 Verträge</li>
                  <li>• 67 Zertifikate</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nutzungsstatistiken</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">📈 Abteilungsverteilung</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Personal (HR)</span>
                  <span className="text-sm font-medium">2,847 Dokumente</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">IT</span>
                  <span className="text-sm font-medium">567 Dokumente</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Finanzen</span>
                  <span className="text-sm font-medium">1,234 Dokumente</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Marketing</span>
                  <span className="text-sm font-medium">456 Dokumente</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">🌍 Standortverteilung</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">🇩🇪 Berlin</span>
                  <span className="text-sm font-medium">1,892 Dokumente</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">🇩🇪 Hamburg</span>
                  <span className="text-sm font-medium">1,234 Dokumente</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">🇨🇭 Zürich</span>
                  <span className="text-sm font-medium">567 Dokumente</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">🇦🇹 Wien</span>
                  <span className="text-sm font-medium">234 Dokumente</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export & Berichte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Berichtszeitraum</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Zeitraum wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30days">Letzte 30 Tage</SelectItem>
                  <SelectItem value="90days">Letzte 90 Tage</SelectItem>
                  <SelectItem value="1year">Letztes Jahr</SelectItem>
                  <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Export-Format</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Format wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF-Bericht</SelectItem>
                  <SelectItem value="excel">Excel-Tabelle</SelectItem>
                  <SelectItem value="csv">CSV-Datei</SelectItem>
                  <SelectItem value="json">JSON-Export</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col">
              <Download className="h-6 w-6 mb-1" />
              <span className="font-medium">Vollständiger Bericht</span>
              <span className="text-sm text-muted-foreground">Alle Dokumentdaten</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Calendar className="h-6 w-6 mb-1" />
              <span className="font-medium">Ablauf-Report</span>
              <span className="text-sm text-muted-foreground">Ablaufende Dokumente</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Users className="h-6 w-6 mb-1" />
              <span className="font-medium">Compliance-Bericht</span>
              <span className="text-sm text-muted-foreground">Rechtliche Übersicht</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit-Trail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Wer hat wann welches Dokument angesehen/hochgeladen/gelöscht</Label>
            <div className="border rounded-lg p-4 max-h-40 overflow-y-auto">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Max Mustermann - Arbeitsvertrag_2024.pdf angesehen</span>
                  <span className="text-muted-foreground">15:32</span>
                </div>
                <div className="flex justify-between">
                  <span>Anna Schmidt - Krankmeldung_Januar.pdf hochgeladen</span>
                  <span className="text-muted-foreground">14:28</span>
                </div>
                <div className="flex justify-between">
                  <span>HR System - Gehaltsabrechnung_122023.pdf erstellt</span>
                  <span className="text-muted-foreground">13:45</span>
                </div>
                <div className="flex justify-between">
                  <span>Peter Wagner - Zertifikat_Gabelstapler.pdf gelöscht</span>
                  <span className="text-muted-foreground">12:15</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">Vollständiges Audit-Log exportieren</Button>
            <Button variant="outline">Nach Benutzer filtern</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Live-Dashboard öffnen</Button>
        <Button>Berichte generieren</Button>
      </div>
    </div>
  );
}