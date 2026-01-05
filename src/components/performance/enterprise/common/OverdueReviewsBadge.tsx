import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OverdueReviewsBadgeProps {
  count: number;
  className?: string;
}

export function OverdueReviewsBadge({ count, className }: OverdueReviewsBadgeProps) {
  if (count === 0) return null;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1 bg-orange-100 text-orange-700 border-orange-200",
        className
      )}
    >
      <Clock className="h-3 w-3" />
      <span>{count} überfällige Reviews</span>
    </Badge>
  );
}
