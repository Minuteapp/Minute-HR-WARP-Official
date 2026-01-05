import { AlertCircle } from "lucide-react";

interface OverdueReviewWarningProps {
  count: number;
}

export const OverdueReviewWarning = ({ count }: OverdueReviewWarningProps) => {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-orange-600 text-sm">
      <AlertCircle className="h-4 w-4" />
      <span>{count} überfälliges Review</span>
    </div>
  );
};
