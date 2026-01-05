import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Palette, Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AbsenceTypeConfig {
  type: string;
  label: string;
  color: string;
  icon?: string;
  requires_approval: boolean;
  requires_document: boolean;
}

export const AbsenceTypeManagement = () => {
  const { toast } = useToast();
  const [types, setTypes] = useState<AbsenceTypeConfig[]>([
    {
      type: 'vacation',
      label: 'Urlaub',
      color: '#3B82F6',
      icon: '🏖️',
      requires_approval: true,
      requires_document: false
    },
    {
      type: 'sick_leave',
      label: 'Krankheit',
      color: '#EF4444',
      icon: '🤒',
      requires_approval: false,
      requires_document: true
    },
    {
      type: 'parental',
      label: 'Elternzeit',
      color: '#8B5CF6',
      icon: '👶',
      requires_approval: true,
      requires_document: true
    },
    {
      type: 'business_trip',
      label: 'Dienstreise',
      color: '#10B981',
      icon: '✈️',
      requires_approval: true,
      requires_document: false
    },
    {
      type: 'other',
      label: 'Sonstiges',
      color: '#6B7280',
      icon: '📋',
      requires_approval: true,
      requires_document: false
    }
  ]);

  const handleColorChange = (index: number, color: string) => {
    setTypes(prev => {
      const updated = [...prev];
      updated[index].color = color;
      return updated;
    });
  };

  const handleLabelChange = (index: number, label: string) => {
    setTypes(prev => {
      const updated = [...prev];
      updated[index].label = label;
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      // Hier würde man die Typen in der DB speichern
      // Aktuell nur lokale Speicherung
      localStorage.setItem('absence_type_configs', JSON.stringify(types));
      
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Abwesenheitstypen wurden erfolgreich aktualisiert."
      });
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden."
      });
    }
  };

  useEffect(() => {
    // Lade gespeicherte Konfiguration
    const saved = localStorage.getItem('absence_type_configs');
    if (saved) {
      try {
        setTypes(JSON.parse(saved));
      } catch (e) {
        console.error('Fehler beim Laden:', e);
      }
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Abwesenheitstypen verwalten
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Passen Sie die Abwesenheitstypen, Farben und Regeln an Ihre Bedürfnisse an.
        </p>

        {/* Type List */}
        <div className="space-y-3">
          {types.map((type, index) => (
            <div key={type.type} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{type.icon}</span>
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Bezeichnung</Label>
                      <Input
                        value={type.label}
                        onChange={(e) => handleLabelChange(index, e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Farbe</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={type.color}
                          onChange={(e) => handleColorChange(index, e.target.value)}
                          className="h-8 w-16"
                        />
                        <Input
                          type="text"
                          value={type.color}
                          onChange={(e) => handleColorChange(index, e.target.value)}
                          className="h-8 flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Badge 
                      variant={type.requires_approval ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {type.requires_approval ? '✓' : '✗'} Genehmigung
                    </Badge>
                    <Badge 
                      variant={type.requires_document ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {type.requires_document ? '✓' : '✗'} Nachweis
                    </Badge>
                    <Badge
                      variant="outline"
                      style={{ backgroundColor: `${type.color}20`, color: type.color, borderColor: type.color }}
                    >
                      Vorschau
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Hinweis:</strong> Änderungen an den Abwesenheitstypen wirken sich auf alle zukünftigen Anträge aus. 
            Bestehende Anträge behalten ihre ursprünglichen Einstellungen.
          </p>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Einstellungen speichern
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
