import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const FeedbackCenter = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg border-primary/20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Feedback-Center</h3>
            <p className="text-sm text-gray-500">Geben und empfangen Sie Feedback</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Feedback geben
          </Button>
        </div>
        <div className="text-center text-gray-500 py-8">
          Kein Feedback vorhanden
        </div>
      </Card>
    </div>
  );
};

export default FeedbackCenter;