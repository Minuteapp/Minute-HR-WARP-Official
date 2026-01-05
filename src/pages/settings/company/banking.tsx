import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BankingPage() {
  const navigate = useNavigate();

  const bankAccounts = [
    {
      id: '1',
      name: 'Hauptkonto',
      bank: 'Deutsche Bank AG',
      iban: 'DE89 3704 0044 0532 0130 00',
      bic: 'COBADEFFXXX',
      type: 'main',
      status: 'active'
    }
  ];

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/settings/company")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zu Unternehmenseinstellungen
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Bankverbindungen & Finanzen</h1>
              <p className="text-muted-foreground mt-2">
                Firmen-Bankkonten und finanzielle Stammdaten
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Bankverbindungen</h2>
            <p className="text-muted-foreground">Verwalten Sie alle Firmen-Bankkonten</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Bankkonto hinzufügen
          </Button>
        </div>

        {/* Bank Accounts */}
        <div className="space-y-4">
          {bankAccounts.map((account) => (
            <Card key={account.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                    <CardDescription>{account.bank}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={account.type === 'main' ? 'default' : 'secondary'}>
                      {account.type === 'main' ? 'Hauptkonto' : 'Nebenkonto'}
                    </Badge>
                    <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                      {account.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">IBAN</div>
                    <div className="font-mono">{account.iban}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">BIC</div>
                    <div className="font-mono">{account.bic}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lohn-Bankkonten</CardTitle>
              <CardDescription>Spezielle Konten für Gehaltszahlungen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Noch keine Lohn-Bankkonten konfiguriert</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zahlungskonditionen</CardTitle>
              <CardDescription>Standard-Zahlungsziele und -bedingungen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Standard Zahlungsziel:</span>
                  <span className="text-sm">30 Tage</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Skonto:</span>
                  <span className="text-sm">2% bei 14 Tagen</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Bearbeiten
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}