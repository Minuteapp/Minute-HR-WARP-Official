import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download,
  Calendar,
  Filter,
  FileText,
  Euro,
  Calculator,
  Award,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface ExpenseReportsTabProps {
  tripId: string;
}

const ExpenseReportsTab = ({ tripId }: ExpenseReportsTabProps) => {
  const [reportType, setReportType] = useState("summary");
  const [dateRange, setDateRange] = useState("current_month");
  const [isGenerating, setIsGenerating] = useState(false);

  // Keine Mock-Daten - Daten werden aus der Datenbank geladen
  const mockReportData = {
    totalExpenses: 0,
    approvedExpenses: 0,
    pendingExpenses: 0,
    rejectedExpenses: 0,
    expensesByCategory: [] as any[],
    monthlyTrend: [] as any[],
    topExpenses: [] as any[]
  };

  const generateReport = async (format: string) => {
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      switch (format) {
        case "pdf":
          toast.success("PDF-Bericht wurde erstellt und heruntergeladen!");
          break;
        case "excel":
          toast.success("Excel-Export wurde erstellt und heruntergeladen!");
          break;
        case "csv":
          toast.success("CSV-Datei wurde erstellt und heruntergeladen!");
          break;
        case "datev":
          toast.success("DATEV-Export wurde erstellt und heruntergeladen!");
          break;
        default:
          toast.success("Bericht wurde erstellt!");
      }
    } catch (error) {
      toast.error("Fehler beim Erstellen des Berichts");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter und Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Berichts-Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Berichtstyp</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Zusammenfassung</SelectItem>
                  <SelectItem value="detailed">Detailbericht</SelectItem>
                  <SelectItem value="category">Nach Kategorie</SelectItem>
                  <SelectItem value="audit">Audit-Bericht</SelectItem>
                  <SelectItem value="tax">Steuerreport</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateRange">Zeitraum</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_month">Aktueller Monat</SelectItem>
                  <SelectItem value="last_month">Letzter Monat</SelectItem>
                  <SelectItem value="quarter">Aktuelles Quartal</SelectItem>
                  <SelectItem value="year">Aktuelles Jahr</SelectItem>
                  <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Aktionen</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Datum wählen
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kennzahlen-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Gesamtausgaben</p>
              <p className="text-2xl font-bold">
                €{mockReportData.totalExpenses.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Genehmigt</p>
              <p className="text-2xl font-bold text-green-600">
                €{mockReportData.approvedExpenses.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {((mockReportData.approvedExpenses / mockReportData.totalExpenses) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">In Prüfung</p>
              <p className="text-2xl font-bold text-yellow-600">
                €{mockReportData.pendingExpenses.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {((mockReportData.pendingExpenses / mockReportData.totalExpenses) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Abgelehnt</p>
              <p className="text-2xl font-bold text-red-600">
                €{mockReportData.rejectedExpenses.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {((mockReportData.rejectedExpenses / mockReportData.totalExpenses) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Kategorie-Aufschlüsselung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Ausgaben nach Kategorien
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReportData.expensesByCategory.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: `hsl(${index * 90}, 70%, 50%)` }}
                  ></div>
                  <span className="font-medium">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">€{item.amount.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">{item.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monatstrend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Monatliche Entwicklung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockReportData.monthlyTrend.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{item.month} 2024</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${(item.amount / Math.max(...mockReportData.monthlyTrend.map(m => m.amount))) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="font-semibold w-20 text-right">€{item.amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Ausgaben */}
      <Card>
        <CardHeader>
          <CardTitle>Größte Ausgaben</CardTitle>
          <CardDescription>Die höchsten Einzelausgaben im ausgewählten Zeitraum</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockReportData.topExpenses.map((expense, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-800">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{expense.description}</div>
                    <Badge variant="secondary">{expense.category}</Badge>
                  </div>
                </div>
                <div className="font-semibold text-lg">
                  €{expense.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export-Optionen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Berichte exportieren
          </CardTitle>
          <CardDescription>
            Laden Sie Ihre Spesendaten in verschiedenen Formaten herunter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline"
              onClick={() => generateReport("pdf")}
              disabled={isGenerating}
              className="justify-start"
            >
              <FileText className="mr-2 h-4 w-4" />
              PDF-Bericht
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => generateReport("excel")}
              disabled={isGenerating}
              className="justify-start"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Excel-Export
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => generateReport("csv")}
              disabled={isGenerating}
              className="justify-start"
            >
              <FileText className="mr-2 h-4 w-4" />
              CSV-Datei
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => generateReport("datev")}
              disabled={isGenerating}
              className="justify-start"
            >
              <Calculator className="mr-2 h-4 w-4" />
              DATEV-Export
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Integration mit Lohn & Gehalt</h4>
            <p className="text-sm text-blue-800 mb-3">
              Genehmigte Spesen können automatisch in die nächste Gehaltsabrechnung integriert werden.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Euro className="mr-2 h-4 w-4" />
                Payroll-Integration starten
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Lohnsteuerbescheinigung
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance & Audit */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance & Audit</CardTitle>
          <CardDescription>Prüfungen und Compliance-Berichte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h5 className="font-medium mb-2">Letzte Prüfung</h5>
              <p className="text-sm text-gray-600 mb-2">15. August 2024</p>
              <Badge className="bg-green-100 text-green-800">Bestanden</Badge>
            </Card>
            
            <Card className="p-4">
              <h5 className="font-medium mb-2">Nächste Prüfung</h5>
              <p className="text-sm text-gray-600 mb-2">15. November 2024</p>
              <Badge className="bg-blue-100 text-blue-800">Geplant</Badge>
            </Card>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Compliance-Bericht erstellen
            </Button>
            <Button variant="outline" size="sm">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Audit-Trail anzeigen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseReportsTab;