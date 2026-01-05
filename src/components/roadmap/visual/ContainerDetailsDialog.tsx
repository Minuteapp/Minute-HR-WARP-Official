import React, { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ContainerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: Node | null;
  onUpdateNode: (node: Node) => void;
}

export const ContainerDetailsDialog: React.FC<ContainerDetailsDialogProps> = ({
  open,
  onOpenChange,
  node,
  onUpdateNode,
}) => {
  const [editedNode, setEditedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (node) {
      setEditedNode({ ...node });
    }
  }, [node]);

  if (!editedNode) return null;

  const handleSave = () => {
    onUpdateNode(editedNode);
    onOpenChange(false);
  };

  const updateNodeData = (key: string, value: any) => {
    setEditedNode(prev => prev ? {
      ...prev,
      data: { ...prev.data, [key]: value }
    } : null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Container Details</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="style">Stil</TabsTrigger>
            <TabsTrigger value="connections">Verbindungen</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="label">Titel</Label>
                <Input
                  id="label"
                  value={(editedNode.data as any).label || ''}
                  onChange={(e) => updateNodeData('label', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={(editedNode.data as any).description || ''}
                  onChange={(e) => updateNodeData('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={(editedNode.data as any).status || 'planned'}
                  onValueChange={(value) => updateNodeData('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Geplant</SelectItem>
                    <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                    <SelectItem value="on_hold">Pausiert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priorität</Label>
                <Select
                  value={(editedNode.data as any).priority || 'medium'}
                  onValueChange={(value) => updateNodeData('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niedrig</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="high">Hoch</SelectItem>
                    <SelectItem value="critical">Kritisch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="shape">Form</Label>
                <Select
                  value={(editedNode.data as any).shape || 'rectangle'}
                  onValueChange={(value) => updateNodeData('shape', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rectangle">Rechteck</SelectItem>
                    <SelectItem value="circle">Kreis</SelectItem>
                    <SelectItem value="triangle">Dreieck</SelectItem>
                    <SelectItem value="diamond">Rhombus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color">Hintergrundfarbe</Label>
                <Input
                  id="color"
                  type="color"
                  value={(editedNode.data as any).color || '#3b82f6'}
                  onChange={(e) => updateNodeData('color', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="textColor">Textfarbe</Label>
                <Input
                  id="textColor"
                  type="color"
                  value={(editedNode.data as any).textColor || '#ffffff'}
                  onChange={(e) => updateNodeData('textColor', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="fontSize">Schriftgröße</Label>
                <Input
                  id="fontSize"
                  type="number"
                  min="8"
                  max="48"
                  value={(editedNode.data as any).fontSize || 14}
                  onChange={(e) => updateNodeData('fontSize', parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="fontFamily">Schriftart</Label>
                <Select
                  value={(editedNode.data as any).fontFamily || 'Arial'}
                  onValueChange={(value) => updateNodeData('fontFamily', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {((editedNode.data as any).tags as string[])?.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="dependencies">Abhängigkeiten</Label>
              <Textarea
                id="dependencies"
                placeholder="Container-IDs, getrennt durch Kommas"
                value={((editedNode.data as any).dependencies as string[])?.join(', ') || ''}
                onChange={(e) => updateNodeData('dependencies', e.target.value.split(', ').filter(Boolean))}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="assignedTo">Zugewiesen an</Label>
              <Input
                id="assignedTo"
                placeholder="Teammitglied"
                value={(editedNode.data as any).assignedTo || ''}
                onChange={(e) => updateNodeData('assignedTo', e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave}>
            Speichern
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};