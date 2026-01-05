import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Users, MessageSquare, Lock, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat: (data: NewChatData) => void;
}

interface NewChatData {
  name: string;
  type: 'direct' | 'group' | 'team';
  description?: string;
  isPrivate?: boolean;
  members?: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

const NewChatDialog: React.FC<NewChatDialogProps> = ({ 
  isOpen, 
  onClose, 
  onCreateChat 
}) => {
  const [formData, setFormData] = useState<NewChatData>({
    name: '',
    type: 'group',
    description: '',
    isPrivate: false,
    members: []
  });
  
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [memberSearch, setMemberSearch] = useState('');

  // Echte Benutzer aus der Datenbank laden
  const { data: availableUsers = [], isLoading } = useQuery({
    queryKey: ['employees-for-chat'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email')
        .eq('status', 'active')
        .order('last_name');
      
      if (error) throw error;
      return (data || []).map(emp => ({
        id: emp.id,
        name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unbekannt',
        email: emp.email || ''
      }));
    },
    enabled: isOpen
  });

  const filteredUsers = availableUsers.filter(user => 
    !selectedMembers.find(member => member.id === user.id) &&
    (user.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
     user.email.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    const chatData: NewChatData = {
      ...formData,
      members: selectedMembers.map(user => user.id)
    };

    onCreateChat(chatData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'group',
      description: '',
      isPrivate: false,
      members: []
    });
    setSelectedMembers([]);
    setMemberSearch('');
    onClose();
  };

  const addMember = (user: User) => {
    setSelectedMembers(prev => [...prev, user]);
    setMemberSearch('');
  };

  const removeMember = (userId: string) => {
    setSelectedMembers(prev => prev.filter(user => user.id !== userId));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'direct':
        return <MessageSquare className="h-4 w-4" />;
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'team':
        return <Users className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(formData.type)}
            Neuen Chat erstellen
          </DialogTitle>
          <DialogDescription>
            Erstellen Sie einen neuen Chat oder eine Gruppe für die Zusammenarbeit.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Chat-Typ */}
          <div className="space-y-2">
            <Label>Chat-Typ</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'direct' | 'group' | 'team') => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Direktnachricht
                  </div>
                </SelectItem>
                <SelectItem value="group">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Gruppe
                  </div>
                </SelectItem>
                <SelectItem value="team">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team-Chat
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chat-Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Chat-Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="z.B. Marketing Team"
              required
            />
          </div>

          {/* Beschreibung */}
          {formData.type !== 'direct' && (
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Kurze Beschreibung des Chats..."
                rows={2}
              />
            </div>
          )}

          {/* Privat-Option */}
          {formData.type !== 'direct' && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="private"
                checked={formData.isPrivate}
                onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="private" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Privater Chat
              </Label>
            </div>
          )}

          {/* Mitglieder hinzufügen */}
          <div className="space-y-2">
            <Label>Mitglieder hinzufügen</Label>
            
            {/* Ausgewählte Mitglieder */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedMembers.map(member => (
                  <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {member.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive/20"
                      onClick={() => removeMember(member.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Benutzer-Suche */}
            <Input
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Benutzer suchen..."
            />
            
            {/* Benutzer-Liste */}
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Lade Benutzer...</span>
              </div>
            ) : memberSearch && filteredUsers.length > 0 ? (
              <div className="border rounded-md max-h-32 overflow-y-auto">
                {filteredUsers.slice(0, 5).map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => addMember(user)}
                    className="w-full flex items-center gap-2 p-2 hover:bg-muted text-left"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : memberSearch && filteredUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">Keine Benutzer gefunden</p>
            ) : null}
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Abbrechen
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={!formData.name.trim()}
          >
            Chat erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;
