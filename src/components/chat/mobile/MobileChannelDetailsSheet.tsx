import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Users, Briefcase, Bell, Pin } from "lucide-react";
import ChannelDetailsMembers from "./ChannelDetailsMembers";
import ChannelDetailsFiles from "./ChannelDetailsFiles";
import ChannelDetailsSettings from "./ChannelDetailsSettings";

interface MobileChannelDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  channelName: string;
  channelType: string;
  channelDescription?: string;
}

export default function MobileChannelDetailsSheet({
  isOpen,
  onOpenChange,
  channelId,
  channelName,
  channelType,
  channelDescription,
}: MobileChannelDetailsSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] p-0 flex flex-col">
        {/* Vorschau Badge */}
        <div className="absolute top-2 left-2 z-50 bg-gray-800/80 text-white rounded-md px-2 py-1 text-xs">
          Vorschau
        </div>

        {/* Drag-Handle */}
        <div className="w-12 h-1 bg-muted rounded-full mx-auto my-3" />

        {/* Channel-Info-Header */}
        <div className="p-6 text-center space-y-3 border-b">
          {/* Channel-Icon */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Users className="w-8 h-8 text-primary" />
          </div>

          {/* Channel-Name + Typ */}
          <div>
            <h2 className="text-xl font-bold">{channelName}</h2>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1">
              <Briefcase className="w-4 h-4" />
              <span>{channelType}</span>
            </div>
          </div>

          {/* Beschreibung */}
          {channelDescription && (
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {channelDescription}
            </p>
          )}

          {/* Action-Buttons */}
          <div className="flex gap-2 justify-center pt-2">
            <Button variant="outline" className="gap-2">
              <Bell className="w-4 h-4" />
              Benachr.
            </Button>
            <Button variant="outline" size="icon">
              <Pin className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="members" className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
            <TabsTrigger value="members">Mitglieder</TabsTrigger>
            <TabsTrigger value="files">Dateien</TabsTrigger>
            <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="members" className="h-full m-0">
              <ChannelDetailsMembers channelId={channelId} />
            </TabsContent>

            <TabsContent value="files" className="h-full m-0">
              <ChannelDetailsFiles />
            </TabsContent>

            <TabsContent value="settings" className="h-full m-0">
              <ChannelDetailsSettings />
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
