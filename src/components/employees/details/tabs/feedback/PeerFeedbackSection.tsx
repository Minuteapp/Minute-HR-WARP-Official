import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, MessageSquare, Users } from "lucide-react";
import { useState } from "react";

interface PeerFeedbackSectionProps {
  peerComments: {
    positive: string[];
    improvements: string[];
  };
}

export const PeerFeedbackSection = ({ peerComments }: PeerFeedbackSectionProps) => {
  const [showAnonymized, setShowAnonymized] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Peer Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="anonymized" 
            checked={showAnonymized}
            onCheckedChange={(checked) => setShowAnonymized(checked as boolean)}
          />
          <label
            htmlFor="anonymized"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Peer Feedback (anonymisiert)
          </label>
        </div>

        {showAnonymized && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Positiv hervorgehoben */}
            <div className="space-y-3">
              <h3 className="font-semibold text-green-600 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Positiv hervorgehoben
              </h3>
              <ul className="space-y-2">
                {peerComments.positive.map((comment, index) => (
                  <li 
                    key={index} 
                    className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-sm"
                  >
                    "{comment}"
                  </li>
                ))}
              </ul>
            </div>

            {/* Verbesserungsvorschläge */}
            <div className="space-y-3">
              <h3 className="font-semibold text-orange-600 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Verbesserungsvorschläge
              </h3>
              <ul className="space-y-2">
                {peerComments.improvements.map((comment, index) => (
                  <li 
                    key={index} 
                    className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 text-sm"
                  >
                    "{comment}"
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Entwicklungsplan erstellen
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Feedback exportieren (PDF)
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Mit Manager besprechen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
