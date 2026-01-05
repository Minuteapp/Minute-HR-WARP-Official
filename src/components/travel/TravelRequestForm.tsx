import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, MapPin, Euro, Car, Train, Plane, Bus } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

interface User {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface TravelRequestFormProps {
  user: User;
  onSubmit: () => void;
}

export function TravelRequestForm({ user, onSubmit }: TravelRequestFormProps) {
  const [formData, setFormData] = useState({
    purpose: '',
    purposeType: '',
    destination: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    startTime: '09:00',
    endTime: '17:00',
    transport: '',
    needsHotel: false,
    hotelDetails: '',
    needsAdvance: false,
    advanceAmount: '',
    costCenter: 'MKT-001',
    projectCode: '',
    additionalNotes: ''
  });

  const [showCalendar, setShowCalendar] = useState<'start' | 'end' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reiseantrag eingereicht:', formData);
    onSubmit();
  };

  const transportOptions = [
    { value: 'car', label: 'Privat-PKW', icon: Car },
    { value: 'train', label: 'Bahn', icon: Train },
    { value: 'plane', label: 'Flugzeug', icon: Plane },
    { value: 'public', label: 'ÖPNV', icon: Bus },
    { value: 'rental', label: 'Mietwagen', icon: Car },
    { value: 'taxi', label: 'Taxi', icon: Car }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Reisedetails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose-type">Reisezweck</Label>
              <Select value={formData.purposeType} onValueChange={(value) => setFormData({...formData, purposeType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Zweck auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Kundenbesuch</SelectItem>
                  <SelectItem value="trade-show">Messe</SelectItem>
                  <SelectItem value="training">Schulung</SelectItem>
                  <SelectItem value="internal">Internes Meeting</SelectItem>
                  <SelectItem value="conference">Konferenz</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Beschreibung des Reisezwecks</Label>
              <Textarea
                id="purpose"
                placeholder="Detaillierte Beschreibung..."
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Reiseziel</Label>
              <Input
                id="destination"
                placeholder="Stadt, Land oder vollständige Adresse"
                value={formData.destination}
                onChange={(e) => setFormData({...formData, destination: e.target.value})}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Zeitraum
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Startdatum</Label>
                <Popover open={showCalendar === 'start'} onOpenChange={(open) => setShowCalendar(open ? 'start' : null)}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => {
                        setFormData({...formData, startDate: date});
                        setShowCalendar(null);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Enddatum</Label>
                <Popover open={showCalendar === 'end'} onOpenChange={(open) => setShowCalendar(open ? 'end' : null)}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => {
                        setFormData({...formData, endDate: date});
                        setShowCalendar(null);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start-time">Startzeit</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time">Endzeit</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transportmittel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {transportOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={option.value}
                  name="transport"
                  value={option.value}
                  checked={formData.transport === option.value}
                  onChange={(e) => setFormData({...formData, transport: e.target.value})}
                  className="sr-only"
                />
                <Label
                  htmlFor={option.value}
                  className={`flex items-center gap-2 p-3 border rounded-md cursor-pointer transition-colors ${
                    formData.transport === option.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Unterkunft</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="needs-hotel"
                checked={formData.needsHotel}
                onCheckedChange={(checked) => setFormData({...formData, needsHotel: !!checked})}
              />
              <Label htmlFor="needs-hotel">Hotelbuchung erforderlich</Label>
            </div>

            {formData.needsHotel && (
              <div className="space-y-2">
                <Label htmlFor="hotel-details">Hoteldetails / Präferenzen</Label>
                <Textarea
                  id="hotel-details"
                  placeholder="Gewünschte Hotelkette, Zimmerkategorie, besondere Wünsche..."
                  value={formData.hotelDetails}
                  onChange={(e) => setFormData({...formData, hotelDetails: e.target.value})}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Finanzen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="needs-advance"
                checked={formData.needsAdvance}
                onCheckedChange={(checked) => setFormData({...formData, needsAdvance: !!checked})}
              />
              <Label htmlFor="needs-advance">Vorschuss beantragen</Label>
            </div>

            {formData.needsAdvance && (
              <div className="space-y-2">
                <Label htmlFor="advance-amount">Vorschussbetrag (€)</Label>
                <Input
                  id="advance-amount"
                  type="number"
                  placeholder="0,00"
                  value={formData.advanceAmount}
                  onChange={(e) => setFormData({...formData, advanceAmount: e.target.value})}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cost-center">Kostenstelle</Label>
              <Select value={formData.costCenter} onValueChange={(value) => setFormData({...formData, costCenter: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MKT-001">Marketing (MKT-001)</SelectItem>
                  <SelectItem value="SAL-001">Vertrieb (SAL-001)</SelectItem>
                  <SelectItem value="DEV-001">Entwicklung (DEV-001)</SelectItem>
                  <SelectItem value="ADM-001">Administration (ADM-001)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-code">Projektcode (optional)</Label>
              <Input
                id="project-code"
                placeholder="z.B. PROJ-2024-001"
                value={formData.projectCode}
                onChange={(e) => setFormData({...formData, projectCode: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zusätzliche Informationen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="additional-notes">Anmerkungen</Label>
            <Textarea
              id="additional-notes"
              placeholder="Weitere wichtige Informationen zur Reise..."
              value={formData.additionalNotes}
              onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Entwurf speichern
        </Button>
        <Button type="submit">
          Reiseantrag einreichen
        </Button>
      </div>
    </form>
  );
}