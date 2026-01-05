
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AdditionalNotesSectionProps {
  register: any;
}

const AdditionalNotesSection = ({ register }: AdditionalNotesSectionProps) => {
  return (
    <div className="col-span-2 space-y-4">
      <h3 className="text-lg font-medium">Zusätzliche Hinweise</h3>
      <div className="space-y-2">
        <Label htmlFor="notes">Weitere Informationen (optional)</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Zusätzliche Informationen, besondere Anforderungen oder Hinweise"
          rows={3}
        />
      </div>
    </div>
  );
};

export default AdditionalNotesSection;
