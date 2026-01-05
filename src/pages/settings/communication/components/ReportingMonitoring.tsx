import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Activity, Eye, Download, Calendar, TrendingUp, Users, MessageSquare } from "lucide-react";

export default function ReportingMonitoring() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Benachrichtigungs-Statistiken
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium">Gesamt versendete</h4>
                </div>
                <div className="text-2xl font-bold">15,847</div>
                <p className="text-sm text-muted-foreground">Letzten 30 Tage</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium">Öffnungsrate</h4>
                </div>
                <div className="text-2xl font-bold">87.3%</div>
                <p className="text-sm text-muted-foreground">↑ 5.2% vs. Vormonat</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <h4 className="font-medium">Reaktionszeit</h4>
                </div>
                <div className="text-2xl font-bold">2.4h</div>
                <p className="text-sm text-muted-foreground">Durchschnittlich</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <h4 className="font-medium">Aktive Nutzer</h4>
                </div>
                <div className="text-2xl font-bold">245</div>
                <p className="text-sm text-muted-foreground">Empfänger</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Zustellraten nach Kanal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📧 E-Mail</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Zugestellt</span>
                    <span className="font-medium">96.8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '96.8%'}}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Geöffnet</span>
                    <span className="font-medium">78.4%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '78.4%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📱 Push</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Zugestellt</span>
                    <span className="font-medium">92.1%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '92.1%'}}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Geöffnet</span>
                    <span className="font-medium">45.7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '45.7%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">💬 SMS</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Zugestellt</span>
                    <span className="font-medium">99.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '99.2%'}}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Gelesen</span>
                    <span className="font-medium">87.6%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '87.6%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Aktivitäts-Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            <div className="font-medium">Mo</div>
            <div className="font-medium">Di</div>
            <div className="font-medium">Mi</div>
            <div className="font-medium">Do</div>
            <div className="font-medium">Fr</div>
            <div className="font-medium">Sa</div>
            <div className="font-medium">So</div>
          </div>
          
          <div className="grid grid-cols-24 gap-1">
            {Array.from({length: 24}, (_, hour) => (
              <div key={hour} className="aspect-square bg-green-100 rounded text-xs flex items-center justify-center">
                {hour}
              </div>
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            Höchste Aktivität: 09:00-11:00 und 14:00-16:00 Uhr
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export & Berichte</CardTitle>
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
                  <SelectItem value="7days">Letzte 7 Tage</SelectItem>
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
              <span className="text-sm text-muted-foreground">Alle Metriken</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <BarChart3 className="h-6 w-6 mb-1" />
              <span className="font-medium">Statistik-Übersicht</span>
              <span className="text-sm text-muted-foreground">KPIs & Trends</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Activity className="h-6 w-6 mb-1" />
              <span className="font-medium">Audit-Trail</span>
              <span className="text-sm text-muted-foreground">Compliance-Log</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monitoring & Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Warnung bei Zustellrate unter (%)</Label>
              <Input placeholder="90" type="number" />
            </div>
            <div className="space-y-2">
              <Label>Alert bei Fehlern über</Label>
              <Input placeholder="50" type="number" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">System-Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">E-Mail Service: Aktiv</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Push Service: Aktiv</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">SMS Service: Wartung</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Live-Dashboard öffnen</Button>
        <Button>Berichte konfigurieren</Button>
      </div>
    </div>
  );
}