import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface CreateReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: { id: string; first_name: string; last_name: string }[];
  onSubmit: (data: {
    employee_id: string;
    reviewer_id: string;
    review_type: string;
    scheduled_date: string;
  }) => void;
}

export const CreateReviewModal = ({
  open,
  onOpenChange,
  employees,
  onSubmit
}: CreateReviewModalProps) => {
  const [employeeId, setEmployeeId] = useState("");
  const [reviewerId, setReviewerId] = useState("");
  const [reviewType, setReviewType] = useState("quarterly");
  const [scheduledDate, setScheduledDate] = useState("");

  const handleSubmit = () => {
    if (!employeeId || !reviewerId || !scheduledDate) return;
    
    onSubmit({
      employee_id: employeeId,
      reviewer_id: reviewerId,
      review_type: reviewType,
      scheduled_date: scheduledDate
    });

    // Reset form
    setEmployeeId("");
    setReviewerId("");
    setReviewType("quarterly");
    setScheduledDate("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neues Performance-Review erstellen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Mitarbeiter *</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Mitarbeiter auswählen" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewer">Reviewer *</Label>
            <Select value={reviewerId} onValueChange={setReviewerId}>
              <SelectTrigger>
                <SelectValue placeholder="Reviewer auswählen" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Review-Typ</Label>
            <Select value={reviewType} onValueChange={setReviewType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quarterly">Quartalsgespräch</SelectItem>
                <SelectItem value="probation">Probezeit</SelectItem>
                <SelectItem value="annual">Jahresgespräch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Geplantes Datum *</Label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!employeeId || !reviewerId || !scheduledDate}
          >
            Review erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
