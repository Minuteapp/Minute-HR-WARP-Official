import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Check } from "lucide-react";

interface WorkflowMessageProps {
  sender: string;
  initials: string;
  timestamp: string;
  workflow: {
    title: string;
    employee: string;
    period: string;
    days: string;
    reason: string;
  };
  onApprove?: () => void;
  onReject?: () => void;
}

export default function WorkflowMessage({
  sender,
  initials,
  timestamp,
  workflow,
  onApprove,
  onReject,
}: WorkflowMessageProps) {
  return (
    <div className="mb-4">
      <div className="flex items-start gap-2">
        {/* Avatar links */}
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          {/* Sender + Zeit */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">{sender}</span>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>

          {/* Workflow-Card */}
          <div className="bg-white border rounded-xl p-4 space-y-3">
            {/* Titel mit Icon */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{workflow.title}</h3>
            </div>

            {/* Workflow-Details */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mitarbeiter:</span>
                <span className="font-medium">{workflow.employee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Zeitraum:</span>
                <span className="font-medium">{workflow.period}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tage:</span>
                <span className="font-medium">{workflow.days}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Grund:</span>
                <span className="font-medium">{workflow.reason}</span>
              </div>
            </div>

            <Separator />

            {/* Action-Buttons */}
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={onApprove}
              >
                <Check className="w-4 h-4 mr-2" />
                Genehmigen
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                onClick={onReject}
              >
                Ablehnen
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
