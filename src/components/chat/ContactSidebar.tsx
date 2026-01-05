import { useState } from "react";
import { Search, Filter, MessageSquare, Hash, Mail, AtSign, Phone, FileText, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Contact {
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

interface ContactSidebarProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onContactSelect: (id: string) => void;
  activeTab: 'direct' | 'groups' | 'public' | 'mentions';
  onTabChange: (tab: 'direct' | 'groups' | 'public' | 'mentions') => void;
  loading?: boolean;
  isMobile?: boolean;
}

export function ContactSidebar({ 
  contacts, 
  selectedContactId, 
  onContactSelect, 
  activeTab, 
  onTabChange,
  loading = false,
  isMobile = false 
}: ContactSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`${isMobile ? 'w-full' : 'w-80'} bg-background border-r border-border flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Chat</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Filter className="w-4 h-4" />
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Vorschau
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suchen..."
            className="pl-10 bg-muted/30 border-border"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => onTabChange(value)} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 m-0 rounded-none h-12 bg-background border-b border-border">
          <TabsTrigger 
            value="direct" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Chats
          </TabsTrigger>
          <TabsTrigger 
            value="groups" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Kanäle
          </TabsTrigger>
          <TabsTrigger 
            value="public" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            DMs
          </TabsTrigger>
          <TabsTrigger 
            value="mentions" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Erwähnungen
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="flex-1 mt-2">
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3 p-3">
                    <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => onContactSelect(contact.id)}
                  className={`flex items-center space-x-3 p-3 mx-2 rounded-lg cursor-pointer transition-colors ${
                    selectedContactId === contact.id 
                      ? 'bg-accent text-accent-foreground' 
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="relative">
                    <Avatar className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'}`}>
                      <AvatarImage src={contact.avatar} alt={contact.name} />
                      <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {contact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium truncate ${isMobile ? 'text-sm' : ''}`}>
                        {contact.name}
                      </h3>
                      <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {contact.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-muted-foreground truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {contact.lastMessage}
                      </p>
                      {contact.unread > 0 && (
                        <Badge 
                          variant="default" 
                          className={`${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'}`}
                        >
                          {contact.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? 'Keine Kontakte gefunden' : 
                  activeTab === 'direct' ? 'Keine direkten Kontakte vorhanden' :
                  activeTab === 'groups' ? 'Keine Gruppen vorhanden' :
                  'Keine öffentlichen Kanäle vorhanden'
                }
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="border-t border-border p-2 flex items-center justify-around bg-background">
        <Button variant="ghost" size="sm" className="flex-1 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground">
          <Phone className="w-4 h-4" />
          <span className="text-sm">Anrufe</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground">
          <FileText className="w-4 h-4" />
          <span className="text-sm">Dateien</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground">
          <Archive className="w-4 h-4" />
          <span className="text-sm">Archiv</span>
        </Button>
      </div>
    </div>
  );
}