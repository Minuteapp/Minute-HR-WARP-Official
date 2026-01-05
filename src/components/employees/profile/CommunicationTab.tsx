import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Users, 
  Hash, 
  Calendar, 
  Mail, 
  Phone, 
  Video,
  Crown,
  Shield,
  User,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  channels: {
    id: string;
    name: string;
    type: string;
    is_public: boolean;
    description: string | null;
  };
}

interface CommunicationTabProps {
  employeeId: string;
}

const CommunicationTab: React.FC<CommunicationTabProps> = ({ employeeId }) => {
  const [channels, setChannels] = useState<ChannelMember[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChannelMemberships();
  }, [employeeId]);

  const fetchChannelMemberships = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select(`
          id,
          channel_id,
          user_id,
          role,
          joined_at
        `)
        .eq('user_id', employeeId);

      if (error) throw error;
      
      // Get channel details separately
      const channelIds = (data || []).map(member => member.channel_id);
      
      if (channelIds.length > 0) {
        const { data: channelsData, error: channelsError } = await supabase
          .from('channels')
          .select('id, name, type, is_public, description')
          .in('id', channelIds);
        
        if (channelsError) throw channelsError;
        
        // Transform data to match ChannelMember type
        const transformedData: ChannelMember[] = (data || []).map((member: any) => {
          const channelInfo = channelsData?.find(ch => ch.id === member.channel_id);
          return {
            id: member.id,
            channel_id: member.channel_id,
            user_id: member.user_id,
            role: member.role,
            joined_at: member.joined_at,
            channels: channelInfo || {
              id: member.channel_id,
              name: 'Unbekannter Kanal',
              type: 'public',
              is_public: true,
              description: null
            }
          };
        });
        
        setChannels(transformedData);
      } else {
        setChannels([]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Kanalmitgliedschaften:', error);
      toast.error('Kanalmitgliedschaften konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'direct':
        return <Users className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'public':
        return <Hash className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return <User className="h-3 w-3 text-muted-foreground" />;
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

  const getChannelTypeLabel = (type: string) => {
    switch (type) {
      case 'public':
        return 'Öffentlich';
      case 'private':
        return 'Privat';
      case 'direct':
        return 'Direktnachricht';
      case 'department':
        return 'Abteilung';
      case 'project':
        return 'Projekt';
      case 'team':
        return 'Team';
      case 'meeting':
        return 'Meeting';
      default:
        return type;
    }
  };

  const handleChannelClick = (channelId: string) => {
    navigate(`/chat?channel=${channelId}`);
  };

  const publicChannels = channels.filter(cm => cm.channels.is_public);
  const privateChannels = channels.filter(cm => !cm.channels.is_public);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kommunikationsübersicht */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{channels.length}</p>
                <p className="text-sm text-muted-foreground">Kanäle</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{publicChannels.length}</p>
                <p className="text-sm text-muted-foreground">Öffentliche Kanäle</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{privateChannels.length}</p>
                <p className="text-sm text-muted-foreground">Private Kanäle</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanal-Details */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Alle Kanäle</TabsTrigger>
          <TabsTrigger value="public">Öffentlich</TabsTrigger>
          <TabsTrigger value="private">Privat</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Alle Kanalmitgliedschaften
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {channels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Noch keine Kanalmitgliedschaften</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {channels.map((membership) => (
                    <div key={membership.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                         onClick={() => handleChannelClick(membership.channels.id)}>
                      <div className="flex items-center gap-2">
                        {getChannelIcon(membership.channels.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{membership.channels.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {getChannelTypeLabel(membership.channels.type)}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {getRoleIcon(membership.role)}
                              <span className="text-xs text-muted-foreground">
                                {getRoleLabel(membership.role)}
                              </span>
                            </div>
                          </div>
                          {membership.channels.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {membership.channels.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Beigetreten: {new Date(membership.joined_at).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Öffentliche Kanäle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {publicChannels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Keine öffentlichen Kanalmitgliedschaften</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {publicChannels.map((membership) => (
                    <div key={membership.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                         onClick={() => handleChannelClick(membership.channels.id)}>
                      <div className="flex items-center gap-2">
                        {getChannelIcon(membership.channels.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{membership.channels.name}</p>
                            <div className="flex items-center gap-1">
                              {getRoleIcon(membership.role)}
                              <span className="text-xs text-muted-foreground">
                                {getRoleLabel(membership.role)}
                              </span>
                            </div>
                          </div>
                          {membership.channels.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {membership.channels.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="private" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Private Kanäle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {privateChannels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Keine privaten Kanalmitgliedschaften</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {privateChannels.map((membership) => (
                    <div key={membership.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                         onClick={() => handleChannelClick(membership.channels.id)}>
                      <div className="flex items-center gap-2">
                        {getChannelIcon(membership.channels.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{membership.channels.name}</p>
                            <div className="flex items-center gap-1">
                              {getRoleIcon(membership.role)}
                              <span className="text-xs text-muted-foreground">
                                {getRoleLabel(membership.role)}
                              </span>
                            </div>
                          </div>
                          {membership.channels.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {membership.channels.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Schnellaktionen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/chat')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat öffnen
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              E-Mail senden
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Anrufen
            </Button>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-2" />
              Videoanruf
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationTab;