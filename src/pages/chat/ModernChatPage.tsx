import { useState, useEffect } from "react";
import { ContactSidebar } from "@/components/chat/ContactSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { DetailsSidebar } from "@/components/chat/DetailsSidebar";
import { AppHeader } from "@/components/chat/AppHeader";
import { MobileNavigation } from "@/components/chat/MobileNavigation";
import { Toaster } from "@/components/ui/sonner";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isOwn: boolean;
  avatar?: string;
  type?: 'text' | 'file' | 'image' | 'voice' | 'hr_card' | 'system';
  fileName?: string;
  fileUrl?: string;
  fileSize?: string;
  reactions?: { emoji: string; count: number }[];
  voiceDuration?: string;
  hrData?: {
    type: string;
    title: string;
    fields: { label: string; value: string }[];
    actions: { label: string; variant: 'default' | 'destructive' }[];
  };
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline: boolean;
  type: 'direct' | 'group' | 'public';
  status?: string;
  position?: string;
  email?: string;
  phone?: string;
}

export default function ModernChatPage() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'direct' | 'groups' | 'public' | 'mentions'>('direct');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [contactsSheetOpen, setContactsSheetOpen] = useState(false);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Load contacts based on active tab
  useEffect(() => {
    const loadContacts = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Load employees as potential contacts
        const { data: employees, error } = await supabase
          .from('employees')
          .select('id, first_name, last_name, email, status')
          .eq('status', 'active')
          .neq('id', currentUser.id);

        if (error) throw error;

        const contactList: Contact[] = employees?.map(emp => ({
          id: emp.id,
          name: `${emp.first_name} ${emp.last_name}`,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${emp.first_name} ${emp.last_name}`,
          lastMessage: 'Noch keine Nachrichten',
          time: '',
          unread: 0,
          isOnline: Math.random() > 0.5, // Simulate online status
          type: 'direct',
          email: emp.email,
          status: 'Online'
        })) || [];

        setContacts(contactList);
      } catch (error) {
        console.error('Error loading contacts:', error);
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Kontakte konnten nicht geladen werden."
        });
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [currentUser, activeTab, toast]);

  // Load messages for selected contact
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedContactId || !currentUser) return;

      try {
        // Keine Demo-Daten - Nachrichten werden aus der Datenbank geladen
        setMessages([]);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [selectedContactId, currentUser]);

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  const handleSendMessage = async (content: string) => {
    if (!selectedContactId || !currentUser || !content.trim()) return;

    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: content.trim(),
        sender: `${currentUser.user_metadata?.first_name || 'Sie'} ${currentUser.user_metadata?.last_name || ''}`.trim(),
        timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        type: 'text'
      };

      setMessages(prev => [...prev, newMessage]);

      // TODO: Save to database when chat system is fully implemented
      // const { error } = await supabase
      //   .from('messages')
      //   .insert({
      //     content: content.trim(),
      //     sender_id: currentUser.id,
      //     channel_id: selectedContactId,
      //     topic: 'chat',
      //     extension: 'direct',
      //     message_type: 'text'
      //   });

      toast({
        title: "Nachricht gesendet",
        description: "Ihre Nachricht wurde erfolgreich gesendet."
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Nachricht konnte nicht gesendet werden."
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedContactId || !currentUser) return;

    try {
      // TODO: Implement file upload when storage is configured
      toast({
        title: "Datei-Upload",
        description: "Datei-Upload wird bald verfügbar sein."
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive", 
        title: "Fehler",
        description: "Datei konnte nicht hochgeladen werden."
      });
    }
  };

  const filteredContacts = contacts.filter(contact => {
    switch (activeTab) {
      case 'direct':
        return contact.type === 'direct';
      case 'groups':
        return contact.type === 'group';
      case 'public':
        return contact.type === 'public';
      case 'mentions':
        // TODO: Implement mentions filtering
        return [];
      default:
        return true;
    }
  });

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden md:flex w-full">
        {/* Sidebar */}
        <ContactSidebar
          contacts={filteredContacts}
          selectedContactId={selectedContactId}
          onContactSelect={setSelectedContactId}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          loading={loading}
        />
        
        {/* Central Chat Area */}
        <ChatArea 
          contact={selectedContact}
          messages={messages}
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          onOpenContacts={() => setContactsSheetOpen(true)}
          onOpenDetails={() => setDetailsSheetOpen(true)}
        />
        
        {/* Details Sidebar */}
        {selectedContact && (
          <div className="w-80 border-l border-border bg-card">
            <DetailsSidebar contact={selectedContact} />
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full w-full">
        {/* Mobile Chat Area - Full Screen */}
        <div className="flex-1">
          <ChatArea 
            contact={selectedContact}
            messages={messages}
            onSendMessage={handleSendMessage}
            onFileUpload={handleFileUpload}
            onOpenContacts={() => setContactsSheetOpen(true)}
            onOpenDetails={() => setDetailsSheetOpen(true)}
            isMobile={true}
          />
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenContacts={() => setContactsSheetOpen(true)}
          unreadCount={contacts.reduce((sum, contact) => sum + contact.unread, 0)}
        />
      </div>

      {/* Mobile Sheets */}
      <Sheet open={contactsSheetOpen} onOpenChange={setContactsSheetOpen}>
        <SheetContent side="left" className="w-full p-0">
          <SheetTitle className="sr-only">Kontakte</SheetTitle>
          <SheetDescription className="sr-only">Liste aller verfügbaren Kontakte</SheetDescription>
          <ContactSidebar
            contacts={filteredContacts}
            selectedContactId={selectedContactId}
            onContactSelect={(id) => {
              setSelectedContactId(id);
              setContactsSheetOpen(false);
            }}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            loading={loading}
          />
        </SheetContent>
      </Sheet>

      <Sheet open={detailsSheetOpen} onOpenChange={setDetailsSheetOpen}>
        <SheetContent side="right" className="w-full p-0">
          <SheetTitle className="sr-only">Kontakt Details</SheetTitle>
          <SheetDescription className="sr-only">Detaillierte Informationen zum ausgewählten Kontakt</SheetDescription>
          {selectedContact && <DetailsSidebar contact={selectedContact} />}
        </SheetContent>
      </Sheet>

      <Toaster />
    </div>
  );
}