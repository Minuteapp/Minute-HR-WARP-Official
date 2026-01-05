import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ActionCardProps {
  sender: string;
  timestamp: string;
  avatar: string;
  type: "urlaubsantrag" | "expense" | "shift_swap";
  title: string;
  fields: { label: string; value: string }[];
  status?: "pending" | "approved" | "rejected";
}

export default function ActionCard({
  sender,
  timestamp,
  avatar,
  type,
  title,
  fields,
  status = "pending",
}: ActionCardProps) {
  return (
    <div className="px-4 py-2">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {avatar}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm">{sender}</span>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>

          <div className="bg-card border rounded-lg p-4 max-w-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-primary/10 rounded">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-sm">{title}</span>
            </div>

            <div className="space-y-2 mb-4">
              {fields.map((field, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{field.label}:</span>
                  <span className="font-medium text-right">{field.value}</span>
                </div>
              ))}
            </div>

            {status === "pending" && (
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Genehmigen
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-2 text-destructive hover:text-destructive">
                  <XCircle className="w-4 h-4" />
                  Ablehnen
                </Button>
              </div>
            )}

            {status === "approved" && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Genehmigt
              </div>
            )}

            {status === "rejected" && (
              <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                <XCircle className="w-4 h-4" />
                Abgelehnt
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
