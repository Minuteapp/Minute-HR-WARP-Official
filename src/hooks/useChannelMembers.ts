import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChannelMember } from '@/types/chat-extended';

export const useChannelMembers = (channelId: string) => {
  const [members, setMembers] = useState<ChannelMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!channelId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const loadMembers = async () => {
      try {
        // Phase 2: Fallback-Query mit separaten Abfragen
        // 1. Channel Members laden
        const { data: membersData, error: membersError } = await supabase
          .from('channel_members')
          .select('*')
          .eq('channel_id', channelId)
          .order('role', { ascending: true });

        if (membersError) {
          console.error('Error loading channel members:', membersError);
          setMembers([]);
          return;
        }

        if (!membersData || membersData.length === 0) {
          setMembers([]);
          return;
        }

        // 2. Profile-Daten separat laden
        const userIds = membersData.map(m => m.user_id).filter(Boolean);
        
        if (userIds.length === 0) {
          setMembers(membersData as ChannelMember[]);
          return;
        }

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, username')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error loading profiles:', profilesError);
          // Fallback: Members ohne Profile-Daten zurückgeben
          setMembers(membersData as ChannelMember[]);
          return;
        }

        // 3. Kombinieren
        const membersWithProfiles = membersData.map(member => ({
          ...member,
          user: profilesData?.find(p => p.id === member.user_id) || null
        }));

        setMembers(membersWithProfiles as ChannelMember[]);
      } catch (error) {
        console.error('Error in loadMembers:', error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();

    // Realtime subscription
    const subscription = supabase
      .channel(`channel-members-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channel_members',
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          loadMembers();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [channelId]);

  const addMember = async (userId: string, role: 'member' | 'admin' | 'moderator' = 'member') => {
    try {
      // Prüfen ob bereits Mitglied
      const { data: existing } = await supabase
        .from('channel_members')
        .select('id')
        .eq('channel_id', channelId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        console.log('User is already a member');
        return;
      }

      const { error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: userId,
          role,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  };

  const leaveChannel = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', user.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error leaving channel:', error);
      throw error;
    }
  };

  const deleteChannel = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Prüfen ob der Benutzer Admin/Ersteller ist
      const { data: channel } = await supabase
        .from('channels')
        .select('created_by')
        .eq('id', channelId)
        .single();

      const { data: membership } = await supabase
        .from('channel_members')
        .select('role')
        .eq('channel_id', channelId)
        .eq('user_id', user.user.id)
        .single();

      const isCreator = channel?.created_by === user.user.id;
      const isAdmin = membership?.role === 'admin';

      if (!isCreator && !isAdmin) {
        throw new Error('Nur der Ersteller oder ein Admin kann den Kanal löschen');
      }

      // Zuerst alle Mitglieder entfernen
      await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId);

      // Dann alle Nachrichten löschen
      await supabase
        .from('messages')
        .delete()
        .eq('channel_id', channelId);

      // Schließlich den Kanal löschen
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', channelId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting channel:', error);
      throw error;
    }
  };

  const canDeleteChannel = async (): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { data: channel } = await supabase
        .from('channels')
        .select('created_by')
        .eq('id', channelId)
        .single();

      const { data: membership } = await supabase
        .from('channel_members')
        .select('role')
        .eq('channel_id', channelId)
        .eq('user_id', user.user.id)
        .single();

      return channel?.created_by === user.user.id || membership?.role === 'admin';
    } catch {
      return false;
    }
  };

  return { members, loading, addMember, removeMember, leaveChannel, deleteChannel, canDeleteChannel };
};
