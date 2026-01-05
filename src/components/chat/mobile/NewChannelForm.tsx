import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Hash, Lock, Briefcase, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewChannelFormProps {
  channelName: string;
  onChannelNameChange: (name: string) => void;
  channelType: "public" | "private" | "project" | "shift";
  onChannelTypeChange: (type: "public" | "private" | "project" | "shift") => void;
}

const channelTypes = [
  { value: "public" as const, icon: Hash, label: "Öffentlich" },
  { value: "private" as const, icon: Lock, label: "Privat" },
  { value: "project" as const, icon: Briefcase, label: "Projekt" },
  { value: "shift" as const, icon: Clock, label: "Schicht" },
];

export default function NewChannelForm({
  channelName,
  onChannelNameChange,
  channelType,
  onChannelTypeChange,
}: NewChannelFormProps) {
  return (
    <div className="space-y-4 px-6 py-4">
      <div>
        <Label htmlFor="channel-name">Kanalname*</Label>
        <Input
          id="channel-name"
          placeholder="Name eingeben"
          value={channelName}
          onChange={(e) => onChannelNameChange(e.target.value)}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label>Kanaltyp</Label>
        <div className="grid grid-cols-2 gap-3 mt-1.5">
          {channelTypes.map((type) => (
            <button
              key={type.value}
              className={cn(
                "p-3 rounded-lg border-2 flex items-center gap-2 transition-colors",
                channelType === type.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => onChannelTypeChange(type.value)}
            >
              <type.icon className="w-5 h-5 text-primary" />
              <span className="font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
