import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedChannel, ExtendedMessage, UserPresence } from '@/types/chat-extended';
import { useToast } from '@/hooks/use-toast';

export const useChat = () => {
  const [channels, setChannels] = useState<ExtendedChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<ExtendedChannel | null>(null);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [presence, setPresence] = useState<Record<string, UserPresence>>({});
  const [commands, setCommands] = useState<any[]>([]);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(false);
  const { toast } = useToast();
  
  // Refs für persistenten Typing-Channel und Debouncing
  const typingChannelRef = useRef<RealtimeChannel | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load available chat commands
  const loadCommands = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('chat_commands')
        .select('*')
        .eq('is_active', true)
        .order('command_key');

      if (error) throw error;
      setCommands(data || []);
    } catch (error) {
      console.error('Error loading commands:', error);
    }
  }, []);

  // Load channels
  const loadChannels = useCallback(async () => {
    try {
      // Lade zunächst nur die Channels
      const { data: channelsData, error: channelsError } = await supabase
        .from('channels')
        .select('*')
        .order('updated_at', { ascending: false });

      if (channelsError) throw channelsError;

      if (!channelsData || channelsData.length === 0) {
        setChannels([]);
        return;
      }

      // Lade channel_members separat für bessere RLS-Kompatibilität
      const { data: membersData } = await supabase
        .from('channel_members')
        .select('channel_id, user_id, role, last_read_at')
        .in('channel_id', channelsData.map(c => c.id));

      // Hole die aktuelle User-ID
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const currentUserId = currentUser?.id;

      // Für DMs: Lade Profilbilder der Chatpartner
      const directChannels = channelsData.filter(c => c.type === 'direct');
      const partnerUserIds: string[] = [];
      
      if (directChannels.length > 0 && currentUserId) {
        directChannels.forEach(channel => {
          const channelMembers = membersData?.filter(m => m.channel_id === channel.id) || [];
          const partnerMember = channelMembers.find(m => m.user_id !== currentUserId);
          if (partnerMember) {
            partnerUserIds.push(partnerMember.user_id);
          }
        });
      }

      // Lade Profile der Chatpartner
      let profilesMap: Record<string, { full_name?: string; avatar_url?: string }> = {};
      if (partnerUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', partnerUserIds);
        
        if (profilesData) {
          profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = { full_name: profile.full_name, avatar_url: profile.avatar_url };
            return acc;
          }, {} as Record<string, { full_name?: string; avatar_url?: string }>);
        }
      }

      // Kombiniere die Daten
      const channelsWithMembers = channelsData.map(channel => {
        const members = membersData?.filter(m => m.channel_id === channel.id) || [];
        
        // Bei DMs: Avatar des Chatpartners verwenden
        let avatarUrl: string | undefined;
        let channelName = channel.name;
        
        if (channel.type === 'direct' && currentUserId) {
          const partnerMember = members.find(m => m.user_id !== currentUserId);
          if (partnerMember && profilesMap[partnerMember.user_id]) {
            avatarUrl = profilesMap[partnerMember.user_id].avatar_url;
            // Verwende den Namen des Partners falls der Channel-Name generisch ist
            if (profilesMap[partnerMember.user_id].full_name) {
              channelName = profilesMap[partnerMember.user_id].full_name || channel.name;
            }
          }
        }
        
        return {
          ...channel,
          name: channelName,
          channel_members: members,
          unread_count: 0,
          member_count: members.length,
          avatar_url: avatarUrl
        };
      });

      setChannels(channelsWithMembers);
    } catch (error) {
      console.error('Error loading channels:', error);
      toast({
        title: 'Fehler',
        description: 'Kanäle konnten nicht geladen werden',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Load messages for active channel
  const loadMessages = useCallback(async (channelId: string) => {
    console.log('[Chat] loadMessages called for channel:', channelId);
    
    if (!channelId) {
      console.error('[Chat] loadMessages: No channelId provided!');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          message_reactions (
            id,
            user_id,
            reaction,
            created_at
          ),
          message_attachments (
            id,
            file_name,
            file_type,
            file_size,
            file_path,
            uploaded_at
          ),
          voice_messages (
            id,
            duration,
            file_path
          )
        `)
        .eq('channel_id', channelId)
        .is('parent_message_id', null)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('[Chat] loadMessages error:', error);
        throw error;
      }

      console.log('[Chat] loadMessages: Loaded', data?.length || 0, 'messages from DB');

      // Lade Sender-Profile separat (keine FK-Relation vorhanden)
      const senderIds = [...new Set(data?.map(m => m.sender_id).filter(Boolean) || [])];
      let senderProfiles: Record<string, { id: string; full_name: string | null; avatar_url: string | null }> = {};
      
      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', senderIds);
        
        senderProfiles = (profiles || []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, { id: string; full_name: string | null; avatar_url: string | null }>);
      }

      // Berechne Thread-Counts
      const messageIds = data?.map(m => m.id) || [];
      let threadCounts: Record<string, number> = {};

      if (messageIds.length > 0) {
        const { data: threadData } = await supabase
          .from('messages')
          .select('parent_message_id')
          .in('parent_message_id', messageIds)
          .not('parent_message_id', 'is', null);

        threadCounts = (threadData || []).reduce((acc, { parent_message_id }) => {
          acc[parent_message_id] = (acc[parent_message_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      }

      // Merge thread_count, attachments und sender in messages
      const messagesWithFullData = (data || []).map(msg => ({
        ...msg,
        attachments: msg.message_attachments,
        thread_count: threadCounts[msg.id] || 0,
        sender: senderProfiles[msg.sender_id] || null
      }));

      console.log('[Chat] loadMessages: Setting', messagesWithFullData.length, 'messages to state');
      setMessages(messagesWithFullData);
      console.log('[Chat] loadMessages: setMessages completed');
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Fehler',
        description: 'Nachrichten konnten nicht geladen werden',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Ensure user is channel member before operations
  const ensureChannelMembership = useCallback(async (channelId: string, userId: string): Promise<boolean> => {
    try {
      console.log('[Chat] Checking channel membership for user:', userId, 'in channel:', channelId);
      
      // Check if already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('channel_members')
        .select('id')
        .eq('channel_id', channelId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('[Chat] Error checking membership:', checkError);
        return false;
      }

      if (existingMember) {
        console.log('[Chat] User is already a member');
        return true;
      }

      // Add user as member
      console.log('[Chat] Adding user as channel member...');
      const { error: insertError } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: userId,
          role: 'member'
        });

      if (insertError) {
        // Ignore duplicate key errors
        if (insertError.message?.includes('duplicate key')) {
          console.log('[Chat] User already a member (duplicate key)');
          return true;
        }
        console.error('[Chat] Error adding member:', insertError);
        return false;
      }

      console.log('[Chat] Successfully added user as channel member');
      return true;
    } catch (error) {
      console.error('[Chat] Error ensuring membership:', error);
      return false;
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (content: string, type: string = 'text', metadata: Record<string, any> = {}) => {
    if (!activeChannel) {
      console.error('[Chat] No active channel selected');
      toast({
        title: 'Fehler',
        description: 'Kein Kanal ausgewählt',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('[Chat] Auth error:', authError);
        toast({
          title: 'Authentifizierungsfehler',
          description: 'Bitte erneut anmelden',
          variant: 'destructive'
        });
        return;
      }
      
      if (!user) {
        console.error('[Chat] No user found');
        toast({
          title: 'Nicht angemeldet',
          description: 'Bitte melden Sie sich an, um Nachrichten zu senden',
          variant: 'destructive'
        });
        return;
      }

      // Ensure membership before sending
      const isMember = await ensureChannelMembership(activeChannel.id, user.id);
      if (!isMember) {
        console.error('[Chat] Could not ensure channel membership');
        toast({
          title: 'Fehler',
          description: 'Konnte dem Kanal nicht beitreten. Bitte versuchen Sie es erneut.',
          variant: 'destructive'
        });
        return;
      }

      console.log('[Chat] Sending message as user:', user.id, 'to channel:', activeChannel.id);

      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          content,
          sender_id: user.id,
          channel_id: activeChannel.id,
          message_type: type,
          metadata
        })
        .select()
        .single();

      if (error) {
        console.error('[Chat] Error inserting message:', error);
        throw error;
      }

      console.log('[Chat] Message sent successfully:', newMessage?.id);

      // Check for @mentions and create notifications
      const mentions = content.match(/@(\w+)/g);
      if (mentions && newMessage) {
        for (const mention of mentions) {
          const username = mention.slice(1);
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();
          
          if (profile) {
            await supabase.from('chat_notifications').insert({
              user_id: profile.id,
              channel_id: activeChannel.id,
              message_id: newMessage.id,
              type: 'mention',
              read: false,
            });
          }
        }
      }

      // Reload messages to show the new message
      await loadMessages(activeChannel.id);
    } catch (error: any) {
      console.error('[Chat] Error sending message:', error);
      toast({
        title: 'Nachricht konnte nicht gesendet werden',
        description: error?.message || 'Unbekannter Fehler',
        variant: 'destructive'
      });
    }
  }, [activeChannel, loadMessages, toast, ensureChannelMembership]);

  // Send voice message
  const sendVoiceMessage = useCallback(async (audioBlob: Blob, duration: number) => {
    if (!activeChannel) {
      console.error('[Chat] No active channel for voice message');
      toast({
        title: 'Fehler',
        description: 'Kein Kanal ausgewählt',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('[Chat] Starting voice message upload...');
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: 'Nicht angemeldet',
          description: 'Bitte melden Sie sich an',
          variant: 'destructive'
        });
        return;
      }

      // Ensure membership before sending
      const isMember = await ensureChannelMembership(activeChannel.id, user.user.id);
      if (!isMember) {
        toast({
          title: 'Fehler',
          description: 'Konnte dem Kanal nicht beitreten',
          variant: 'destructive'
        });
        return;
      }

      // Upload to Supabase Storage mit user_id Pfad
      const fileName = `${user.user.id}/voice-${Date.now()}.webm`;
      console.log('[Chat] Uploading voice to path:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-messages')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          cacheControl: '3600'
        });
      
      if (uploadError) {
        console.error('[Chat] Voice upload error:', uploadError);
        throw uploadError;
      }

      console.log('[Chat] Voice uploaded successfully:', uploadData.path);

      // Insert Message
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert({
          channel_id: activeChannel.id,
          sender_id: user.user.id,
          content: '[Sprachnachricht]',
          message_type: 'voice',
        })
        .select()
        .single();
      
      if (msgError) {
        console.error('[Chat] Message insert error:', msgError);
        throw msgError;
      }

      // Insert Voice Message Record
      const { error: voiceError } = await supabase
        .from('voice_messages')
        .insert({
          message_id: message.id,
          duration,
          file_path: uploadData.path,
        });

      if (voiceError) {
        console.error('[Chat] Voice message record error:', voiceError);
        throw voiceError;
      }

      console.log('[Chat] Voice message sent successfully');
      await loadMessages(activeChannel.id);

      toast({
        title: 'Erfolg',
        description: 'Sprachnachricht gesendet'
      });
    } catch (error: any) {
      console.error('[Chat] Error sending voice message:', error);
      toast({
        title: 'Sprachnachricht fehlgeschlagen',
        description: error?.message || 'Unbekannter Fehler',
        variant: 'destructive'
      });
    }
  }, [activeChannel, loadMessages, toast, ensureChannelMembership]);

  // Join channel
  const joinChannel = useCallback(async (channelId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: user.user.id,
          role: 'member'
        });

      if (error && !error.message.includes('duplicate key')) throw error;
      
      await loadChannels();
    } catch (error) {
      console.error('Error joining channel:', error);
    }
  }, [loadChannels]);

  // Create channel
  const createChannel = useCallback(async (name: string, type: string, isPrivate: boolean = false, description?: string, memberIds?: string[]) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: channel, error } = await supabase
        .from('channels')
        .insert({
          name,
          type,
          created_by: user.user.id,
          is_public: !isPrivate,
          is_private: isPrivate,
          description
        })
        .select()
        .single();

      if (error) throw error;

      // Phase 3: Creator automatisch als "owner" Member hinzufügen
      if (channel) {
        const { error: ownerError } = await supabase
          .from('channel_members')
          .insert({
            channel_id: channel.id,
            user_id: user.user.id,
            role: 'owner'
          });

        if (ownerError) {
          console.error('Error adding channel creator as owner:', ownerError);
        }
      }

      // Füge ausgewählte Mitglieder hinzu
      if (memberIds && memberIds.length > 0 && channel) {
        const members = memberIds.map(userId => ({
          channel_id: channel.id,
          user_id: userId,
          role: 'member'
        }));

        const { error: memberError } = await supabase
          .from('channel_members')
          .insert(members);

        if (memberError) {
          console.error('Error adding members:', memberError);
        }
      }
      
      await loadChannels();
      toast({
        title: 'Erfolg',
        description: `Kanal wurde erstellt${memberIds?.length ? ` und ${memberIds.length} Mitglied(er) eingeladen` : ''}`
      });
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: 'Fehler',
        description: 'Kanal konnte nicht erstellt werden',
        variant: 'destructive'
      });
    }
  }, [loadChannels, toast]);

  // React to message
  const reactToMessage = useCallback(async (messageId: string, reaction: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.user.id)
        .eq('reaction', reaction)
        .maybeSingle();

      if (existing) {
        await supabase.from('message_reactions').delete().eq('id', existing.id);
      } else {
        await supabase.from('message_reactions').insert({
          message_id: messageId,
          user_id: user.user.id,
          reaction
        });
      }
    } catch (error) {
      console.error('Error reacting to message:', error);
    }
  }, []);

  // Set active channel with automatic membership (Phase 3)
  const selectChannel = useCallback((channel: ExtendedChannel) => {
    setActiveChannel(channel);
    loadMessages(channel.id);
    // Automatisch beitreten, wenn noch nicht Mitglied
    joinChannel(channel.id);
  }, [loadMessages, joinChannel]);

  // Handle slash command
  const handleSlashCommand = useCallback(async (input: string, channelId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data: user } = await supabase.auth.getUser();

      const response = await fetch('https://teydpbqficbdgqovoqlo.supabase.co/functions/v1/chat-command-handler', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel_id: channelId,
          input,
          user_locale: 'de'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Command failed');
      }

      const result = await response.json();
      
      // Track command execution
      if (user.user && result.command) {
        await supabase.from('chat_command_executions').insert({
          command_id: result.command.id,
          user_id: user.user.id,
          channel_id: channelId,
          input_data: { command: input },
          status: 'success',
          result_data: result,
        });
      }
      
      toast({
        title: 'Befehl ausgeführt',
        description: `${result.command.label} wurde geöffnet`
      });

      // Reload messages to show the card
      if (activeChannel) {
        await loadMessages(activeChannel.id);
      }

      return result;
    } catch (error: any) {
      console.error('Error handling slash command:', error);
      
      // Track failed execution
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from('chat_command_executions').insert({
          user_id: user.user.id,
          channel_id: channelId,
          input_data: { command: input },
          status: 'failed',
          result_data: { error: error.message },
        });
      }
      
      toast({
        variant: 'destructive',
        title: 'Befehl fehlgeschlagen',
        description: error.message || 'Der Befehl konnte nicht ausgeführt werden'
      });
      throw error;
    }
  }, [activeChannel, loadMessages, toast]);

  // Submit interactive card
  const submitCard = useCallback(async (cardId: string, formData: Record<string, any>) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data: user } = await supabase.auth.getUser();

      const response = await fetch('https://teydpbqficbdgqovoqlo.supabase.co/functions/v1/chat-card-submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          card_id: cardId,
          form_data: formData
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Submission failed');
      }

      const result = await response.json();
      
      // Track card submission
      if (user.user && activeChannel) {
        await supabase.from('chat_command_executions').insert({
          user_id: user.user.id,
          channel_id: activeChannel.id,
          input_data: { card_id: cardId, form_data: formData },
          status: 'success',
          result_data: result,
        });
      }
      
      toast({
        title: 'Erfolgreich eingereicht',
        description: result.message || 'Formular wurde verarbeitet'
      });

      // Reload messages to show updated card
      if (activeChannel) {
        await loadMessages(activeChannel.id);
      }

      return result;
    } catch (error: any) {
      console.error('Error submitting card:', error);
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message || 'Formular konnte nicht eingereicht werden'
      });
      throw error;
    }
  }, [activeChannel, loadMessages, toast]);

  // Detect intent from natural language
  const detectIntent = useCallback(async (text: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return null;

      const response = await fetch('https://teydpbqficbdgqovoqlo.supabase.co/functions/v1/chat-intent-detector', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          user_locale: 'de'
        })
      });

      if (!response.ok) return null;

      const result = await response.json();
      return result.intent_detected ? result : null;
    } catch (error) {
      console.error('Error detecting intent:', error);
      return null;
    }
  }, []);

  // Initialize
  useEffect(() => {
    Promise.all([
      loadChannels(),
      loadCommands()
    ]).finally(() => setLoading(false));
  }, [loadChannels, loadCommands]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!activeChannel) return;

    const channel = supabase
      .channel(`messages-${activeChannel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${activeChannel.id}`
        },
        async (payload) => {
          // Load the complete message with relations
          const { data: newMessage } = await supabase
            .from('messages')
            .select(`
              *,
              message_reactions (
                id,
                user_id,
                reaction,
                created_at
              ),
              message_attachments (
                id,
                file_name,
                file_type,
                file_size,
                file_path,
                uploaded_at
              ),
              voice_messages (
                id,
                duration,
                file_path
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (newMessage) {
            // Lade Sender-Profil für die neue Nachricht
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .eq('id', newMessage.sender_id)
              .single();

            const messageWithFullData = {
              ...newMessage,
              attachments: newMessage.message_attachments,
              sender: senderProfile || null
            };
            console.log('[Chat] Realtime INSERT: Adding message', messageWithFullData.id);
            setMessages(prev => {
              // Duplikate verhindern
              if (prev.some(m => m.id === messageWithFullData.id)) {
                console.log('[Chat] Realtime INSERT: Message already exists, skipping');
                return prev;
              }
              console.log('[Chat] Realtime INSERT: Message added to state');
              return [...prev, messageWithFullData as ExtendedMessage];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${activeChannel.id}`
        },
        async (payload) => {
          // Reload complete message with relations
          const { data: updatedMessage } = await supabase
            .from('messages')
            .select(`
              *,
              message_reactions (
                id,
                user_id,
                reaction,
                created_at
              ),
              message_attachments (
                id,
                file_name,
                file_type,
                file_size,
                file_path,
                uploaded_at
              ),
              voice_messages (
                id,
                duration,
                file_path
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (updatedMessage) {
            setMessages(prev => prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage as ExtendedMessage : msg
            ));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${activeChannel.id}`
        },
        (payload) => {
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannel]);

  // Send message with attachment
  const sendMessageWithAttachment = useCallback(async (
    content: string, 
    file: File
  ) => {
    if (!activeChannel) return;

    try {
      // Phase 1: Upload file to Storage mit user_id Pfad
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');
      
      const fileName = `${user.user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Create message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          content: content || file.name,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          channel_id: activeChannel.id,
          message_type: 'file'
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // 3. Create attachment record
      const { error: attachmentError } = await supabase
        .from('message_attachments')
        .insert({
          message_id: messageData.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_path: fileName
        });

      if (attachmentError) throw attachmentError;

      // Reload messages
      await loadMessages(activeChannel.id);

      toast({
        title: 'Erfolg',
        description: 'Datei gesendet'
      });
    } catch (error) {
      console.error('Error sending file:', error);
      toast({
        title: 'Fehler',
        description: 'Datei konnte nicht gesendet werden',
        variant: 'destructive'
      });
    }
  }, [activeChannel, loadMessages, toast]);

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content: newContent,
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;

      // Reload messages
      if (activeChannel) {
        await loadMessages(activeChannel.id);
      }

      toast({
        title: 'Erfolg',
        description: 'Nachricht wurde bearbeitet'
      });
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: 'Fehler',
        description: 'Nachricht konnte nicht bearbeitet werden',
        variant: 'destructive'
      });
    }
  }, [activeChannel, loadMessages, toast]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      // Reload messages
      if (activeChannel) {
        await loadMessages(activeChannel.id);
      }

      toast({
        title: 'Erfolg',
        description: 'Nachricht wurde gelöscht'
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Fehler',
        description: 'Nachricht konnte nicht gelöscht werden',
        variant: 'destructive'
      });
    }
  }, [activeChannel, loadMessages, toast]);

  // Reply to message (thread)
  const replyToMessage = useCallback(async (parentMessageId: string, content: string) => {
    if (!activeChannel) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('messages')
        .insert({
          content,
          sender_id: user.user.id,
          channel_id: activeChannel.id,
          message_type: 'text',
          parent_message_id: parentMessageId
        });

      if (error) throw error;

      // Reload messages
      await loadMessages(activeChannel.id);

      toast({
        title: 'Erfolg',
        description: 'Antwort wurde gesendet'
      });
    } catch (error) {
      console.error('Error replying to message:', error);
      toast({
        title: 'Fehler',
        description: 'Antwort konnte nicht gesendet werden',
        variant: 'destructive'
      });
    }
  }, [activeChannel, loadMessages, toast]);

  // Load thread messages
  const loadThreadMessages = useCallback(async (parentMessageId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`*`)
        .eq('parent_message_id', parentMessageId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading thread messages:', error);
      return [];
    }
  }, []);

  // Cleanup typing channel bei Channel-Wechsel
  useEffect(() => {
    return () => {
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
        typingChannelRef.current = null;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [activeChannel?.id]);

  // Send typing indicator - OPTIMIERT mit persistentem Channel und Debouncing
  const sendTypingIndicator = useCallback(() => {
    if (!activeChannel) return;

    // Debounce: Nur alle 2 Sekunden senden
    const now = Date.now();
    if (now - lastTypingSentRef.current < 2000) return;
    lastTypingSentRef.current = now;

    // Async operation in separater Funktion um useCallback nicht zu blockieren
    const sendIndicator = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        // Channel nur einmal erstellen und wiederverwenden
        if (!typingChannelRef.current) {
          typingChannelRef.current = supabase.channel(`typing-${activeChannel.id}`);
          await typingChannelRef.current.subscribe();
        }

        await typingChannelRef.current.track({
          user_id: user.user.id,
          typing: true,
          timestamp: now
        });

        // Clear vorheriges Timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Auto-clear nach 3 Sekunden
        typingTimeoutRef.current = setTimeout(async () => {
          if (typingChannelRef.current) {
            try {
              await typingChannelRef.current.track({
                user_id: user.user.id,
                typing: false,
                timestamp: Date.now()
              });
            } catch (e) {
              // Ignore cleanup errors
            }
          }
        }, 3000);
      } catch (error) {
        console.error('Error sending typing indicator:', error);
      }
    };

    sendIndicator();
  }, [activeChannel]);

  // Subscribe to typing indicators
  const subscribeToTyping = useCallback((callback: (userId: string, typing: boolean) => void) => {
    if (!activeChannel) return () => {};
    
    const channel = supabase.channel(`typing-sub-${activeChannel.id}`);
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        Object.entries(state).forEach(([key, presences]: [string, any[]]) => {
          const presence = presences[0];
          if (presence) {
            callback(presence.user_id, presence.typing);
          }
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannel]);

  return {
    channels,
    activeChannel,
    messages,
    loading,
    presence,
    commands,
    autoTranslateEnabled,
    setAutoTranslateEnabled,
    sendMessage,
    sendVoiceMessage,
    sendMessageWithAttachment,
    selectChannel,
    joinChannel,
    createChannel,
    reactToMessage,
    editMessage,
    deleteMessage,
    replyToMessage,
    loadThreadMessages,
    sendTypingIndicator,
    subscribeToTyping,
    loadChannels,
    handleSlashCommand,
    submitCard,
    detectIntent
  };
};