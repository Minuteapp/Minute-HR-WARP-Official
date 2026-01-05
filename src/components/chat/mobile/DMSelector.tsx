import { Info, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import MemberSelector from "./MemberSelector";

interface DMSelectorProps {
  selectedPerson: string | null;
  onPersonChange: (personId: string | null) => void;
}

// Real data will come from useChannelMembers
const mockMembers: { id: string; name: string }[] = [];

export default function DMSelector({
  selectedPerson,
  onPersonChange,
}: DMSelectorProps) {
  const selectedPersonName = selectedPerson
    ? mockMembers.find((m) => m.id === selectedPerson)?.name
    : null;

  return (
    <div className="space-y-4 px-6 py-4">
      <div className="bg-muted/50 border rounded-lg p-3 flex gap-2">
        <Info className="w-5 h-5 text-muted-foreground shrink-0" />
        <p className="text-sm text-muted-foreground">
          Wählen Sie eine Person aus, um eine Direktnachricht zu starten
        </p>
      </div>

      {selectedPerson && selectedPersonName && (
        <div className="bg-muted/30 rounded-lg p-3">
          <Badge className="bg-primary text-primary-foreground gap-2 text-sm px-3 py-1.5">
            {selectedPersonName}
            <button
              onClick={() => onPersonChange(null)}
              className="hover:bg-primary-foreground/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        </div>
      )}

      <MemberSelector
        selectedMembers={selectedPerson ? [selectedPerson] : []}
        onMembersChange={(members) => onPersonChange(members[0] || null)}
        multiSelect={false}
      />
    </div>
  );
}
