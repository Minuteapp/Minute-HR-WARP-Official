import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Palette,
  Users,
  MessageCircle,
  CheckSquare,
  Calendar,
  Clock,
  Tag,
  Settings,
  Plus,
  Minus,
  Eye,
  EyeOff
} from 'lucide-react';

interface ContainerToolbarProps {
  onAction: (action: string, value?: any) => void;
  fontSize?: number;
  isSubContainersVisible?: boolean;
}

export const ContainerToolbar = ({ 
  onAction, 
  fontSize = 14,
  isSubContainersVisible = true
}: ContainerToolbarProps) => {
  return (
    <div className="flex items-center gap-1 p-2 border rounded-lg bg-background shadow-sm">
      {/* Text Formatting */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('format', 'bold')}
          className="h-8 w-8 p-0"
          title="Fett"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('format', 'italic')}
          className="h-8 w-8 p-0"
          title="Kursiv"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('format', 'underline')}
          className="h-8 w-8 p-0"
          title="Unterstrichen"
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Font Size */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('fontSize', Math.max(8, fontSize - 2))}
          className="h-8 w-8 p-0"
          title="Schrift verkleinern"
        >
          <Type className="h-3 w-3" />
        </Button>
        <span className="text-xs text-muted-foreground min-w-[24px] text-center">
          {fontSize}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('fontSize', Math.min(72, fontSize + 2))}
          className="h-8 w-8 p-0"
          title="Schrift vergrößern"
        >
          <Type className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Alignment */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('align', 'left')}
          className="h-8 w-8 p-0"
          title="Links ausrichten"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('align', 'center')}
          className="h-8 w-8 p-0"
          title="Zentrieren"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('align', 'right')}
          className="h-8 w-8 p-0"
          title="Rechts ausrichten"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Lists */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('list', 'unordered')}
          className="h-8 w-8 p-0"
          title="Aufzählung"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('list', 'ordered')}
          className="h-8 w-8 p-0"
          title="Nummerierung"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Container Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('addTask')}
          className="h-8 w-8 p-0"
          title="Aufgabe hinzufügen"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('addTeamMember')}
          className="h-8 w-8 p-0"
          title="Team-Mitglied einladen"
        >
          <Users className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('addComment')}
          className="h-8 w-8 p-0"
          title="Kommentar hinzufügen"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Meta Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('setDeadline')}
          className="h-8 w-8 p-0"
          title="Deadline setzen"
        >
          <Calendar className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('setEstimate')}
          className="h-8 w-8 p-0"
          title="Zeitschätzung"
        >
          <Clock className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('addTags')}
          className="h-8 w-8 p-0"
          title="Tags hinzufügen"
        >
          <Tag className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Sub-Container Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('addSubContainer')}
          className="h-8 w-8 p-0"
          title="Sub-Container hinzufügen"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('toggleSubContainers')}
          className="h-8 w-8 p-0"
          title={isSubContainersVisible ? 'Sub-Container ausblenden' : 'Sub-Container einblenden'}
        >
          {isSubContainersVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Style Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('color')}
          className="h-8 w-8 p-0"
          title="Farbe ändern"
        >
          <Palette className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('link')}
          className="h-8 w-8 p-0"
          title="Link hinzufügen"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('settings')}
          className="h-8 w-8 p-0"
          title="Einstellungen"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};