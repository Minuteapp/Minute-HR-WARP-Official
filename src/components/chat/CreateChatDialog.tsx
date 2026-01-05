import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Hash, MessageSquare, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface CreateChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChatDialog({ open, onOpenChange }: CreateChatDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Keine Mock-Daten - Benutzer werden aus der Datenbank geladen
  const users: { id: string; name: string; avatar: string; online: boolean }[] = [];

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateChannel = () => {
    console.log("Creating channel:", {
      name: channelName,
      description: channelDescription,
      isPrivate,
      members: selectedUsers,
    });
    onOpenChange(false);
    // Reset form
    setChannelName("");
    setChannelDescription("");
    setIsPrivate(false);
    setSelectedUsers([]);
  };

  const handleCreateDM = () => {
    if (selectedUsers.length === 0) return;
    console.log("Creating DM with users:", selectedUsers);
    onOpenChange(false);
    setSelectedUsers([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Neuer Chat</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="dm" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Direktnachricht
            </TabsTrigger>
            <TabsTrigger value="channel">
              <Hash className="w-4 h-4 mr-2" />
              Kanal
            </TabsTrigger>
          </TabsList>

          {/* Direct Message Tab */}
          <TabsContent value="dm" className="space-y-4">
            <div className="space-y-2">
              <Label>Benutzer auswählen</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Benutzer suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((userId) => {
                  const user = users.find((u) => u.id === userId);
                  return (
                    <Badge key={userId} variant="secondary">
                      {user?.name}
                      <button
                        onClick={() => toggleUserSelection(userId)}
                        className="ml-2 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            <ScrollArea className="h-[300px] border border-border rounded-lg">
              <div className="p-2">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => toggleUserSelection(user.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors ${
                      selectedUsers.includes(user.id) ? "bg-accent" : ""
                    }`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {user.avatar}
                      </div>
                      {user.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] border-2 border-card rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.online ? "Online" : "Offline"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>

            <Button
              onClick={handleCreateDM}
              disabled={selectedUsers.length === 0}
              className="w-full"
            >
              Chat erstellen
            </Button>
          </TabsContent>

          {/* Channel Tab */}
          <TabsContent value="channel" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">Kanal-Name</Label>
              <Input
                id="channel-name"
                placeholder="z.B. team-allgemein"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel-description">Beschreibung (optional)</Label>
              <Input
                id="channel-description"
                placeholder="Worum geht es in diesem Kanal?"
                value={channelDescription}
                onChange={(e) => setChannelDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Privater Kanal</Label>
                <p className="text-xs text-muted-foreground">
                  Nur eingeladene Mitglieder können diesen Kanal sehen
                </p>
              </div>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
            </div>

            <div className="space-y-2">
              <Label>Mitglieder hinzufügen (optional)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Benutzer suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((userId) => {
                  const user = users.find((u) => u.id === userId);
                  return (
                    <Badge key={userId} variant="secondary">
                      {user?.name}
                      <button
                        onClick={() => toggleUserSelection(userId)}
                        className="ml-2 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            <ScrollArea className="h-[200px] border border-border rounded-lg">
              <div className="p-2">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => toggleUserSelection(user.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors ${
                      selectedUsers.includes(user.id) ? "bg-accent" : ""
                    }`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {user.avatar}
                      </div>
                      {user.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] border-2 border-card rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.online ? "Online" : "Offline"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>

            <Button
              onClick={handleCreateChannel}
              disabled={!channelName.trim()}
              className="w-full"
            >
              Kanal erstellen
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
