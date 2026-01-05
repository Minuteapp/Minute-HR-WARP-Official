
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const languages = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'Englisch' },
  { value: 'fr', label: 'Französisch' },
  { value: 'es', label: 'Spanisch' },
  { value: 'it', label: 'Italienisch' },
];

const dateFormats = [
  { value: 'dd.mm.yyyy', label: 'DD.MM.YYYY' },
  { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY' },
  { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' },
];

const timeFormats = [
  { value: '24h', label: '24 Stunden (14:30)' },
  { value: '12h', label: '12 Stunden (2:30 PM)' },
];

const numberFormats = [
  { value: 'de', label: '1.000,00 (Deutsch)' },
  { value: 'en', label: '1,000.00 (Englisch)' },
];

const LanguageSettings = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('de');
  const [dateFormat, setDateFormat] = useState('dd.mm.yyyy');
  const [timeFormat, setTimeFormat] = useState('24h');
  const [numberFormat, setNumberFormat] = useState('de');
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sprache</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Wählen Sie die Sprache, in der die Anwendung angezeigt werden soll.
          </p>
          <RadioGroup value={selectedLanguage} onValueChange={setSelectedLanguage} className="space-y-4">
            {languages.map((language) => (
              <div key={language.value} className="flex items-center space-x-2">
                <RadioGroupItem value={language.value} id={`language-${language.value}`} />
                <Label htmlFor={`language-${language.value}`}>{language.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Regionale Formate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="date-format">Datumsformat</Label>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger id="date-format" className="w-full">
                <SelectValue placeholder="Datumsformat auswählen" />
              </SelectTrigger>
              <SelectContent>
                {dateFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time-format">Zeitformat</Label>
            <Select value={timeFormat} onValueChange={setTimeFormat}>
              <SelectTrigger id="time-format" className="w-full">
                <SelectValue placeholder="Zeitformat auswählen" />
              </SelectTrigger>
              <SelectContent>
                {timeFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="number-format">Zahlenformat</Label>
            <Select value={numberFormat} onValueChange={setNumberFormat}>
              <SelectTrigger id="number-format" className="w-full">
                <SelectValue placeholder="Zahlenformat auswählen" />
              </SelectTrigger>
              <SelectContent>
                {numberFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline">Zurücksetzen</Button>
            <Button>Änderungen speichern</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSettings;
