
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const colorPalettes = [
  { name: 'Standard', primary: '#8B5CF6', secondary: '#06B6D4', accent: '#10B981' },
  { name: 'Professional', primary: '#1E40AF', secondary: '#059669', accent: '#DC2626' },
  { name: 'Warm', primary: '#EA580C', secondary: '#D97706', accent: '#CA8A04' },
  { name: 'Cool', primary: '#0891B2', secondary: '#0284C7', accent: '#7C3AED' }
];

const ColorSettings = () => {
  const { toast } = useToast();
  const [selectedPalette, setSelectedPalette] = useState(0);

  const handleSave = () => {
    toast({
      title: "Farben gespeichert",
      description: "Die Farbeinstellungen wurden erfolgreich gespeichert."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Farbpaletten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colorPalettes.map((palette, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPalette === index ? 'border-primary' : 'border-gray-200'
                }`}
                onClick={() => setSelectedPalette(index)}
              >
                <div className="flex items-center justify-between mb-3">
                  <Label className="font-medium">{palette.name}</Label>
                  {selectedPalette === index && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: palette.primary }}
                  ></div>
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: palette.secondary }}
                  ></div>
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: palette.accent }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benutzerdefinierte Farben</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Primärfarbe</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-12 h-8 rounded border border-gray-300"
                  defaultValue="#8B5CF6"
                />
                <span className="text-sm text-gray-500">#8B5CF6</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Sekundärfarbe</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-12 h-8 rounded border border-gray-300"
                  defaultValue="#06B6D4"
                />
                <span className="text-sm text-gray-500">#06B6D4</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Akzentfarbe</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-12 h-8 rounded border border-gray-300"
                  defaultValue="#10B981"
                />
                <span className="text-sm text-gray-500">#10B981</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setSelectedPalette(0)}>
          Zurücksetzen
        </Button>
        <Button onClick={handleSave}>Änderungen speichern</Button>
      </div>
    </div>
  );
};

export default ColorSettings;
