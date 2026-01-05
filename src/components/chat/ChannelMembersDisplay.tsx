import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Users, Crown, Shield, User, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChannelMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
}

interface ChannelMembersDisplayProps {
  channelId: string;
  channelName: string;
  isChannelOwner?: boolean;
}

const ChannelMembersDisplay: React.FC<ChannelMembersDisplayProps> = ({
  channelId,
  channelName,
  isChannelOwner = false
}) => {
  const [members, setMembers] = useState<ChannelMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (channelId) {
      fetchChannelMembers();
    }
  }, [channelId]);

  const fetchChannelMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select(`
          id,
          user_id,
          role,
          joined_at
        `)
        .eq('channel_id', channelId);

      if (error) throw error;
      
      // Transform data to match ChannelMember type
      const transformedData: ChannelMember[] = (data || []).map((member: any) => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        profiles: {
          id: member.user_id,
          full_name: `Benutzer ${member.user_id.slice(0, 8)}`,
          avatar_url: null,
          username: `user_${member.user_id.slice(0, 8)}`
        }
      }));
      
      setMembers(transformedData);
    } catch (error) {
      console.error('Fehler beim Laden der Kanalmitglieder:', error);
      toast.error('Kanalmitglieder konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Besitzer';
      case 'admin':
        return 'Admin';
      default:
        return 'Mitglied';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default' as const;
      case 'admin':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const filteredMembers = members.filter(member => {
    const fullName = member.profiles?.full_name || '';
    const username = member.profiles?.username || '';
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sortedMembers = filteredMembers.sort((a, b) => {
    // Sortiere nach Rolle: owner, admin, member
    const roleOrder = { owner: 0, admin: 1, member: 2 };
    return roleOrder[a.role as keyof typeof roleOrder] - roleOrder[b.role as keyof typeof roleOrder];
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teilnehmer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teilnehmer
            <Badge variant="secondary">{members.length}</Badge>
          </div>
          {isChannelOwner && (
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Suchfeld */}
        {members.length > 5 && (
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Teilnehmer suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Kanal-Info */}
        <div className="text-sm text-muted-foreground">
          Kanal: <span className="font-medium">{channelName}</span>
        </div>

        <Separator />

        {/* Mitgliederliste */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {sortedMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={member.profiles?.avatar_url || undefined} 
                  alt={member.profiles?.full_name || 'Benutzer'} 
                />
                <AvatarFallback>
                  {member.profiles?.full_name?.charAt(0) || 
                   member.profiles?.username?.charAt(0) || 
                   '?'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {member.profiles?.full_name || member.profiles?.username || 'Unbekannter Benutzer'}
                  </p>
                  {getRoleIcon(member.role)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                    {getRoleLabel(member.role)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Beigetreten: {new Date(member.joined_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Leerer Zustand */}
        {filteredMembers.length === 0 && searchTerm && (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Keine Teilnehmer gefunden</p>
          </div>
        )}

        {/* Leerer Zustand - keine Mitglieder */}
        {members.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Noch keine Teilnehmer in diesem Kanal</p>
            {isChannelOwner && (
              <Button size="sm" variant="outline" className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Teilnehmer einladen
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChannelMembersDisplay;