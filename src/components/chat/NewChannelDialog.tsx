import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Hash, User, Users, Lock, Briefcase, Clock, Shield, MapPin, Search, Info, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  department?: string | null;
}

type TabType = 'channel' | 'dm' | 'group';
type ChannelType = 'public' | 'private' | 'project' | 'shift' | 'hr-confidential';

interface NewChannelDialogProps {
  onCreateChannel: (name: string, type: string, isPublic: boolean, description?: string, memberIds?: string[]) => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export const NewChannelDialog: React.FC<NewChannelDialogProps> = ({ 
  onCreateChannel, 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange,
  showTrigger = true 
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;
  
  const [activeTab, setActiveTab] = useState<TabType>('channel');
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState<ChannelType>('public');
  const [channelDescription, setChannelDescription] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadProfiles = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, department')
        .order('full_name');
      
      if (data) {
        setProfiles(data);
      }
    };
    
    if (isOpen) {
      loadProfiles();
      // Reset beim Öffnen
      setActiveTab('channel');
      setChannelName('');
      setGroupName('');
      setChannelDescription('');
      setSelectedMembers([]);
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'channel') {
        if (!channelName.trim()) return;
        const isPublic = channelType === 'public';
        await onCreateChannel(channelName, channelType, isPublic, channelDescription);
      } else if (activeTab === 'dm') {
        if (selectedMembers.length !== 1) return;
        await onCreateChannel('', 'direct', false, '', selectedMembers);
      } else if (activeTab === 'group') {
        if (!groupName.trim() || selectedMembers.length < 2) return;
        await onCreateChannel(groupName, 'group', false, '', selectedMembers);
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Fehler beim Erstellen:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMember = (userId: string) => {
    if (activeTab === 'dm') {
      setSelectedMembers([userId]);
    } else {
      setSelectedMembers(prev => 
        prev.includes(userId) 
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const removeMember = (userId: string) => {
    setSelectedMembers(prev => prev.filter(id => id !== userId));
  };

  const filteredProfiles = profiles.filter(profile => {
    const searchLower = searchQuery.toLowerCase();
    return (
      profile.full_name?.toLowerCase().includes(searchLower) ||
      profile.username?.toLowerCase().includes(searchLower) ||
      profile.department?.toLowerCase().includes(searchLower)
    );
  });

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const channelTypes: Array<{value: ChannelType, icon: any, label: string, description: string}> = [
    { value: 'public', icon: Hash, label: 'Öffentlich', description: 'Jeder im Unternehmen kann beitreten' },
    { value: 'private', icon: Lock, label: 'Privat', description: 'Nur eingeladene Mitglieder können beitreten' },
    { value: 'project', icon: Briefcase, label: 'Projekt', description: 'Projekt-spezifischer Kanal' },
    { value: 'shift', icon: Clock, label: 'Schicht', description: 'Für Schichtkoordination' },
    { value: 'hr-confidential', icon: Shield, label: 'HR Vertraulich', description: 'Nur für HR-Team sichtbar' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl">Neuen Chat erstellen</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Erstellen Sie einen Kanal, eine Direktnachricht oder einen Gruppenchat
          </p>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-2 px-6 pb-4 border-b">
          <Button
            variant={activeTab === 'channel' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setActiveTab('channel')}
          >
            <Hash className="w-4 h-4 mr-2" />
            Kanal
          </Button>
          <Button
            variant={activeTab === 'dm' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setActiveTab('dm')}
          >
            <User className="w-4 h-4 mr-2" />
            Direktnachricht
          </Button>
          <Button
            variant={activeTab === 'group' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setActiveTab('group')}
          >
            <Users className="w-4 h-4 mr-2" />
            Gruppenchat
          </Button>
        </div>

        <ScrollArea className="flex-1 px-6 max-h-[calc(85vh-280px)]">
          {/* Kanal Tab */}
          {activeTab === 'channel' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="channelName">Kanalname*</Label>
                <Input
                  id="channelName"
                  placeholder="z.B. projekt-phoenix, marketing-team..."
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="channelDescription">Beschreibung (optional)</Label>
                <Input
                  id="channelDescription"
                  placeholder="Wofür ist dieser Kanal?"
                  value={channelDescription}
                  onChange={(e) => setChannelDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Kanaltyp</Label>
                <div className="grid grid-cols-2 gap-3">
                  {channelTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setChannelType(type.value)}
                        className={cn(
                          "p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50",
                          channelType === type.value ? "border-primary bg-primary/5" : "border-border"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Direktnachricht Tab */}
          {activeTab === 'dm' && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 border border-border rounded-lg p-3 flex gap-2">
                <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Wählen Sie eine Person aus, um eine Direktnachricht zu starten
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nach Namen, E-Mail oder Abteilung suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {filteredProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => toggleMember(profile.id)}
                      className={cn(
                        "w-full p-3 rounded-lg border transition-all text-left hover:bg-muted/50",
                        selectedMembers.includes(profile.id) ? "border-primary bg-primary/5" : "border-border"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(profile.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{profile.full_name || profile.username}</div>
                          {profile.department && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Briefcase className="w-3 h-3" />
                              <span>{profile.department}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Gruppenchat Tab */}
          {activeTab === 'group' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Gruppenname*</Label>
                <Input
                  id="groupName"
                  placeholder="z.B. Marketing Team Berlin"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div className="bg-muted/50 border border-border rounded-lg p-3 flex gap-2">
                <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Gruppenchats sind ideal für kleinere Teams (bis 50 Personen). Für größere Teams erstellen Sie einen Kanal.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Mitglieder hinzufügen* (min. 2)</Label>
                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
                    {selectedMembers.map(memberId => {
                      const profile = profiles.find(p => p.id === memberId);
                      if (!profile) return null;
                      return (
                        <Badge key={memberId} variant="default" className="gap-1 pr-1">
                          {profile.full_name || profile.username}
                          <button
                            type="button"
                            onClick={() => removeMember(memberId)}
                            className="ml-1 rounded-full hover:bg-primary-foreground/20"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nach Namen, E-Mail oder Abteilung suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {filteredProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => toggleMember(profile.id)}
                      className={cn(
                        "w-full p-3 rounded-lg border transition-all text-left hover:bg-muted/50",
                        selectedMembers.includes(profile.id) ? "border-primary bg-primary/5" : "border-border"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(profile.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{profile.full_name || profile.username}</div>
                          {profile.department && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Briefcase className="w-3 h-3" />
                              <span>{profile.department}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              isLoading ||
              (activeTab === 'channel' && !channelName.trim()) ||
              (activeTab === 'dm' && selectedMembers.length !== 1) ||
              (activeTab === 'group' && (!groupName.trim() || selectedMembers.length < 2))
            }
          >
            {isLoading ? 'Erstelle...' : 
             activeTab === 'channel' ? 'Kanal erstellen' :
             activeTab === 'dm' ? 'DM starten' :
             'Gruppe erstellen'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};