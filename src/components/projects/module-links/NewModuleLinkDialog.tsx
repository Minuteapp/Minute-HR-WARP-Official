
import { useState } from "react";
import { File, Calendar, CheckSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface NewModuleLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { targetType: string; targetId: string; linkType: string }) => void;
  isLoading: boolean;
}

export function NewModuleLinkDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isLoading 
}: NewModuleLinkDialogProps) {
  const [formData, setFormData] = useState({
    targetType: "",
    targetId: "",
    linkType: "related",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neue Modul-Verknüpfung</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <label htmlFor="targetType" className="text-sm font-medium">
                Modul-Typ
              </label>
              <Select
                value={formData.targetType}
                onValueChange={(value) => setFormData({ ...formData, targetType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Modul-Typ auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-blue-600" />
                      <span>Dokument</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="task">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-green-600" />
                      <span>Aufgabe</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="calendar">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span>Kalendereintrag</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="targetId" className="text-sm font-medium">
                Modul-ID
              </label>
              <Input
                id="targetId"
                value={formData.targetId}
                onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                placeholder="Geben Sie die ID des zu verknüpfenden Moduls ein"
                className="font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="linkType" className="text-sm font-medium">
                Verknüpfungstyp
              </label>
              <Select
                value={formData.linkType}
                onValueChange={(value) => setFormData({ ...formData, linkType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Verknüpfungstyp auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="related">Verwandt</SelectItem>
                  <SelectItem value="parent">Übergeordnet</SelectItem>
                  <SelectItem value="child">Untergeordnet</SelectItem>
                  <SelectItem value="reference">Referenz</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Wird erstellt..." : "Verknüpfung erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
