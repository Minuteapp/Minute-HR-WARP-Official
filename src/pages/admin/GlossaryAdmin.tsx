import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, Edit } from 'lucide-react';

interface GlossaryTerm {
  id: string;
  term: string;
  preferred: string;
  forbidden: string[] | null;
  context: string | null;
  category: string | null;
  created_at: string;
}

export default function GlossaryAdmin() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [formData, setFormData] = useState({
    term: '',
    preferred: '',
    forbidden: '',
    context: '',
    category: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('glossary_terms')
        .select('*')
        .order('term', { ascending: true });

      if (error) throw error;
      setTerms(data || []);
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: 'Glossar konnte nicht geladen werden.',
        variant: 'destructive',
      });
      console.error('Fehler beim Laden des Glossars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const forbiddenArray = formData.forbidden
        ? formData.forbidden.split(',').map(s => s.trim()).filter(Boolean)
        : null;

      if (editingTerm) {
        const { error } = await supabase
          .from('glossary_terms')
          .update({
            term: formData.term,
            preferred: formData.preferred,
            forbidden: forbiddenArray,
            context: formData.context || null,
            category: formData.category || null,
          })
          .eq('id', editingTerm.id);

        if (error) throw error;

        toast({
          title: 'Gespeichert',
          description: 'Begriff wurde aktualisiert.',
        });
      } else {
        const { error } = await supabase.from('glossary_terms').insert({
          term: formData.term,
          preferred: formData.preferred,
          forbidden: forbiddenArray,
          context: formData.context || null,
          category: formData.category || null,
        });

        if (error) throw error;

        toast({
          title: 'Erstellt',
          description: 'Neuer Begriff wurde hinzugefügt.',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTerms();
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Begriff wirklich löschen?')) return;

    try {
      const { error } = await supabase
        .from('glossary_terms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Gelöscht',
        description: 'Begriff wurde entfernt.',
      });
      fetchTerms();
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (term: GlossaryTerm) => {
    setEditingTerm(term);
    setFormData({
      term: term.term,
      preferred: term.preferred,
      forbidden: term.forbidden?.join(', ') || '',
      context: term.context || '',
      category: term.category || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      term: '',
      preferred: '',
      forbidden: '',
      context: '',
      category: '',
    });
    setEditingTerm(null);
  };

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Glossar-Verwaltung</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Neuer Begriff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingTerm ? 'Begriff bearbeiten' : 'Neuer Begriff'}
                </DialogTitle>
                <DialogDescription>
                  Definieren Sie geschützte Begriffe und bevorzugte Übersetzungen.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="term">Original-Begriff *</Label>
                  <Input
                    id="term"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    placeholder="z.B. Kunde"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="preferred">Bevorzugte Übersetzung *</Label>
                  <Input
                    id="preferred"
                    value={formData.preferred}
                    onChange={(e) => setFormData({ ...formData, preferred: e.target.value })}
                    placeholder="z.B. Customer"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="forbidden">Verbotene Begriffe (kommagetrennt)</Label>
                  <Input
                    id="forbidden"
                    value={formData.forbidden}
                    onChange={(e) => setFormData({ ...formData, forbidden: e.target.value })}
                    placeholder="z.B. Client, Consumer"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="context">Kontext</Label>
                  <Textarea
                    id="context"
                    value={formData.context}
                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                    placeholder="Wann dieser Begriff verwendet werden sollte..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Kategorie</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="z.B. Marketing, Technik"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">
                  {editingTerm ? 'Aktualisieren' : 'Erstellen'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Begriff</TableHead>
              <TableHead>Bevorzugt</TableHead>
              <TableHead>Verboten</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Lädt...
                </TableCell>
              </TableRow>
            ) : terms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Keine Begriffe vorhanden. Erstellen Sie den ersten Begriff.
                </TableCell>
              </TableRow>
            ) : (
              terms.map((term) => (
                <TableRow key={term.id}>
                  <TableCell className="font-medium">{term.term}</TableCell>
                  <TableCell>{term.preferred}</TableCell>
                  <TableCell>
                    {term.forbidden?.join(', ') || '-'}
                  </TableCell>
                  <TableCell>{term.category || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(term)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(term.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}