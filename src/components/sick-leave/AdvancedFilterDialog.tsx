import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface AdvancedFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdvancedFilterDialog = ({ open, onOpenChange }: AdvancedFilterDialogProps) => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Erweiterte Filter</DialogTitle>
          <p className="text-sm text-gray-600">
            Filtern Sie Krankmeldungen nach Standort, Team, Dauer, Status und weiteren Kriterien.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Standort */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Standort</Label>
            <div className="grid grid-cols-4 gap-3">
              {['Berlin', 'München', 'Hamburg', 'Köln', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig'].map((location) => (
                <div key={location} className="flex items-center space-x-2">
                  <Checkbox id={`location-${location}`} />
                  <label htmlFor={`location-${location}`} className="text-sm">{location}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Team / Abteilung */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Team / Abteilung</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                'Produktion Team A', 'Produktion Team B', 'Marketing',
                'IT & Development', 'Vertrieb Nord', 'Vertrieb Süd',
                'Kundenservice', 'Logistik', 'Finanzen', 'HR'
              ].map((team) => (
                <div key={team} className="flex items-center space-x-2">
                  <Checkbox id={`team-${team}`} />
                  <label htmlFor={`team-${team}`} className="text-sm">{team}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Krankheitsdauer */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Krankheitsdauer</Label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Alle Dauern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Dauern</SelectItem>
                <SelectItem value="1-3">1-3 Tage</SelectItem>
                <SelectItem value="4-7">4-7 Tage</SelectItem>
                <SelectItem value="8+">8+ Tage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Atteststatus */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Atteststatus</Label>
            <div className="grid grid-cols-4 gap-3">
              {['Eingereicht', 'Ausstehend', 'Abgelehnt', 'Nicht erforderlich'].map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox id={`attest-${status}`} />
                  <label htmlFor={`attest-${status}`} className="text-sm">{status}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Mitarbeitergruppe */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Mitarbeitergruppe</Label>
            <div className="grid grid-cols-3 gap-3">
              {['Vollzeit', 'Teilzeit', 'Befristet'].map((group) => (
                <div key={group} className="flex items-center space-x-2">
                  <Checkbox id={`group-${group}`} />
                  <label htmlFor={`group-${group}`} className="text-sm">{group}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Arbeitsbereich */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Arbeitsbereich</Label>
            <div className="grid grid-cols-4 gap-3">
              {['Büro', 'Produktion', 'Schichtarbeit', 'Außendienst'].map((area) => (
                <div key={area} className="flex items-center space-x-2">
                  <Checkbox id={`area-${area}`} />
                  <label htmlFor={`area-${area}`} className="text-sm">{area}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Häufigkeit */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Häufigkeit</Label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Alle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="first">Erstmalig</SelectItem>
                <SelectItem value="recurring">Wiederkehrend</SelectItem>
                <SelectItem value="frequent">Häufig (&gt;3x)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* KI-Erkennungen */}
          <div>
            <Label className="text-sm font-medium mb-2 block">KI-Erkennungen</Label>
            <div className="grid grid-cols-3 gap-3">
              {['Cluster-Verdacht', 'Muster erkannt', 'Prognose-Risiko'].map((ai) => (
                <div key={ai} className="flex items-center space-x-2">
                  <Checkbox id={`ai-${ai}`} />
                  <label htmlFor={`ai-${ai}`} className="text-sm">{ai}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Spezifischer Zeitraum */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Spezifischer Zeitraum</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Von</Label>
                <Button variant="outline" size="sm" className="w-full justify-start text-gray-500">
                  Datum wählen
                </Button>
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Bis</Label>
                <Button variant="outline" size="sm" className="w-full justify-start text-gray-500">
                  Datum wählen
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zurücksetzen
          </Button>
          <Button className="bg-gray-900 hover:bg-gray-800" onClick={() => onOpenChange(false)}>
            Filter anwenden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
