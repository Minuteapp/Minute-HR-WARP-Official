import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Bell,
  Pin,
  Search,
  FileText,
  Image,
  Link,
  Settings,
  UserPlus,
  LogOut,
  Shield,
} from "lucide-react";
import { Channel } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChatDetailsProps {
  channel: Channel;
  onClose: () => void;
}

export function ChatDetails({ channel, onClose }: ChatDetailsProps) {
  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Details</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Channel Info */}
          <div className="text-center">
            {channel.type === "dm" ? (
              <div className="relative inline-block mb-3">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-medium mx-auto">
                  {channel.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                {channel.isOnline && (
                  <span className="absolute bottom-1 right-1 w-5 h-5 bg-[#10B981] border-4 border-card rounded-full" />
                )}
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center text-2xl mx-auto mb-3">
                #
              </div>
            )}
            <h4 className="font-semibold text-lg mb-1">{channel.name}</h4>
            {channel.type === "dm" ? (
              <p className="text-sm text-muted-foreground">
                {channel.isOnline ? "Online" : "Offline"}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {channel.participants?.length || 0} Mitglieder
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="w-full">
              <Bell className="w-4 h-4 mr-2" />
              Stumm
            </Button>
            <Button variant="outline" className="w-full">
              <Pin className="w-4 h-4 mr-2" />
              Anpinnen
            </Button>
          </div>

          <Separator />

          {/* Tabs */}
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="members" className="flex-1">
                Mitglieder
              </TabsTrigger>
              <TabsTrigger value="files" className="flex-1">
                Dateien
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">
                Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-2 mt-4">
              {channel.type !== "dm" && (
                <Button variant="outline" className="w-full mb-3">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Mitglied hinzufügen
                </Button>
              )}
              <div className="space-y-2">
                {channel.participants?.map((participant, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {participant
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{participant}</p>
                      <p className="text-xs text-muted-foreground">Mitglied</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="files" className="space-y-2 mt-4">
              <Button variant="outline" className="w-full justify-start mb-2">
                <FileText className="w-4 h-4 mr-2" />
                <span className="flex-1 text-left">Dokumente</span>
                <Badge variant="secondary">12</Badge>
              </Button>
              <Button variant="outline" className="w-full justify-start mb-2">
                <Image className="w-4 h-4 mr-2" />
                <span className="flex-1 text-left">Bilder</span>
                <Badge variant="secondary">8</Badge>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Link className="w-4 h-4 mr-2" />
                <span className="flex-1 text-left">Links</span>
                <Badge variant="secondary">5</Badge>
              </Button>
            </TabsContent>

            <TabsContent value="settings" className="space-y-2 mt-4">
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium mb-2">Kanal-Typ</h5>
                  <Badge variant="outline" className="capitalize">
                    {channel.type}
                  </Badge>
                </div>
                {channel.type !== "dm" && (
                  <>
                    <Separator />
                    <div>
                      <h5 className="text-sm font-medium mb-2">Beschreibung</h5>
                      <p className="text-sm text-muted-foreground">
                        {channel.description ||
                          "Keine Beschreibung verfügbar"}
                      </p>
                    </div>
                    <Separator />
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Kanal-Einstellungen
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Danger Zone */}
          {channel.type !== "dm" && (
            <Button variant="destructive" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Kanal verlassen
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
