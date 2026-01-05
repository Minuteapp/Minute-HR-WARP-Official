import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateHRNote } from "@/integrations/supabase/hooks/useEmployeeHRNotes";
import { Shield } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "Titel muss mindestens 3 Zeichen lang sein"),
  content: z.string().min(10, "Inhalt muss mindestens 10 Zeichen lang sein"),
  category: z.string().min(1, "Bitte wählen Sie eine Kategorie"),
  tags: z.string(),
  visibility: z.string(),
});

interface HRNoteFormProps {
  employeeId: string;
  onSuccess: () => void;
}

const categoryOptions = [
  { value: "performance_review", label: "Leistungsbeurteilung" },
  { value: "compensation", label: "Vergütung" },
  { value: "project", label: "Projekt" },
  { value: "work_arrangement", label: "Arbeitsregelung" },
  { value: "onboarding", label: "Onboarding" },
  { value: "disciplinary", label: "Disziplinarisch" },
  { value: "health", label: "Gesundheit" },
  { value: "career_development", label: "Karriereentwicklung" },
  { value: "other", label: "Sonstiges" },
];

export const HRNoteForm = ({ employeeId, onSuccess }: HRNoteFormProps) => {
  const { mutate: createNote, isPending } = useCreateHRNote();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      tags: "",
      visibility: "hr_only",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const tags = values.tags
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    createNote(
      {
        employee_id: employeeId,
        title: values.title,
        content: values.content,
        category: values.category,
        tags,
        visibility: values.visibility,
      },
      {
        onSuccess: () => {
          form.reset();
          onSuccess();
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. Mitarbeitergespräch Q4 2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategorie</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notiz</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detaillierte Beschreibung der HR-Notiz..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (kommagetrennt)</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. Karriere, Entwicklung, Leadership" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sichtbarkeit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hr_only">Nur HR</SelectItem>
                    <SelectItem value="hr_and_manager">HR & Manager</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-6 p-4 bg-muted rounded-lg text-sm">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold mb-2">Datenschutz-Hinweis: Alle Notizen unterliegen den DSGVO-Bestimmungen.</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Notizen werden verschlüsselt gespeichert</li>
                  <li>Zugriff ist rollenbasiert und wird auditiert</li>
                  <li>Mitarbeiter haben Auskunftsrecht (Art. 15 DSGVO)</li>
                  <li>Löschung erfolgt nach Beendigung des Arbeitsverhältnisses + gesetzlicher Aufbewahrungsfrist</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Speichern..." : "Notiz speichern"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
