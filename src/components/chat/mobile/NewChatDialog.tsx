import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Hash, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import NewChannelForm from "./NewChannelForm";
import MemberSelector from "./MemberSelector";
import DMSelector from "./DMSelector";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabType = "channel" | "dm" | "group";

export default function NewChatDialog({
  open,
  onOpenChange,
}: NewChatDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>("channel");
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState<
    "public" | "private" | "project" | "shift"
  >("public");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  const handleSubmit = () => {
    // Implementierung würde hier erfolgen
    console.log("Creating chat:", {
      type: activeTab,
      channelName,
      channelType,
      selectedMembers,
      selectedPerson,
    });
    onOpenChange(false);
  };

  const tabs = [
    { key: "channel" as const, icon: Hash, label: "Kanal" },
    { key: "dm" as const, icon: User, label: "DM" },
    { key: "group" as const, icon: Users, label: "Gruppe" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
          <DialogTitle className="text-2xl font-bold">
            Neuen Chat erstellen
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Kanal, DM oder Gruppenchat
          </p>
        </DialogHeader>

        <div className="flex gap-2 px-6 pb-4">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              className={cn(
                "flex-1 gap-2",
                activeTab === tab.key &&
                  "bg-primary text-primary-foreground border-primary"
              )}
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {activeTab === "channel" && (
            <>
              <NewChannelForm
                channelName={channelName}
                onChannelNameChange={setChannelName}
                channelType={channelType}
                onChannelTypeChange={setChannelType}
              />
              {channelType === "private" && (
                <div className="px-6 pb-4">
                  <MemberSelector
                    selectedMembers={selectedMembers}
                    onMembersChange={setSelectedMembers}
                  />
                </div>
              )}
            </>
          )}

          {activeTab === "dm" && (
            <DMSelector
              selectedPerson={selectedPerson}
              onPersonChange={setSelectedPerson}
            />
          )}

          {activeTab === "group" && (
            <div className="px-6 py-4">
              <MemberSelector
                selectedMembers={selectedMembers}
                onMembersChange={setSelectedMembers}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2 px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit}>
            {activeTab === "dm" ? "Starten" : "Erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
