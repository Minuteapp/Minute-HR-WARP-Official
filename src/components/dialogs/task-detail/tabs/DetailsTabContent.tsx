
import React, { useState } from "react";
import { Task } from "@/types/tasks";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertTriangle, X } from "lucide-react";
import { format, isPast } from "date-fns";
import { de } from "date-fns/locale";

interface DetailsTabContentProps {
  task: Task;
  onTaskUpdate: (updates: Partial<Task>) => void;
  readOnly?: boolean;
}

export const DetailsTabContent = ({ task, onTaskUpdate, readOnly = false }: DetailsTabContentProps) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [estimatedHours, setEstimatedHours] = useState(0);
  // ZERO-DATA: Keine Mockup-Namen - leere Arrays
  const [assignedMembers, setAssignedMembers] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const isOverdue = task.dueDate ? isPast(new Date(task.dueDate)) && !task.completed : false;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    if (title !== task.title) {
      onTaskUpdate({ title });
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      onTaskUpdate({ description });
    }
  };

  const handleStatusChange = (status: string) => {
    onTaskUpdate({ status: status as Task['status'] });
  };

  const handlePriorityChange = (priority: string) => {
    onTaskUpdate({ priority: priority as Task['priority'] });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveMember = (memberToRemove: string) => {
    setAssignedMembers(assignedMembers.filter(member => member !== memberToRemove));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Titel */}
      <div className="space-y-2">
        <Label htmlFor="task-title" className="text-sm font-medium">
          Titel *
        </Label>
        <Input
          id="task-title"
          value={title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          placeholder="Aufgabentitel eingeben"
          className="w-full"
          readOnly={readOnly}
        />
        <div className="flex justify-end gap-2">
          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
            Zu erledigen
          </div>
          <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
            Hoch
          </div>
        </div>
      </div>

      {/* Beschreibung */}
      <div className="space-y-2">
        <Label htmlFor="task-description" className="text-sm font-medium">
          Beschreibung
        </Label>
        <Textarea
          id="task-description"
          value={description}
          onChange={handleDescriptionChange}
          onBlur={handleDescriptionBlur}
          placeholder="Aufgabenbeschreibung eingeben"
          className="min-h-28 w-full"
          readOnly={readOnly}
        />
      </div>

      {/* Status und Priorität Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <Select value={task.status} onValueChange={handleStatusChange} disabled={readOnly}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">Zu erledigen</SelectItem>
              <SelectItem value="in-progress">In Bearbeitung</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="done">Erledigt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Priorität</Label>
          <Select value={task.priority} onValueChange={handlePriorityChange} disabled={readOnly}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Niedrig</SelectItem>
              <SelectItem value="medium">Mittel</SelectItem>
              <SelectItem value="high">Hoch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Geschätzte Stunden
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              className="w-20"
              readOnly={readOnly}
            />
            <div className="text-sm text-gray-500">
              Tatsächlich: 0h (0%)
            </div>
          </div>
        </div>
      </div>

      {/* Fälligkeitsdatum und Projekt Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Fälligkeitsdatum
            {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </Label>
          <Input
            type="date"
            defaultValue="2025-03-01"
            className="w-full"
            readOnly={readOnly}
          />
          {isOverdue && (
            <div className="text-red-600 text-sm">
              Aufgabe ist überfällig
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Projekt</Label>
          <Select defaultValue="social-media" disabled={readOnly}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="social-media">Kampagne Social Media</SelectItem>
              <SelectItem value="website">Website Redesign</SelectItem>
              <SelectItem value="marketing">Marketing Campaign</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hauptverantwortlicher */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Hauptverantwortlicher</Label>
        <Select defaultValue="tom-weber" disabled={readOnly}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {/* ZERO-DATA: Personen aus DB laden */}
            <SelectItem value="placeholder" disabled>Person aus Datenbank laden</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Team-Mitglieder */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Team-Mitglieder</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {assignedMembers.map((member) => (
            <Badge key={member} variant="secondary" className="flex items-center gap-1">
              {member}
              {!readOnly && (
                <button
                  onClick={() => handleRemoveMember(member)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
        {!readOnly && (
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Team-Mitglied hinzufügen..." />
            </SelectTrigger>
            <SelectContent>
              {/* ZERO-DATA: Team-Mitglieder aus DB laden */}
              <SelectItem value="placeholder" disabled>Person aus Datenbank laden</SelectItem>
            </SelectContent>
          </Select>
        )}
        <div className="text-xs text-gray-500">
          Der Hauptverantwortliche wird automatisch zum Team hinzugefügt.
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tags (durch Komma getrennt)</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="flex items-center gap-1">
              {tag}
              {!readOnly && (
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="instagram, campaign, launch"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTag();
            }
          }}
          readOnly={readOnly}
        />
      </div>

      {/* Erstellt am */}
      <div className="pt-4 border-t">
        <div className="text-sm text-gray-600">
          Erstellt am: 12.01.2025, 01:00
        </div>
      </div>
    </div>
  );
};
