import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Edit, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEmployeeHRNotes, useCreateHRNote, useDeleteHRNote } from "@/integrations/supabase/hooks/useEmployeeHRNotes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { EditableField } from "../../shared/EditableField";
import { EmployeeTabEditProps } from "@/types/employee-tab-props.types";

const categoryLabels: Record<string, string> = {
  general: "Allgemein",
  hr: "HR",
  performance: "Performance",
  disciplinary: "Disziplinarisch",
  development: "Entwicklung"
};

const categoryColors: Record<string, string> = {
  general: "bg-gray-100 text-gray-800",
  hr: "bg-blue-100 text-blue-800",
  performance: "bg-green-100 text-green-800",
  disciplinary: "bg-red-100 text-red-800",
  development: "bg-purple-100 text-purple-800"
};

interface NotesTabNewProps extends EmployeeTabEditProps {}

export const NotesTabNew = ({ 
  employeeId,
  isEditing = false,
  onFieldChange,
  pendingChanges
}: NotesTabNewProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { data: notes, isLoading } = useEmployeeHRNotes(employeeId);
  const createNote = useCreateHRNote();
  const deleteNote = useDeleteHRNote();

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      title: "",
      content: "",
      category: "general",
      visibility: "hr_only"
    }
  });

  const onSubmit = async (data: any) => {
    await createNote.mutateAsync({
      employee_id: employeeId,
      title: data.title,
      content: data.content,
      category: data.category,
      tags: [],
      visibility: data.visibility
    });
    reset();
    setIsDialogOpen(false);
  };

  const filteredNotes = notes?.filter(note => 
    filterCategory === "all" || note.category === filterCategory
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Lädt...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            HR-Notizen
          </span>
          <div className="flex items-center gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                <SelectItem value="general">Allgemein</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="disciplinary">Disziplinarisch</SelectItem>
                <SelectItem value="development">Entwicklung</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Notiz
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Neue HR-Notiz erstellen</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label>Titel</Label>
                    <Input {...register("title", { required: true })} placeholder="Titel der Notiz" />
                  </div>

                  <div>
                    <Label>Kategorie</Label>
                    <Select onValueChange={(value) => setValue("category", value)} defaultValue="general">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Allgemein</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="disciplinary">Disziplinarisch</SelectItem>
                        <SelectItem value="development">Entwicklung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Vertraulichkeit</Label>
                    <Select onValueChange={(value) => setValue("visibility", value)} defaultValue="hr_only">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr_only">Nur HR</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="all">Alle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Inhalt</Label>
                    <Textarea 
                      {...register("content", { required: true })} 
                      placeholder="Notiz-Inhalt"
                      rows={6}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button type="submit" disabled={createNote.isPending}>
                      {createNote.isPending ? "Wird gespeichert..." : "Speichern"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredNotes && filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isEditing ? (
                        <EditableField
                          value={pendingChanges?.notes?.[note.id]?.title ?? note.title}
                          isEditing={isEditing}
                          onChange={(val) => onFieldChange?.('notes', `${note.id}_title`, val)}
                          valueClassName="font-medium"
                          showLabel={false}
                        />
                      ) : (
                        <h4 className="font-medium">{note.title}</h4>
                      )}
                      <Badge className={categoryColors[note.category]}>
                        {categoryLabels[note.category]}
                      </Badge>
                    </div>
                    {isEditing ? (
                      <EditableField
                        value={pendingChanges?.notes?.[note.id]?.content ?? note.content}
                        isEditing={isEditing}
                        onChange={(val) => onFieldChange?.('notes', `${note.id}_content`, val)}
                        type="textarea"
                        valueClassName="text-sm text-muted-foreground whitespace-pre-wrap"
                        showLabel={false}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {note.content}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(note.created_at), "dd.MM.yyyy HH:mm", { locale: de })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteNote.mutate(note.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Keine Notizen vorhanden
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
