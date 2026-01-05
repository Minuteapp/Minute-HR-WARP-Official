import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Paperclip, 
  TrendingUp, 
  DollarSign, 
  FolderKanban, 
  Home, 
  UserPlus, 
  AlertTriangle, 
  Heart, 
  Briefcase,
  MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useDeleteHRNote } from "@/integrations/supabase/hooks/useEmployeeHRNotes";
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
} from "@/components/ui/alert-dialog";

interface HRNoteCardProps {
  note: any;
}

const categoryConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  performance_review: { 
    label: "Leistungsbeurteilung", 
    icon: TrendingUp, 
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-100 dark:bg-blue-900 border-blue-200 dark:border-blue-800"
  },
  compensation: { 
    label: "Vergütung", 
    icon: DollarSign, 
    color: "text-green-700 dark:text-green-300",
    bg: "bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800"
  },
  project: { 
    label: "Projekt", 
    icon: FolderKanban, 
    color: "text-purple-700 dark:text-purple-300",
    bg: "bg-purple-100 dark:bg-purple-900 border-purple-200 dark:border-purple-800"
  },
  work_arrangement: { 
    label: "Arbeitsregelung", 
    icon: Home, 
    color: "text-yellow-700 dark:text-yellow-300",
    bg: "bg-yellow-100 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800"
  },
  onboarding: { 
    label: "Onboarding", 
    icon: UserPlus, 
    color: "text-pink-700 dark:text-pink-300",
    bg: "bg-pink-100 dark:bg-pink-900 border-pink-200 dark:border-pink-800"
  },
  disciplinary: { 
    label: "Disziplinarisch", 
    icon: AlertTriangle, 
    color: "text-red-700 dark:text-red-300",
    bg: "bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-800"
  },
  health: { 
    label: "Gesundheit", 
    icon: Heart, 
    color: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-100 dark:bg-orange-900 border-orange-200 dark:border-orange-800"
  },
  career_development: { 
    label: "Karriereentwicklung", 
    icon: Briefcase, 
    color: "text-teal-700 dark:text-teal-300",
    bg: "bg-teal-100 dark:bg-teal-900 border-teal-200 dark:border-teal-800"
  },
  other: { 
    label: "Sonstiges", 
    icon: MoreHorizontal, 
    color: "text-gray-700 dark:text-gray-300",
    bg: "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
  }
};

export const HRNoteCard = ({ note }: HRNoteCardProps) => {
  const { mutate: deleteNote, isPending } = useDeleteHRNote();
  const category = categoryConfig[note.category] || categoryConfig.other;
  const CategoryIcon = category.icon;

  const handleDelete = () => {
    deleteNote(note.id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${category.bg} ${category.color} border`}>
                <CategoryIcon className="h-3 w-3 mr-1" />
                {category.label}
              </Badge>
              <Badge 
                variant={note.visibility === 'hr_only' ? 'destructive' : 'default'}
                className="text-xs"
              >
                {note.visibility === 'hr_only' ? 'Nur HR' : 'HR & Manager'}
              </Badge>
              {note.has_attachments && (
                <Badge variant="outline" className="text-xs">
                  <Paperclip className="h-3 w-3 mr-1" />
                  {note.attachments?.length || 0}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg">{note.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(note.created_at), "dd. MMMM yyyy, HH:mm", { locale: de })} Uhr
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Notiz löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Möchten Sie diese HR-Notiz wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground/80 mb-3 line-clamp-3">
          {note.content}
        </p>
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
