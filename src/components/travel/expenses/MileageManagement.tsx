import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Textarea } from "../../ui/textarea";
import { Plus, Car, Calculator, Route } from "lucide-react";

interface User {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface MileageManagementProps {
  user: User;
}

interface MileageRate {
  id: string;
  vehicleType: string;
  ratePerKm: number;
  currency: string;
  validFrom: string;
  validTo?: string;
  isActive: boolean;
  description?: string;
}

interface MileageCalculation {
  id: string;
  from: string;
  to: string;
  distance: number;
  vehicleType: string;
  ratePerKm: number;
  totalAmount: number;
  date: string;
  purpose: string;
}

const defaultMileageRates: MileageRate[] = [
  { 
    id: '1', 
    vehicleType: 'PKW', 
    ratePerKm: 0.30, 
    currency: 'EUR', 
    validFrom: '2024-01-01', 
    isActive: true,
    description: 'Standard PKW-Pauschale für Geschäftsfahrten'
  },
  { 
    id: '2', 
    vehicleType: 'Motorrad', 
    ratePerKm: 0.24, 
    currency: 'EUR', 
    validFrom: '2024-01-01', 
    isActive: true,
    description: 'Motorrad-Pauschale für Geschäftsfahrten'
  },
  { 
    id: '3', 
    vehicleType: 'Elektroauto', 
    ratePerKm: 0.25, 
    currency: 'EUR', 
    validFrom: '2024-01-01', 
    isActive: true,
    description: 'Reduzierte Pauschale für Elektrofahrzeuge'
  }
];

export function MileageManagement({ user }: MileageManagementProps) {
  const [mileageRates, setMileageRates] = useState<MileageRate[]>(defaultMileageRates);
  const [calculations, setCalculations] = useState<MileageCalculation[]>([]);
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const [isCalcDialogOpen, setIsCalcDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'rates' | 'calculator'>('rates');
  
  const [newRate, setNewRate] = useState({
    vehicleType: '',
    ratePerKm: 0,
    currency: 'EUR',
    validFrom: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [newCalculation, setNewCalculation] = useState({
    from: '',
    to: '',
    distance: 0,
    vehicleType: 'PKW',
    purpose: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSaveRate = () => {
    const rate: MileageRate = {
      id: Date.now().toString(),
      ...newRate,
      isActive: true
    };
    setMileageRates([...mileageRates, rate]);
    setIsRateDialogOpen(false);
    setNewRate({
      vehicleType: '',
      ratePerKm: 0,
      currency: 'EUR',
      validFrom: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const handleCalculateMileage = () => {
    const rate = mileageRates.find(r => r.vehicleType === newCalculation.vehicleType && r.isActive)?.ratePerKm || 0.30;
    const calculation: MileageCalculation = {
      id: Date.now().toString(),
      ...newCalculation,
      ratePerKm: rate,
      totalAmount: newCalculation.distance * rate
    };
    setCalculations([...calculations, calculation]);
    setIsCalcDialogOpen(false);
    setNewCalculation({
      from: '',
      to: '',
      distance: 0,
      vehicleType: 'PKW',
      purpose: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const toggleRateStatus = (id: string) => {
    setMileageRates(mileageRates.map(rate =>
      rate.id === id ? { ...rate, isActive: !rate.isActive } : rate
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'rates' ? 'default' : 'outline'}
          onClick={() => setActiveTab('rates')}
        >
          <Car className="h-4 w-4 mr-2" />
          Kilometerpreise
        </Button>
        <Button
          variant={activeTab === 'calculator' ? 'default' : 'outline'}
          onClick={() => setActiveTab('calculator')}
        >
          <Calculator className="h-4 w-4 mr-2" />
          Kilometer-Rechner
        </Button>
      </div>

      {activeTab === 'rates' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Kilometer-Pauschalen
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Verwalten Sie Kilometerpauschalen für verschiedene Fahrzeugtypen
                </p>
              </div>
              <Dialog open={isRateDialogOpen} onOpenChange={setIsRateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Neue Pauschale
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Neue Kilometer-Pauschale</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleType">Fahrzeugtyp</Label>
                      <Select 
                        value={newRate.vehicleType} 
                        onValueChange={(value) => setNewRate({ ...newRate, vehicleType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Fahrzeugtyp wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PKW">PKW</SelectItem>
                          <SelectItem value="Motorrad">Motorrad</SelectItem>
                          <SelectItem value="Elektroauto">Elektroauto</SelectItem>
                          <SelectItem value="Hybridfahrzeug">Hybridfahrzeug</SelectItem>
                          <SelectItem value="LKW">LKW</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ratePerKm">Preis pro km</Label>
                        <Input
                          id="ratePerKm"
                          type="number"
                          step="0.01"
                          value={newRate.ratePerKm}
                          onChange={(e) => setNewRate({ ...newRate, ratePerKm: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Währung</Label>
                        <Select 
                          value={newRate.currency} 
                          onValueChange={(value) => setNewRate({ ...newRate, currency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="CHF">CHF</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
                    <div className="space-y-2">
                      <Label htmlFor="description">Beschreibung</Label>
                      <Textarea
                        id="description"
                        value={newRate.description}
                        onChange={(e) => setNewRate({ ...newRate, description: e.target.value })}
                        placeholder="Beschreibung der Pauschale..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRateDialogOpen(false)}>
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
                  <TableHead>Fahrzeugtyp</TableHead>
                  <TableHead>Preis pro km</TableHead>
                  <TableHead>Gültig ab</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mileageRates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rate.vehicleType}</div>
                        {rate.description && (
                          <div className="text-sm text-muted-foreground">{rate.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{rate.ratePerKm.toFixed(2)} {rate.currency}/km</TableCell>
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
      )}

      {activeTab === 'calculator' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Kilometer-Rechner
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Berechnen Sie Fahrtkosten basierend auf Entfernung und Fahrzeugtyp
                </p>
              </div>
              <Dialog open={isCalcDialogOpen} onOpenChange={setIsCalcDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Neue Berechnung
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Fahrtkosten berechnen</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="from">Von</Label>
                        <Input
                          id="from"
                          value={newCalculation.from}
                          onChange={(e) => setNewCalculation({ ...newCalculation, from: e.target.value })}
                          placeholder="Startort"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="to">Nach</Label>
                        <Input
                          id="to"
                          value={newCalculation.to}
                          onChange={(e) => setNewCalculation({ ...newCalculation, to: e.target.value })}
                          placeholder="Zielort"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="distance">Entfernung (km)</Label>
                        <Input
                          id="distance"
                          type="number"
                          step="0.1"
                          value={newCalculation.distance}
                          onChange={(e) => setNewCalculation({ ...newCalculation, distance: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="calcVehicleType">Fahrzeugtyp</Label>
                        <Select 
                          value={newCalculation.vehicleType} 
                          onValueChange={(value) => setNewCalculation({ ...newCalculation, vehicleType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {mileageRates.filter(rate => rate.isActive).map(rate => (
                              <SelectItem key={rate.id} value={rate.vehicleType}>
                                {rate.vehicleType} ({rate.ratePerKm.toFixed(2)} {rate.currency}/km)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="calcDate">Datum</Label>
                      <Input
                        id="calcDate"
                        type="date"
                        value={newCalculation.date}
                        onChange={(e) => setNewCalculation({ ...newCalculation, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Zweck der Fahrt</Label>
                      <Input
                        id="purpose"
                        value={newCalculation.purpose}
                        onChange={(e) => setNewCalculation({ ...newCalculation, purpose: e.target.value })}
                        placeholder="z.B. Kundentermin, Meeting"
                      />
                    </div>
                    {newCalculation.distance > 0 && (
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Geschätzte Kosten:</div>
                        <div className="text-2xl font-bold">
                          {(newCalculation.distance * (mileageRates.find(r => r.vehicleType === newCalculation.vehicleType && r.isActive)?.ratePerKm || 0.30)).toFixed(2)} EUR
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCalcDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button onClick={handleCalculateMileage}>
                      Berechnung hinzufügen
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {calculations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
                Noch keine Berechnungen vorhanden
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Entfernung</TableHead>
                    <TableHead>Fahrzeugtyp</TableHead>
                    <TableHead>Preis/km</TableHead>
                    <TableHead>Gesamtkosten</TableHead>
                    <TableHead>Datum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculations.map((calc) => (
                    <TableRow key={calc.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{calc.from} → {calc.to}</div>
                          <div className="text-sm text-muted-foreground">{calc.purpose}</div>
                        </div>
                      </TableCell>
                      <TableCell>{calc.distance} km</TableCell>
                      <TableCell>{calc.vehicleType}</TableCell>
                      <TableCell>{calc.ratePerKm.toFixed(2)} EUR</TableCell>
                      <TableCell className="font-bold">{calc.totalAmount.toFixed(2)} EUR</TableCell>
                      <TableCell>{new Date(calc.date).toLocaleDateString('de-DE')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}