import React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Type, 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Square,
  Circle,
  Triangle,
  Diamond,
  Minus,
  ArrowRight,
  Paintbrush,
  MessageSquare,
  Users,
  UserPlus,
  UserMinus,
  Undo,
  Redo,
  Sparkles,
  Plus,
  MoreHorizontal,
  Link,
  Move,
  Hand,
  MousePointer,
  Pen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VisualPlanningToolbarProps {
  onToolSelect: (tool: string) => void;
  activeTool: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomLevel: number;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onFontSizeChange: (size: string) => void;
  onFontFamilyChange: (family: string) => void;
  selectedFontSize: string;
  selectedFontFamily: string;
}

export const VisualPlanningToolbar: React.FC<VisualPlanningToolbarProps> = ({
  onToolSelect,
  activeTool,
  onZoomIn,
  onZoomOut,
  zoomLevel,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onFontSizeChange,
  onFontFamilyChange,
  selectedFontSize,
  selectedFontFamily,
}) => {
  const toolGroups = [
    {
      name: 'selection',
      tools: [
        { id: 'select', icon: MousePointer, label: 'Auswählen' },
        { id: 'pan', icon: Hand, label: 'Verschieben' },
      ]
    },
    {
      name: 'zoom',
      tools: [
        { id: 'zoom-in', icon: ZoomIn, label: 'Vergrößern', action: onZoomIn },
        { id: 'zoom-out', icon: ZoomOut, label: 'Verkleinern', action: onZoomOut },
      ]
    },
    {
      name: 'text',
      tools: [
        { id: 'text', icon: Type, label: 'Text' },
        { id: 'bold', icon: Bold, label: 'Fett' },
        { id: 'italic', icon: Italic, label: 'Kursiv' },
        { id: 'underline', icon: Underline, label: 'Unterstrichen' },
      ]
    },
    {
      name: 'alignment',
      tools: [
        { id: 'align-left', icon: AlignLeft, label: 'Links ausrichten' },
        { id: 'align-center', icon: AlignCenter, label: 'Zentrieren' },
        { id: 'align-right', icon: AlignRight, label: 'Rechts ausrichten' },
      ]
    },
    {
      name: 'shapes',
      tools: [
        { id: 'rectangle', icon: Square, label: 'Rechteck' },
        { id: 'circle', icon: Circle, label: 'Kreis' },
        { id: 'triangle', icon: Triangle, label: 'Dreieck' },
        { id: 'diamond', icon: Diamond, label: 'Rhombus' },
      ]
    },
    {
      name: 'connections',
      tools: [
        { id: 'line', icon: Minus, label: 'Linie' },
        { id: 'arrow', icon: ArrowRight, label: 'Pfeil' },
        { id: 'connector', icon: Link, label: 'Verbinder' },
      ]
    },
    {
      name: 'drawing',
      tools: [
        { id: 'pen', icon: Pen, label: 'Zeichnen' },
        { id: 'brush', icon: Paintbrush, label: 'Pinsel' },
      ]
    },
    {
      name: 'collaboration',
      tools: [
        { id: 'comment', icon: MessageSquare, label: 'Kommentar' },
        { id: 'team', icon: Users, label: 'Team verwalten' },
        { id: 'invite', icon: UserPlus, label: 'Mitglied einladen' },
        { id: 'remove-user', icon: UserMinus, label: 'Mitglied entfernen' },
      ]
    },
    {
      name: 'history',
      tools: [
        { id: 'undo', icon: Undo, label: 'Rückgängig', action: onUndo, disabled: !canUndo },
        { id: 'redo', icon: Redo, label: 'Wiederholen', action: onRedo, disabled: !canRedo },
      ]
    },
    {
      name: 'ai',
      tools: [
        { id: 'ai-assist', icon: Sparkles, label: 'KI-Assistent' },
      ]
    },
    {
      name: 'custom',
      tools: [
        { id: 'add-element', icon: Plus, label: 'Element hinzufügen' },
        { id: 'more', icon: MoreHorizontal, label: 'Weitere Optionen' },
      ]
    }
  ];

  const handleToolClick = (toolId: string, action?: () => void) => {
    if (action) {
      action();
    } else {
      onToolSelect(toolId);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 p-3 bg-background border border-border rounded-lg shadow-sm">
        {/* Font Controls */}
        <div className="flex items-center gap-2">
          <Select value={selectedFontFamily} onValueChange={onFontFamilyChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Schriftart" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedFontSize} onValueChange={onFontSizeChange}>
            <SelectTrigger className="w-16">
              <SelectValue placeholder="16" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8">8</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="14">14</SelectItem>
              <SelectItem value="16">16</SelectItem>
              <SelectItem value="18">18</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="32">32</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Zoom Level Display */}
        <div className="text-sm text-muted-foreground min-w-12 text-center">
          {Math.round(zoomLevel * 100)}%
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Tool Groups */}
        {toolGroups.map((group, groupIndex) => (
          <React.Fragment key={group.name}>
            <div className="flex items-center gap-1">
              {group.tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                const isDisabled = tool.disabled || false;

                return (
                  <Tooltip key={tool.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleToolClick(tool.id, tool.action)}
                        disabled={isDisabled}
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{tool.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
            {groupIndex < toolGroups.length - 1 && (
              <Separator orientation="vertical" className="h-6" />
            )}
          </React.Fragment>
        ))}
      </div>
    </TooltipProvider>
  );
};