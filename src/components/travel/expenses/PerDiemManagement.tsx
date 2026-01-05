import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Plus, MapPin, Euro, Clock } from "lucide-react";

interface User {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface PerDiemManagementProps {
  user: User;
}

interface PerDiemRate {
  id: string;
  country: string;
  city?: string;
  fullDayRate: number;
  halfDayRate: number;
  overnightRate: number;
  currency: string;
  validFrom: string;
  validTo?: string;
  isActive: boolean;
}

const defaultPerDiemRates: PerDiemRate[] = [
  { id: '1', country: 'Deutschland', fullDayRate: 28, halfDayRate: 14, overnightRate: 20, currency: 'EUR', validFrom: '2024-01-01', isActive: true },
  { id: '2', country: 'Deutschland', city: 'München', fullDayRate: 32, halfDayRate: 16, overnightRate: 25, currency: 'EUR', validFrom: '2024-01-01', isActive: true },
  { id: '3', country: 'Deutschland', city: 'Hamburg', fullDayRate: 30, halfDayRate: 15, overnightRate: 22, currency: 'EUR', validFrom: '2024-01-01', isActive: true },
  { id: '4', country: 'Österreich', fullDayRate: 26, halfDayRate: 13, overnightRate: 15, currency: 'EUR', validFrom: '2024-01-01', isActive: true },
  { id: '5', country: 'Schweiz', fullDayRate: 65, halfDayRate: 32.5, overnightRate: 25, currency: 'CHF', validFrom: '2024-01-01', isActive: true },
  { id: '6', country: 'USA', fullDayRate: 55, halfDayRate: 27.5, overnightRate: 30, currency: 'USD', validFrom: '2024-01-01', isActive: true },
  { id: '7', country: 'Vereinigtes Königreich', fullDayRate: 45, halfDayRate: 22.5, overnightRate: 25, currency: 'GBP', validFrom: '2024-01-01', isActive: true }
];

export function PerDiemManagement({ user }: PerDiemManagementProps) {
  const [perDiemRates, setPerDiemRates] = useState<PerDiemRate[]>(defaultPerDiemRates);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRate, setNewRate] = useState({
    country: '',
    city: '',
    fullDayRate: 0,
    halfDayRate: 0,
    overnightRate: 0,
    currency: 'EUR',
    validFrom: new Date().toISOString().split('T')[0]
  });

  const handleSaveRate = () => {
    const rate: PerDiemRate = {
      id: Date.now().toString(),
      ...newRate,
      halfDayRate: newRate.fullDayRate / 2,
      isActive: true
    };
    setPerDiemRates([...perDiemRates, rate]);
    setIsDialogOpen(false);
    setNewRate({
      country: '',
      city: '',
      fullDayRate: 0,
      halfDayRate: 0,
      overnightRate: 0,
      currency: 'EUR',
      validFrom: new Date().toISOString().split('T')[0]
    });
  };

  const toggleRateStatus = (id: string) => {
    setPerDiemRates(perDiemRates.map(rate =>
      rate.id === id ? { ...rate, isActive: !rate.isActive } : rate
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Per-Diem Verwaltung
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Verwalten Sie Tagegeld-Sätze für verschiedene Länder und Städte
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Neuer Satz
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Neuer Per-Diem Satz</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Land</Label>
                    <Input
                      id="country"
                      value={newRate.country}
                      onChange={(e) => setNewRate({ ...newRate, country: e.target.value })}
                      placeholder="z.B. Deutschland"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Stadt (optional)</Label>
                    <Input
                      id="city"
                      value={newRate.city}
                      onChange={(e) => setNewRate({ ...newRate, city: e.target.value })}
                      placeholder="z.B. München"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullDayRate">Ganztags-Satz</Label>
                      <Input
                        id="fullDayRate"
                        type="number"
                        step="0.01"
                        value={newRate.fullDayRate}
                        onChange={(e) => setNewRate({ 
                          ...newRate, 
                          fullDayRate: parseFloat(e.target.value) || 0,
                          halfDayRate: (parseFloat(e.target.value) || 0) / 2
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="overnightRate">Übernachtungspauschale</Label>
                      <Input
                        id="overnightRate"
                        type="number"
                        step="0.01"
                        value={newRate.overnightRate}
                        onChange={(e) => setNewRate({ ...newRate, overnightRate: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Währung</Label>
                      <Select value={newRate.currency} onValueChange={(value) => setNewRate({ ...newRate, currency: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CHF">CHF</SelectItem>
                          <SelectItem value="JPY">JPY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="validFrom">Gültig ab</Label>
                      <Input
                        id="validFrom"
                        type="date"
                        value={newRate.validFrom}
                        onChange={(e) => setNewRate({ ...newRate, validFrom: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleSaveRate}>
                    Erstellen
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Land / Stadt</TableHead>
                <TableHead>Ganztags-Satz</TableHead>
                <TableHead>Halbtags-Satz</TableHead>
                <TableHead>Übernachtung</TableHead>
                <TableHead>Gültig ab</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perDiemRates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{rate.country}</div>
                        {rate.city && <div className="text-sm text-muted-foreground">{rate.city}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{rate.fullDayRate} {rate.currency}</TableCell>
                  <TableCell>{rate.halfDayRate} {rate.currency}</TableCell>
                  <TableCell>{rate.overnightRate} {rate.currency}</TableCell>
                  <TableCell>{new Date(rate.validFrom).toLocaleDateString('de-DE')}</TableCell>
                  <TableCell>
                    <Badge variant={rate.isActive ? "success" : "secondary"}>
                      {rate.isActive ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleRateStatus(rate.id)}
                    >
                      {rate.isActive ? "Deaktivieren" : "Aktivieren"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}