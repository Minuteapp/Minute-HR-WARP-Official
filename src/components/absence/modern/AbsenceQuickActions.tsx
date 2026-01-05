import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  CalendarDays, 
  Stethoscope, 
  Baby, 
  Briefcase, 
  Clock,
  Users,
  FileText,
  Zap,
  Heart,
  Plane,
  GraduationCap,
  Home
} from 'lucide-react';
import { QuickAbsenceForm } from './QuickAbsenceForm';
import { supabase } from '@/integrations/supabase/client';

export const AbsenceQuickActions: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [absenceTypes, setAbsenceTypes] = useState<any[]>([]);

  useEffect(() => {
    loadAbsenceTypes();
  }, []);

  const loadAbsenceTypes = async () => {
    try {
      const { data } = await supabase
        .from('absence_types')
        .select('*')
        .order('name');

      const typesWithIcons = data?.map(type => ({
        ...type,
        key: canonicalKeyForName(type.name),
        icon: getIconForType(type.name.toLowerCase()),
        label: type.name,
        description: getDescriptionForType(type.name.toLowerCase())
      })) || [];

      setAbsenceTypes(typesWithIcons);
    } catch (error) {
      console.error('Error loading absence types:', error);
      // Fallback zu Standard-Typen
      setAbsenceTypes([
        {
          id: 'vacation',
          key: 'vacation',
          name: 'Urlaub',
          icon: CalendarDays,
          color: 'text-blue-600',
          label: 'Urlaub',
          description: 'Erholungsurlaub beantragen'
        },
        {
          id: 'sick',
          key: 'sick',
          name: 'Krankmeldung',
          icon: Stethoscope,
          color: 'text-red-600',
          label: 'Krankmeldung',
          description: 'Krankheitsbedingte Abwesenheit'
        }
      ]);
    }
  };

  const getIconForType = (typeName: string) => {
    const iconMap: { [key: string]: any } = {
      'urlaub': CalendarDays,
      'vacation': CalendarDays,
      'krank': Stethoscope,
      'sick': Stethoscope,
      'krankmeldung': Stethoscope,
      'elternzeit': Baby,
      'parental': Baby,
      'dienstreise': Briefcase,
      'business': Briefcase,
      'weiterbildung': GraduationCap,
      'training': GraduationCap,
      'homeoffice': Home,
      'remote': Home,
      'sonderurlaub': Heart,
      'special': Heart
    };
    return iconMap[typeName] || FileText;
  };

  const getDescriptionForType = (typeName: string) => {
    const descMap: { [key: string]: string } = {
      'urlaub': 'Erholungsurlaub beantragen',
      'vacation': 'Erholungsurlaub beantragen',
      'krank': 'Krankheitsbedingte Abwesenheit',
      'sick': 'Krankheitsbedingte Abwesenheit',
      'krankmeldung': 'Krankheitsbedingte Abwesenheit',
      'elternzeit': 'Elternzeit beantragen',
      'parental': 'Elternzeit beantragen',
      'dienstreise': 'Geschäftsreise anmelden',
      'business': 'Geschäftsreise anmelden',
      'weiterbildung': 'Schulung/Weiterbildung',
      'training': 'Schulung/Weiterbildung',
      'homeoffice': 'Homeoffice-Tag',
      'remote': 'Homeoffice-Tag',
      'sonderurlaub': 'Sonderurlaub beantragen',
      'special': 'Sonderurlaub beantragen'
    };
    return descMap[typeName] || 'Abwesenheit beantragen';
  };

  const canonicalKeyForName = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('urlaub')) return 'vacation';
    if (n.includes('krank')) return 'sick';
    if (n.includes('home')) return 'homeoffice';
    if (n.includes('dienst') || n.includes('reise')) return 'business_trip';
    if (n.includes('fortbildung') || n.includes('weiterbildung') || n.includes('training')) return 'training';
    return n.replace(/\s+/g, '_');
  };

  const handleQuickAction = (type: string) => {
    setSelectedType(type);
    setIsDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Schnell-Antrag
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 p-2">
          <div className="space-y-2">
            <div className="px-2 py-1">
              <h4 className="font-medium text-sm text-slate-700">Abwesenheit beantragen</h4>
              <p className="text-xs text-slate-500">Wählen Sie einen Abwesenheitstyp</p>
            </div>
            <DropdownMenuSeparator />
            
            {absenceTypes.map((type) => (
              <DropdownMenuItem
                key={type.key || type.id}
                onClick={() => handleQuickAction(type.key || type.id)}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 rounded-lg"
              >
                <div className={`p-2 rounded-full bg-slate-100`}>
                  <type.icon className={`h-4 w-4 ${type.color || ''}`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-slate-500">{type.description}</div>
                </div>
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            
            {absenceTypes.length === 0 && (
              <div className="px-2 py-4 text-center text-sm text-slate-500">
                Keine Abwesenheitstypen verfügbar
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Schnell-Antrag: {absenceTypes.find(t => (t.key === selectedType) || (t.id === selectedType))?.label}
            </DialogTitle>
          </DialogHeader>
          <QuickAbsenceForm 
            type={selectedType}
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};