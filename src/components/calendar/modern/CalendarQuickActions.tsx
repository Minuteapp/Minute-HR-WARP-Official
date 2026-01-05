import React, { useState } from 'react';
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
  Users, 
  Video, 
  MapPin, 
  BookOpen,
  MessageSquare,
  UserCheck,
  BarChart3,
  Presentation,
  Clock,
  Zap
} from 'lucide-react';
import { QuickEventForm } from './QuickEventForm';
import { calendarService } from '@/services/calendarService';

export const CalendarQuickActions: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const eventTemplates = calendarService.getEventTemplates().map(template => ({
    ...template,
    icon: getIconComponent(template.icon),
    colorClass: getColorClass(template.color)
  }));

  function getIconComponent(iconName: string) {
    const icons: { [key: string]: any } = {
      Users, Video, MapPin, BookOpen, MessageSquare, UserCheck, BarChart3, Presentation
    };
    return icons[iconName] || Users;
  }

  function getColorClass(color: string) {
    const colorMap: { [key: string]: string } = {
      '#3B82F6': 'text-blue-600',
      '#10B981': 'text-green-600',
      '#F59E0B': 'text-amber-600',
      '#8B5CF6': 'text-purple-600',
      '#EF4444': 'text-red-600',
      '#06B6D4': 'text-cyan-600'
    };
    return colorMap[color] || 'text-blue-600';
  }

  const handleQuickAction = (templateId: string) => {
    setSelectedTemplate(templateId);
    setIsDialogOpen(true);
  };

  const quickActions = [
    {
      id: 'instant-meeting',
      label: 'Sofort-Meeting',
      description: 'Meeting für jetzt erstellen',
      icon: Video,
      color: 'text-green-600',
      action: 'instant'
    },
    {
      id: 'book-room',
      label: 'Raum buchen',
      description: 'Verfügbaren Raum reservieren',
      icon: MapPin,
      color: 'text-orange-600',
      action: 'room'
    },
    {
      id: 'focus-time',
      label: 'Fokuszeit',
      description: 'Ungestörte Arbeitszeit blocken',
      icon: Clock,
      color: 'text-indigo-600',
      action: 'focus'
    }
  ];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Schnell-Termin
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 p-2">
          <div className="space-y-2">
            <div className="px-2 py-1">
              <h4 className="font-medium text-sm text-slate-700">Neuen Termin erstellen</h4>
              <p className="text-xs text-slate-500">Wählen Sie eine Vorlage oder Aktion</p>
            </div>
            <DropdownMenuSeparator />
            
            {/* Schnellaktionen */}
            {quickActions.map((action) => (
              <DropdownMenuItem
                key={action.id}
                onClick={() => handleQuickAction(action.action)}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 rounded-lg"
              >
                <div className="p-2 rounded-full bg-slate-100">
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-slate-500">{action.description}</div>
                </div>
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            
            {/* Event Templates */}
            <div className="px-2 py-1">
              <h4 className="font-semibold text-xs text-slate-600 uppercase tracking-wide">Vorlagen</h4>
            </div>
            
            {eventTemplates.map((template) => (
              <DropdownMenuItem
                key={template.id}
                onClick={() => handleQuickAction(template.id)}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 rounded-lg"
              >
                <div className="p-2 rounded-full bg-slate-100">
                  <template.icon className={`h-4 w-4 ${template.colorClass}`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-slate-500">{template.duration} Minuten</div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Schnell-Termin: {
                eventTemplates.find(t => t.id === selectedTemplate)?.name || 
                quickActions.find(a => a.action === selectedTemplate)?.label ||
                'Neuer Termin'
              }
            </DialogTitle>
          </DialogHeader>
          <QuickEventForm 
            template={selectedTemplate}
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};