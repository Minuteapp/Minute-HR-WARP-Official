import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useSendKudosMutation } from "@/integrations/supabase/hooks/useEmployeeRecognition";
import { Loader2 } from "lucide-react";

interface SendKudosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiverId?: string;
}

export const SendKudosDialog = ({ open, onOpenChange, receiverId }: SendKudosDialogProps) => {
  const [category, setCategory] = useState<'teamwork' | 'innovation' | 'excellence' | 'leadership'>('teamwork');
  const [message, setMessage] = useState('');
  
  const sendKudos = useSendKudosMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!receiverId || !message.trim()) return;

    try {
      await sendKudos.mutateAsync({
        sender_employee_id: receiverId, // In einer echten App würde hier die ID des eingeloggten Users stehen
        receiver_employee_id: receiverId,
        kudos_message: message,
        category,
      });
      
      setMessage('');
      setCategory('teamwork');
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending kudos:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kudos senden</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Kategorie</Label>
            <Select value={category} onValueChange={(value: any) => setCategory(value)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Kategorie auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teamwork">Teamwork</SelectItem>
                <SelectItem value="innovation">Innovation</SelectItem>
                <SelectItem value="excellence">Excellence</SelectItem>
                <SelectItem value="leadership">Leadership</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Nachricht</Label>
            <Textarea
              id="message"
              placeholder="Schreibe eine kurze Nachricht, warum du Kudos vergibst..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={sendKudos.isPending || !message.trim()}>
              {sendKudos.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kudos senden
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
