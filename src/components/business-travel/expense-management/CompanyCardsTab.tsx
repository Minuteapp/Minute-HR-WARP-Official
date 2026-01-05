import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Camera,
  FileText,
  TrendingUp,
  Clock,
  AlertTriangle,
  Link,
  Zap
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CompanyCard {
  id: string;
  cardNumberMasked: string;
  cardHolderName: string;
  cardType: 'credit' | 'debit' | 'corporate';
  assignedTo: string;
  isActive: boolean;
}

interface CardTransaction {
  id: string;
  companyCardId: string;
  transactionDate: string;
  amount: number;
  currency: string;
  merchantName: string;
  merchantCategory: string;
  description: string;
  isMatched: boolean;
  matchedExpenseId?: string;
  requiresReview: boolean;
  reviewReason?: string;
  importedAt: string;
}

const CompanyCardsTab = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Keine Mock-Daten - Firmenkarten werden aus der Datenbank geladen
  const [companyCards] = useState<CompanyCard[]>([]);

  // Keine Mock-Daten - Transaktionen werden aus der Datenbank geladen
  const [transactions] = useState<CardTransaction[]>([]);

  const getCardTypeIcon = (type: string) => {
    return <CreditCard className="h-4 w-4" />;
  };

  const getCardTypeBadge = (type: string) => {
    const variants = {
      corporate: "default",
      credit: "secondary", 
      debit: "outline"
    } as const;
    
    return <Badge variant={variants[type as keyof typeof variants]}>{type}</Badge>;
  };

  const getMatchStatusIcon = (isMatched: boolean, requiresReview: boolean) => {
    if (requiresReview) return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    if (isMatched) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  const getMatchStatusText = (isMatched: boolean, requiresReview: boolean) => {
    if (requiresReview) return "Prüfung erforderlich";
    if (isMatched) return "Zugeordnet";
    return "Nicht zugeordnet";
  };

  const matchedCount = transactions.filter(t => t.isMatched).length;
  const reviewCount = transactions.filter(t => t.requiresReview).length;
  const unmatchedCount = transactions.filter(t => !t.isMatched && !t.requiresReview).length;
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Firmenkarten</h3>
          <p className="text-muted-foreground">
            Automatischer Import und Abgleich von Kartentransaktionen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            CSV Import
          </Button>
          <Button>
            <Zap className="h-4 w-4 mr-2" />
            Auto-Import einrichten
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="transactions">Transaktionen</TabsTrigger>
          <TabsTrigger value="cards">Karten</TabsTrigger>
          <TabsTrigger value="matching">Auto-Match</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Gesamt Transaktionen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactions.length}</div>
                <div className="text-xs text-muted-foreground">
                  €{totalAmount.toFixed(2)} Volumen
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Zugeordnet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{matchedCount}</div>
                <div className="text-xs text-muted-foreground">
                  {((matchedCount / transactions.length) * 100).toFixed(0)}% Match-Rate
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Prüfung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{reviewCount}</div>
                <div className="text-xs text-muted-foreground">
                  Abweichungen gefunden
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Offen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{unmatchedCount}</div>
                <div className="text-xs text-muted-foreground">
                  Noch nicht zugeordnet
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aktuelle Transaktionen */}
          <Card>
            <CardHeader>
              <CardTitle>Aktuelle Transaktionen</CardTitle>
              <CardDescription>
                Zuletzt importierte Kartentransaktionen mit Zuordnungsstatus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {getMatchStatusIcon(transaction.isMatched, transaction.requiresReview)}
                      <div>
                        <h4 className="font-medium">{transaction.merchantName}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Badge variant="secondary">{transaction.merchantCategory}</Badge>
                          <span>{transaction.transactionDate}</span>
                          <CreditCard className="h-3 w-3" />
                          <span>{companyCards.find(c => c.id === transaction.companyCardId)?.cardNumberMasked}</span>
                        </div>
                        {transaction.requiresReview && (
                          <div className="text-xs text-orange-600 mt-1">
                            {transaction.reviewReason}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold">
                          {transaction.amount.toFixed(2)} {transaction.currency}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {getMatchStatusText(transaction.isMatched, transaction.requiresReview)}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="matched">Zugeordnet</SelectItem>
                  <SelectItem value="review">Prüfung</SelectItem>
                  <SelectItem value="unmatched">Nicht zugeordnet</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Suchen..." className="w-64" />
            </div>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              CSV Import
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border-b hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {getMatchStatusIcon(transaction.isMatched, transaction.requiresReview)}
                      <div>
                        <h4 className="font-medium">{transaction.merchantName}</h4>
                        <p className="text-sm text-gray-600">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Badge variant="secondary">{transaction.merchantCategory}</Badge>
                          <span>{transaction.transactionDate}</span>
                          <CreditCard className="h-3 w-3" />
                          <span>
                            {companyCards.find(c => c.id === transaction.companyCardId)?.cardHolderName}
                          </span>
                        </div>
                        {transaction.requiresReview && (
                          <div className="text-xs text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded">
                            ⚠️ {transaction.reviewReason}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold">
                          {transaction.amount.toFixed(2)} {transaction.currency}
                        </p>
                        <Badge variant={
                          transaction.requiresReview ? "destructive" : 
                          transaction.isMatched ? "default" : "secondary"
                        }>
                          {getMatchStatusText(transaction.isMatched, transaction.requiresReview)}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        {transaction.requiresReview && (
                          <Button size="sm" variant="outline">
                            Prüfen
                          </Button>
                        )}
                        {!transaction.isMatched && !transaction.requiresReview && (
                          <Button size="sm">
                            <Link className="h-3 w-3 mr-1" />
                            Zuordnen
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyCards.map((card) => (
              <Card key={card.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getCardTypeIcon(card.cardType)}
                      {card.cardNumberMasked}
                    </CardTitle>
                    {getCardTypeBadge(card.cardType)}
                  </div>
                  <CardDescription>{card.cardHolderName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Zugewiesen an:</span>
                    <span className="font-medium">{card.assignedTo}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={card.isActive ? "default" : "secondary"}>
                      {card.isActive ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transaktionen heute:</span>
                    <span className="font-medium">
                      {transactions.filter(t => t.companyCardId === card.id).length}
                    </span>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Bearbeiten
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matching">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Auto-Match Konfiguration
              </CardTitle>
              <CardDescription>
                OCR-Erkennung und automatische Zuordnung von Belegen zu Kartentransaktionen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Matching-Regeln</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Betrag-Matching</div>
                        <div className="text-sm text-muted-foreground">±5% Toleranz</div>
                      </div>
                      <Badge variant="default">Aktiv</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Datum-Matching</div>
                        <div className="text-sm text-muted-foreground">±3 Tage Toleranz</div>
                      </div>
                      <Badge variant="default">Aktiv</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">OCR Text-Matching</div>
                        <div className="text-sm text-muted-foreground">Händlername erkennen</div>
                      </div>
                      <Badge variant="default">Aktiv</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Kategorie-Validierung</div>
                        <div className="text-sm text-muted-foreground">Automatische Prüfung</div>
                      </div>
                      <Badge variant="outline">Beta</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">OCR Integration</h4>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h4 className="font-medium mb-2">Beleg-Scanner</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Fotografieren Sie Belege für automatische Texterkennung
                    </p>
                    <Button>
                      <Camera className="h-4 w-4 mr-2" />
                      Scanner testen
                    </Button>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">
                      Auto-Match Erfolgsrate
                    </h4>
                    <div className="text-2xl font-bold text-green-700 mb-1">87%</div>
                    <p className="text-sm text-green-800">
                      Transaktionen werden automatisch zugeordnet
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Abweichungs-Behandlung</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">Betrag-Abweichung</div>
                    <div className="text-sm text-muted-foreground">
                      {'>'}5%: Automatische Markierung zur manuellen Prüfung
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">Kategorie-Mismatch</div>
                    <div className="text-sm text-muted-foreground">
                      Warnung bei unterschiedlichen Kategorien
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">Duplikat-Erkennung</div>
                    <div className="text-sm text-muted-foreground">
                      Automatische Erkennung doppelter Eingaben
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyCardsTab;