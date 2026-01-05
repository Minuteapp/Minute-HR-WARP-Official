import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePeerKudos } from '@/hooks/usePeerKudos';
import { KudosCategory, KUDOS_CATEGORY_LABELS } from '@/types/peer-recognition';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Send, Heart, Minus, Plus } from 'lucide-react';

interface SendKudosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SendKudosDialog = ({ open, onOpenChange }: SendKudosDialogProps) => {
  const { toast } = useToast();
  const { sendKudos } = usePeerKudos();
  
  const [formData, setFormData] = useState({
    receiver_id: '',
    category: '' as KudosCategory,
    message: '',
    kudos_amount: 10
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .order('display_name');
      if (error) throw error;
      return data || [];
    }
  });

  const handleSubmit = async () => {
    if (!formData.receiver_id || !formData.category || !formData.message) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus",
        variant: "destructive"
      });
      return;
    }

    try {
      await sendKudos.mutateAsync(formData);
      toast({
        title: "Kudos gesendet!",
        description: "Ihre Anerkennung wurde erfolgreich übermittelt"
      });
      onOpenChange(false);
      setFormData({ receiver_id: '', category: '' as KudosCategory, message: '', kudos_amount: 10 });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Kudos konnten nicht gesendet werden",
        variant: "destructive"
      });
    }
  };

  const adjustKudos = (delta: number) => {
    setFormData(prev => ({
      ...prev,
      kudos_amount: Math.max(5, Math.min(50, prev.kudos_amount + delta))
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            Kudos senden
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>An</Label>
            <Select
              value={formData.receiver_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, receiver_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Mitarbeiter auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.display_name || 'Unbekannt'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Kategorie</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as KudosCategory }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategorie wählen..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(KUDOS_CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nachricht</Label>
            <Textarea
              placeholder="Warum verdient diese Person Anerkennung?"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Kudos-Punkte</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustKudos(-5)}
                disabled={formData.kudos_amount <= 5}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-bold text-destructive">{formData.kudos_amount}</span>
                <span className="text-sm text-muted-foreground ml-1">Punkte</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustKudos(5)}
                disabled={formData.kudos_amount >= 50}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={sendKudos.isPending}>
            <Send className="h-4 w-4 mr-2" />
            Senden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
