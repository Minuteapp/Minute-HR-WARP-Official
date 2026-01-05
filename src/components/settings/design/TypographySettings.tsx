
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const fontFamilies = [
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'opensans', label: 'Open Sans' },
  { value: 'lato', label: 'Lato' },
  { value: 'arial', label: 'Arial' },
  { value: 'helvetica', label: 'Helvetica' }
];

const TypographySettings = () => {
  const { toast } = useToast();
  const [primaryFont, setPrimaryFont] = useState('inter');
  const [secondaryFont, setSecondaryFont] = useState('roboto');
  const [baseFontSize, setBaseFontSize] = useState([16]);
  const [lineHeight, setLineHeight] = useState([1.5]);

  const handleSave = () => {
    toast({
      title: "Typografie gespeichert",
      description: "Die Typografie-Einstellungen wurden erfolgreich gespeichert."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schriftarten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="primary-font">Primäre Schriftart</Label>
            <Select value={primaryFont} onValueChange={setPrimaryFont}>
              <SelectTrigger id="primary-font">
                <SelectValue placeholder="Schriftart auswählen" />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary-font">Sekundäre Schriftart</Label>
            <Select value={secondaryFont} onValueChange={setSecondaryFont}>
              <SelectTrigger id="secondary-font">
                <SelectValue placeholder="Schriftart auswählen" />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schriftgröße und Abstände</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Basis-Schriftgröße (px)</Label>
            <div className="px-2">
              <Slider
                value={baseFontSize}
                onValueChange={setBaseFontSize}
                max={24}
                min={12}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>12px</span>
                <span className="font-medium">{baseFontSize[0]}px</span>
                <span>24px</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Zeilenhöhe</Label>
            <div className="px-2">
              <Slider
                value={lineHeight}
                onValueChange={setLineHeight}
                max={2}
                min={1}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>1.0</span>
                <span className="font-medium">{lineHeight[0]}</span>
                <span>2.0</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vorschau</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <h1 className="text-2xl font-bold mb-2">Überschrift 1</h1>
            <h2 className="text-xl font-semibold mb-2">Überschrift 2</h2>
            <p className="text-base mb-2">
              Dies ist ein Beispieltext, um die gewählten Typografie-Einstellungen zu demonstrieren. 
              Hier können Sie sehen, wie der Text mit den aktuellen Einstellungen aussieht.
            </p>
            <p className="text-sm text-gray-600">
              Kleinerer Text für zusätzliche Informationen oder Hinweise.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => {
          setPrimaryFont('inter');
          setSecondaryFont('roboto');
          setBaseFontSize([16]);
          setLineHeight([1.5]);
        }}>
          Zurücksetzen
        </Button>
        <Button onClick={handleSave}>Änderungen speichern</Button>
      </div>
    </div>
  );
};

export default TypographySettings;
