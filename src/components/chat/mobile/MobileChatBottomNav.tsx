import { Button } from "@/components/ui/button";

interface MobileChatBottomNavProps {
  onAnrufe: () => void;
  onDateien: () => void;
  onArchiv: () => void;
}

export default function MobileChatBottomNav({
  onAnrufe,
  onDateien,
  onArchiv,
}: MobileChatBottomNavProps) {
  return (
    <div className="border-t bg-background p-3 flex justify-around">
      <Button variant="ghost" size="sm" className="text-sm" onClick={onAnrufe}>
        Anrufe
      </Button>
      <Button variant="ghost" size="sm" className="text-sm" onClick={onDateien}>
        Dateien
      </Button>
      <Button variant="ghost" size="sm" className="text-sm" onClick={onArchiv}>
        Archiv
      </Button>
    </div>
  );
}
