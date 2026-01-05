import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Switch } from "../../ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Plus, CreditCard, Lock, AlertCircle, CheckCircle, Settings, Eye, EyeOff, Download } from "lucide-react";

interface User {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface CompanyCardsManagementProps {
  user: User;
}

interface CompanyCard {
  id: string;
  cardNumber: string;
  cardholderName: string;
  department: string;
  cardType: 'virtual' | 'physical' | 'both';
  status: 'active' | 'blocked' | 'expired' | 'pending';
  monthlyLimit: number;
  currentSpent: number;
  validUntil: string;
  lastTransaction?: string;
  issuedDate: string;
}

interface CardTransaction {
  id: string;
  cardId: string;
  amount: number;
  currency: string;
  merchant: string;
  category: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
  receiptRequired: boolean;
  receiptSubmitted: boolean;
}

const mockCards: CompanyCard[] = [];

const mockTransactions: CardTransaction[] = [];

export function CompanyCardsManagement({ user }: CompanyCardsManagementProps) {
  const [cards, setCards] = useState<CompanyCard[]>(mockCards);
  const [transactions, setTransactions] = useState<CardTransaction[]>(mockTransactions);
  const [isNewCardDialogOpen, setIsNewCardDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CompanyCard | null>(null);
  const [activeTab, setActiveTab] = useState<'cards' | 'transactions' | 'limits'>('cards');
  const [showCardNumbers, setShowCardNumbers] = useState(false);

  const [newCard, setNewCard] = useState<{
    cardholderName: string;
    department: string;
    cardType: 'virtual' | 'physical' | 'both';
    monthlyLimit: number;
  }>({
    cardholderName: '',
    department: '',
    cardType: 'virtual',
    monthlyLimit: 1000
  });

  const getStatusBadge = (status: CompanyCard['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Aktiv</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Gesperrt</Badge>;
      case 'expired':
        return <Badge variant="secondary">Abgelaufen</Badge>;
      case 'pending':
        return <Badge variant="outline">Ausstehend</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getUsagePercentage = (spent: number, limit: number) => {
    return Math.min((spent / limit) * 100, 100);
  };

  const handleBlockCard = (cardId: string) => {
    setCards(cards.map(card =>
      card.id === cardId ? { ...card, status: 'blocked' as const } : card
    ));
  };

  const handleUnblockCard = (cardId: string) => {
    setCards(cards.map(card =>
      card.id === cardId ? { ...card, status: 'active' as const } : card
    ));
  };

  const handleCreateCard = () => {
    const card: CompanyCard = {
      id: Date.now().toString(),
      cardNumber: `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}`,
      ...newCard,
      status: 'pending',
      currentSpent: 0,
      validUntil: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      issuedDate: new Date().toISOString().split('T')[0]
    };
    setCards([...cards, card]);
    setIsNewCardDialogOpen(false);
    setNewCard({ cardholderName: '', department: '', cardType: 'virtual', monthlyLimit: 1000 });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Firmenkarten-Verwaltung
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Verwalten Sie Firmenkreditkarten und überwachen Sie Ausgaben
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCardNumbers(!showCardNumbers)}
              >
                {showCardNumbers ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showCardNumbers ? 'Nummern verbergen' : 'Nummern anzeigen'}
              </Button>
              <Dialog open={isNewCardDialogOpen} onOpenChange={setIsNewCardDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Neue Karte
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Neue Firmenkarte beantragen</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardholderName">Karteninhaber</Label>
                      <Input
                        id="cardholderName"
                        value={newCard.cardholderName}
                        onChange={(e) => setNewCard({ ...newCard, cardholderName: e.target.value })}
                        placeholder="Vollständiger Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Abteilung</Label>
                      <Select
                        value={newCard.department}
                        onValueChange={(value) => setNewCard({ ...newCard, department: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Abteilung wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Vertrieb">Vertrieb</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="IT">IT</SelectItem>
                          <SelectItem value="Beratung">Beratung</SelectItem>
                          <SelectItem value="Management">Management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardType">Kartentyp</Label>
                      <Select
                        value={newCard.cardType}
                        onValueChange={(value: 'virtual' | 'physical' | 'both') => setNewCard({ ...newCard, cardType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="virtual">Virtuell</SelectItem>
                          <SelectItem value="physical">Physisch</SelectItem>
                          <SelectItem value="both">Beides</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyLimit">Monatslimit (€)</Label>
                      <Input
                        id="monthlyLimit"
                        type="number"
                        value={newCard.monthlyLimit}
                        onChange={(e) => setNewCard({ ...newCard, monthlyLimit: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewCardDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button onClick={handleCreateCard}>
                      Karte beantragen
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList>
              <TabsTrigger value="cards">Karten</TabsTrigger>
              <TabsTrigger value="transactions">Transaktionen</TabsTrigger>
              <TabsTrigger value="limits">Limits & Kontrollen</TabsTrigger>
            </TabsList>

            <TabsContent value="cards" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                  <Card key={card.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="h-4 w-4" />
                            <span className="font-mono text-sm">
                              {showCardNumbers ? card.cardNumber : card.cardNumber.replace(/\d(?=\d{4})/g, '*')}
                            </span>
                          </div>
                          <h4 className="font-medium">{card.cardholderName}</h4>
                          <p className="text-sm text-muted-foreground">{card.department}</p>
                        </div>
                        {getStatusBadge(card.status)}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Verbrauch diesen Monat</span>
                            <span>{card.currentSpent.toLocaleString('de-DE')} € / {card.monthlyLimit.toLocaleString('de-DE')} €</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                getUsagePercentage(card.currentSpent, card.monthlyLimit) > 90
                                  ? 'bg-red-600'
                                  : getUsagePercentage(card.currentSpent, card.monthlyLimit) > 70
                                  ? 'bg-orange-500'
                                  : 'bg-green-600'
                              }`}
                              style={{ width: `${getUsagePercentage(card.currentSpent, card.monthlyLimit)}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Typ: {card.cardType === 'both' ? 'Virtual & Physisch' : card.cardType === 'virtual' ? 'Virtual' : 'Physisch'}</span>
                          <span>Gültig bis: {new Date(card.validUntil).toLocaleDateString('de-DE')}</span>
                        </div>

                        <div className="flex gap-2 pt-2">
                          {card.status === 'active' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBlockCard(card.id)}
                              className="flex-1"
                            >
                              <Lock className="h-4 w-4 mr-2" />
                              Sperren
                            </Button>
                          ) : card.status === 'blocked' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnblockCard(card.id)}
                              className="flex-1"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Entsperren
                            </Button>
                          ) : null}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCard(card)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Karteninhaber</TableHead>
                    <TableHead>Händler</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Betrag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Beleg</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => {
                    const card = cards.find(c => c.id === transaction.cardId);
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>{new Date(transaction.date).toLocaleDateString('de-DE')}</TableCell>
                        <TableCell>{card?.cardholderName}</TableCell>
                        <TableCell>{transaction.merchant}</TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell className="font-mono">
                          {transaction.amount.toFixed(2)} {transaction.currency}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            transaction.status === 'approved' ? 'success' :
                            transaction.status === 'rejected' ? 'destructive' : 'outline'
                          }>
                            {transaction.status === 'approved' ? 'Genehmigt' :
                             transaction.status === 'rejected' ? 'Abgelehnt' : 'Ausstehend'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.receiptRequired ? (
                            transaction.receiptSubmitted ? (
                              <Badge variant="success">Eingereicht</Badge>
                            ) : (
                              <Badge variant="destructive">Fehlt</Badge>
                            )
                          ) : (
                            <Badge variant="secondary">Nicht erforderlich</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="limits" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Limit-Übersicht</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cards.map((card) => (
                        <div key={card.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{card.cardholderName}</div>
                            <div className="text-sm text-muted-foreground">{card.department}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-sm">
                              {card.currentSpent.toLocaleString('de-DE')} € / {card.monthlyLimit.toLocaleString('de-DE')} €
                            </div>
                            <div className={`text-xs ${
                              getUsagePercentage(card.currentSpent, card.monthlyLimit) > 90 ? 'text-red-600' :
                              getUsagePercentage(card.currentSpent, card.monthlyLimit) > 70 ? 'text-orange-500' : 'text-green-600'
                            }`}>
                              {getUsagePercentage(card.currentSpent, card.monthlyLimit).toFixed(0)}% verbraucht
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Kontrollen & Richtlinien</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Automatische Sperrung bei 100%</div>
                          <div className="text-sm text-muted-foreground">Karte wird automatisch gesperrt bei Limitüberschreitung</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Warnung bei 80%</div>
                          <div className="text-sm text-muted-foreground">E-Mail-Benachrichtigung an Karteninhaber</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Beleg-Erinnerung</div>
                          <div className="text-sm text-muted-foreground">Tägliche Erinnerung für fehlende Belege</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Ausgaben-Kategorien erzwingen</div>
                          <div className="text-sm text-muted-foreground">Kategorisierung bei jeder Transaktion erforderlich</div>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}