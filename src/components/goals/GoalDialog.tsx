import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Goal, GoalCategory, GoalPriority } from '@/types/goals';
import { generateCalendarReminder } from '@/lib/dateUtils';

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal;
  onSave: (goalData: Partial<Goal>) => void;
  title: string;
  mode: 'create' | 'edit';
}

export const GoalDialog: React.FC<GoalDialogProps> = ({ open, onOpenChange, goal, onSave, title, mode }) => {
  const [goalTitle, setGoalTitle] = useState(goal?.title || '');
  const [goalDescription, setGoalDescription] = useState(goal?.description || '');
  const [goalCategory, setGoalCategory] = useState<GoalCategory>(goal?.category || 'personal');
  const [goalPriority, setGoalPriority] = useState<GoalPriority>(goal?.priority || 'medium');
  const [goalProgress, setGoalProgress] = useState(goal?.progress?.toString() || '0');
  const [goalStartDate, setGoalStartDate] = useState<Date | undefined>(goal?.start_date ? new Date(goal.start_date) : undefined);
  const [goalDueDate, setGoalDueDate] = useState<Date | undefined>(goal?.due_date ? new Date(goal.due_date) : undefined);
  
  useEffect(() => {
    if (goal) {
      setGoalTitle(goal.title || '');
      setGoalDescription(goal.description || '');
      setGoalCategory(goal.category || 'personal');
      setGoalPriority(goal.priority || 'medium');
      setGoalProgress(goal.progress?.toString() || '0');
      setGoalStartDate(goal.start_date ? new Date(goal.start_date) : undefined);
      setGoalDueDate(goal.due_date ? new Date(goal.due_date) : undefined);
    } else {
      // Reset the form when creating a new goal
      setGoalTitle('');
      setGoalDescription('');
      setGoalCategory('personal');
      setGoalPriority('medium');
      setGoalProgress('0');
      setGoalStartDate(undefined);
      setGoalDueDate(undefined);
    }
  }, [goal]);

  const handleSave = () => {
    const goalData: Partial<Goal> = {
      title: goalTitle,
      description: goalDescription,
      category: goalCategory,
      priority: goalPriority,
      progress: parseInt(goalProgress),
      start_date: goalStartDate?.toISOString(),
      due_date: goalDueDate?.toISOString(),
    };
    onSave(goalData);
  };
  
  const handleCreateCalendarReminder = () => {
    // Modify to use only two arguments
    const calendarReminderData = generateCalendarReminder(
      goal?.due_date || '', 
      goal?.title || ''
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Titel</Label>
            <Input
              type="text"
              id="name"
              placeholder="Ziel Titel"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              placeholder="Ziel Beschreibung"
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Kategorie</Label>
              <Select value={goalCategory} onValueChange={(value) => setGoalCategory(value as GoalCategory)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Persönlich</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="company">Firma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priorität</Label>
              <Select value={goalPriority} onValueChange={(value) => setGoalPriority(value as GoalPriority)}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Priorität wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="progress">Fortschritt (%)</Label>
              <Input
                type="number"
                id="progress"
                placeholder="Fortschritt"
                value={goalProgress}
                onChange={(e) => setGoalProgress(e.target.value)}
              />
            </div>
            <div>
              <Label>Startdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !goalStartDate && "text-muted-foreground"
                    )}
                  >
                    {goalStartDate ? format(goalStartDate, "dd.MM.yyyy") : (
                      <span>Datum wählen</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={goalStartDate}
                    onSelect={setGoalStartDate}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div>
            <Label>Fälligkeitsdatum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !goalDueDate && "text-muted-foreground"
                  )}
                >
                  {goalDueDate ? format(goalDueDate, "dd.MM.yyyy") : (
                    <span>Datum wählen</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={goalDueDate}
                  onSelect={setGoalDueDate}
                  disabled={(date) =>
                    date < new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={handleSave}>Speichern</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
