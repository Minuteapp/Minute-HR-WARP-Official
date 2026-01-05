import { useState } from "react";
import { Search, Plus, Users, MessageSquare, Filter, Archive, Phone, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChatArchive } from "@/hooks/useChatArchive";

export interface ChatItem {
  id: string;
  name: string;
  type: "team" | "hr" | "shift" | "dm" | "public" | "direct" | "project" | "department" | "group";
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  avatar?: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

interface ChatSidebarProps {
  chats: ChatItem[];
  activeTab: "chats" | "channels" | "dms" | "mentions" | "archive";
  selectedChat: ChatItem | null;
  onTabChange: (tab: "chats" | "channels" | "dms" | "mentions" | "archive") => void;
  onSelectChat: (chat: ChatItem) => void;
  onNewChat?: () => void;
}

export default function ChatSidebar({
  chats,
  activeTab,
  selectedChat,
  onTabChange,
  onSelectChat,
  onNewChat,
}: ChatSidebarProps) {
  const { archivedChannels, restoreChannel } = useChatArchive();
  const { toast } = useToast();
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    unreadOnly: false,
    typeTeam: true,
    typeDm: true,
    typePublic: true,
  });
  const getAvatarIcon = (type: ChatItem["type"]) => {
    switch (type) {
      case "team":
        return <Users className="w-4 h-4" />;
      case "hr":
        return <MessageSquare className="w-4 h-4" />;
      case "shift":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Gestern';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('de-DE', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <div className="flex flex-col h-full border-r bg-card">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chat</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowFilterDialog(true)}>
              <Filter className="w-4 h-4" />
            </Button>
            <Button size="sm" className="gap-2" onClick={onNewChat}>
              <Plus className="w-4 h-4" />
              Neuer Chat
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Suchen..." className="pl-9" />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 text-sm">
          <button
            onClick={() => onTabChange("chats")}
            className={cn(
              "pb-2 border-b-2 transition-colors",
              activeTab === "chats"
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Chats
          </button>
          <button
            onClick={() => onTabChange("channels")}
            className={cn(
              "pb-2 border-b-2 transition-colors",
              activeTab === "channels"
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Kanäle
          </button>
          <button
            onClick={() => onTabChange("dms")}
            className={cn(
              "pb-2 border-b-2 transition-colors",
              activeTab === "dms"
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            DMs
          </button>
          <button
            onClick={() => onTabChange("mentions")}
            className={cn(
              "pb-2 border-b-2 transition-colors",
              activeTab === "mentions"
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Erwähnungen
          </button>
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {activeTab === 'archive' ? (
            archivedChannels.length > 0 ? (
              archivedChannels.map((archive) => (
                <div
                  key={archive.id}
                  className="w-full p-3 rounded-lg mb-1 bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Archive className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">
                          {archive.channel?.name || 'Archivierter Kanal'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(archive.archive_date).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => restoreChannel(archive.id)}
                    >
                      Wiederherstellen
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 text-muted-foreground text-sm">
                Keine archivierten Kanäle
              </div>
            )
          ) : (
            // Filter chats based on active tab and filters
            chats
              .filter((chat) => {
                // Tab-Filter
                if (activeTab === 'channels') return ['team', 'public', 'hr', 'shift', 'project', 'department', 'group'].includes(chat.type);
                if (activeTab === 'dms') return chat.type === 'dm' || chat.type === 'direct';
                if (activeTab === 'mentions') return true; // TODO: Filter by mentions
                // Chats Tab: Alle anzeigen
                return true;
              })
              .filter((chat) => {
                // Zusätzliche Filter
                if (filters.unreadOnly && !chat.unreadCount) return false;
                if (!filters.typeTeam && chat.type === 'team') return false;
                if (!filters.typeDm && (chat.type === 'dm' || chat.type === 'direct')) return false;
                if (!filters.typePublic && chat.type === 'public') return false;
                return true;
              })
              .map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={cn(
                "w-full p-3 rounded-lg text-left hover:bg-accent transition-colors mb-1",
                selectedChat?.id === chat.id && "bg-accent"
              )}
            >
              <div className="flex gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={chat.avatarUrl} alt={chat.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {chat.type === "dm" || chat.type === "direct" ? getInitials(chat.name) : getAvatarIcon(chat.type)}
                    </AvatarFallback>
                  </Avatar>
                  {chat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{chat.name}</span>
                      {chat.name === "Team Phoenix" && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(chat.timestamp)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage || 'Keine Nachrichten'}</p>
                    {chat.unreadCount && (
                      <Badge className="ml-2 h-5 min-w-5 px-1.5">{chat.unreadCount}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t flex justify-around">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs gap-1"
          onClick={() => toast({ title: "Anrufe", description: "Funktion in Entwicklung" })}
        >
          <Phone className="w-3 h-3" />
          Anrufe
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs gap-1"
          onClick={() => toast({ title: "Dateien", description: "Funktion in Entwicklung" })}
        >
          <FileText className="w-3 h-3" />
          Dateien
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs gap-1"
          onClick={() => onTabChange('archive')}
        >
          <Archive className="w-3 h-3" />
          Archiv
          {archivedChannels.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
              {archivedChannels.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chat Filter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="unreadOnly" 
                checked={filters.unreadOnly}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, unreadOnly: !!checked }))}
              />
              <Label htmlFor="unreadOnly">Nur ungelesene Nachrichten</Label>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Nach Typ filtern</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="typeTeam" 
                    checked={filters.typeTeam}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, typeTeam: !!checked }))}
                  />
                  <Label htmlFor="typeTeam">Team Chats</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="typeDm" 
                    checked={filters.typeDm}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, typeDm: !!checked }))}
                  />
                  <Label htmlFor="typeDm">Direktnachrichten</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="typePublic" 
                    checked={filters.typePublic}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, typePublic: !!checked }))}
                  />
                  <Label htmlFor="typePublic">Öffentliche Kanäle</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFilters({ unreadOnly: false, typeTeam: true, typeDm: true, typePublic: true })}
              >
                Zurücksetzen
              </Button>
              <Button size="sm" onClick={() => setShowFilterDialog(false)}>
                Anwenden
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
