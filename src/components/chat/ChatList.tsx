import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Hash,
  MessageSquare,
  AtSign,
  FileText,
  Phone,
  Archive,
  Filter,
  Pin,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateChatDialog } from "./CreateChatDialog";
import { Channel } from "./types";

interface ChatListProps {
  activeTab: "chats" | "channels" | "dms" | "mentions" | "files" | "calls" | "archive";
  onTabChange: (tab: "chats" | "channels" | "dms" | "mentions" | "files" | "calls" | "archive") => void;
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showNewChatDialog: boolean;
  onShowNewChatDialog: (show: boolean) => void;
  filterType: "all" | "unread" | "pinned";
  onFilterTypeChange: (type: "all" | "unread" | "pinned") => void;
}

export function ChatList({
  activeTab,
  onTabChange,
  channels,
  selectedChannel,
  onSelectChannel,
  searchQuery,
  onSearchChange,
  showNewChatDialog,
  onShowNewChatDialog,
  filterType,
  onFilterTypeChange,
}: ChatListProps) {
  const getChannelIcon = (type: Channel["type"]) => {
    switch (type) {
      case "public":
        return <Hash className="w-4 h-4" />;
      case "private":
        return <Hash className="w-4 h-4" />;
      case "dm":
        return <MessageSquare className="w-4 h-4" />;
      case "project":
        return <Hash className="w-4 h-4 text-[#6366F1]" />;
      case "shift":
        return <Hash className="w-4 h-4 text-[#10B981]" />;
      case "hr-confidential":
        return <Hash className="w-4 h-4 text-[#F59E0B]" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  const filteredChannels = channels.filter((channel) => {
    // Apply search filter
    if (searchQuery && !channel.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Apply type filter
    if (filterType === "unread" && (!channel.unreadCount || channel.unreadCount === 0)) {
      return false;
    }
    if (filterType === "pinned" && !channel.isPinned) {
      return false;
    }

    return true;
  });

  return (
    <div className="h-full border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Chats</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onShowNewChatDialog(true)}
            className="h-8 w-8"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Suchen..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              >
                <Filter className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onFilterTypeChange("all")}>
                Alle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterTypeChange("unread")}>
                Ungelesen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterTypeChange("pinned")}>
                Angepinnt
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as any)} className="mt-4">
          <TabsList className="w-full grid grid-cols-4 h-9">
            <TabsTrigger value="chats" className="text-xs">
              Alle
            </TabsTrigger>
            <TabsTrigger value="channels" className="text-xs">
              Kanäle
            </TabsTrigger>
            <TabsTrigger value="dms" className="text-xs">
              DMs
            </TabsTrigger>
            <TabsTrigger value="mentions" className="text-xs">
              @
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChannels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Keine Chats gefunden
            </div>
          ) : (
            filteredChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onSelectChannel(channel)}
                className={`w-full p-3 rounded-lg text-left transition-colors mb-1 ${
                  selectedChannel?.id === channel.id
                    ? "bg-accent"
                    : "hover:bg-accent/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar/Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {channel.type === "dm" ? (
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {channel.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        {channel.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] border-2 border-card rounded-full" />
                        )}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        {getChannelIcon(channel.type)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {channel.isPinned && (
                          <Pin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="font-medium text-sm truncate">
                          {channel.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {channel.lastMessageTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {channel.lastMessage}
                      </p>
                      {channel.unreadCount && channel.unreadCount > 0 && (
                        <Badge className="ml-2 flex-shrink-0 bg-[#6366F1] text-white h-5 min-w-5 px-1.5">
                          {channel.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Create Chat Dialog */}
      <CreateChatDialog open={showNewChatDialog} onOpenChange={onShowNewChatDialog} />
    </div>
  );
}
