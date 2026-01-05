import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import MobileConversationHeader from "./MobileConversationHeader";
import MobileMessageInput from "./MobileMessageInput";
import TextMessage from "./TextMessage";
import SystemMessage from "./SystemMessage";
import WorkflowMessage from "./WorkflowMessage";
import VoiceMessage from "./VoiceMessage";
import MobileChannelDetailsSheet from "./MobileChannelDetailsSheet";
import { useChat } from "@/hooks/useChat";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MobileConversationViewProps {
  channelId: string;
  channelName: string;
  channelType: "team" | "hr" | "shift" | "dm" | "channel" | "private" | "project";
  memberCount: number;
  onBack: () => void;
}

export default function MobileConversationView({
  channelId,
  channelName,
  channelType,
  memberCount,
  onBack,
}: MobileConversationViewProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const { 
    messages, 
    sendMessage, 
    sendVoiceMessage, 
    sendMessageWithAttachment,
    loading,
    activeChannel,
    selectChannel,
    channels
  } = useChat();

  // Phase 1: State-Synchronisation - Kanal beim Mount auswählen
  useEffect(() => {
    if (channelId && channels.length > 0) {
      const channel = channels.find(c => c.id === channelId);
      if (channel && activeChannel?.id !== channelId) {
        selectChannel(channel);
      }
    }
  }, [channelId, channels, activeChannel, selectChannel]);

  // Aktuellen Benutzer laden
  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    loadCurrentUser();
  }, []);

  // Signed URLs für Voice Messages und Attachments laden
  useEffect(() => {
    const loadSignedUrls = async () => {
      const urlsToLoad: Record<string, string> = {};
      
      for (const message of messages) {
        // Voice Messages
        if (message.voice_messages?.[0]?.file_path) {
          const voiceKey = `voice-${message.voice_messages[0].id}`;
          if (!signedUrls[voiceKey]) {
            try {
              const { data } = await supabase.storage
                .from('voice-messages')
                .createSignedUrl(message.voice_messages[0].file_path, 3600);
              if (data?.signedUrl) {
                urlsToLoad[voiceKey] = data.signedUrl;
              }
            } catch (error) {
              console.error('Error loading voice URL:', error);
            }
          }
        }
        
        // Attachments
        if (message.attachments?.[0]?.file_path) {
          const attachKey = `attach-${message.attachments[0].id}`;
          if (!signedUrls[attachKey]) {
            try {
              const { data } = await supabase.storage
                .from('message-attachments')
                .createSignedUrl(message.attachments[0].file_path, 3600);
              if (data?.signedUrl) {
                urlsToLoad[attachKey] = data.signedUrl;
              }
            } catch (error) {
              console.error('Error loading attachment URL:', error);
            }
          }
        }
      }
      
      if (Object.keys(urlsToLoad).length > 0) {
        setSignedUrls(prev => ({ ...prev, ...urlsToLoad }));
      }
    };
    
    if (messages.length > 0) {
      loadSignedUrls();
    }
  }, [messages, signedUrls]);

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  const handleSendVoice = (audioBlob: Blob, duration: number) => {
    sendVoiceMessage(audioBlob, duration);
  };

  const handleSendAttachment = async (file: File, message: string) => {
    await sendMessageWithAttachment(message, file);
  };

  // Phase 2: Verbesserter Loading-State
  const isLoading = loading || !activeChannel || activeChannel.id !== channelId;

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden fixed inset-0 z-50">
      {/* Header */}
      <MobileConversationHeader
        channelName={channelName}
        channelType={channelType}
        memberCount={memberCount}
        onBack={onBack}
        onOpenDetails={() => setDetailsOpen(true)}
      />

      {/* Nachrichten-Bereich */}
      <ScrollArea className="flex-1 px-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <p className="text-muted-foreground text-sm">Noch keine Nachrichten</p>
                <p className="text-muted-foreground text-xs mt-1">Sende die erste Nachricht</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const showDate = index === 0 || 
                  new Date(message.created_at).toDateString() !== 
                  new Date(messages[index - 1].created_at).toDateString();

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground font-medium px-2">
                          {new Date(message.created_at).toLocaleDateString('de-DE', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          })}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                    )}

                    {message.message_type === 'system' ? (
                      <SystemMessage
                        message={message.content || ''}
                        timestamp={new Date(message.created_at).toLocaleTimeString('de-DE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        emoji="🔔"
                      />
                    ) : message.message_type === 'voice' && message.voice_messages?.[0] ? (
                      <VoiceMessage
                        sender={message.sender?.full_name || 'Unbekannt'}
                        initials={message.sender?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        timestamp={new Date(message.created_at).toLocaleTimeString('de-DE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        duration={message.voice_messages[0].duration}
                        fileUrl={signedUrls[`voice-${message.voice_messages[0].id}`] || ''}
                      />
                    ) : (
                      <TextMessage
                        sender={message.sender?.full_name || 'Unbekannt'}
                        initials={message.sender?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        message={message.content || ''}
                        timestamp={new Date(message.created_at).toLocaleTimeString('de-DE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        isOwn={message.sender_id === currentUserId}
                        attachment={message.attachments?.[0] ? {
                          name: message.attachments[0].file_name,
                          size: `${(message.attachments[0].file_size / 1024 / 1024).toFixed(1)} MB`,
                          url: signedUrls[`attach-${message.attachments[0].id}`],
                        } : undefined}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </ScrollArea>

      {/* Message-Input */}
      <MobileMessageInput 
        onSend={handleSendMessage}
        onSendVoice={handleSendVoice}
        onSendAttachment={handleSendAttachment}
      />

      {/* Channel-Details-Sheet */}
      <MobileChannelDetailsSheet
        isOpen={detailsOpen}
        onOpenChange={setDetailsOpen}
        channelId={channelId}
        channelName={channelName}
        channelType="Projekt-Kanal"
        channelDescription="Dieser Kanal dient der Kommunikation und Koordination im Team Phoenix für das aktuelle Sprint-Projekt."
      />
    </div>
  );
}
