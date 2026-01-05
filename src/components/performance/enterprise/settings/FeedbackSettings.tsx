import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DefaultHint } from './DefaultHint';

interface FeedbackSettingsProps {
  anonymousFeedback: boolean;
  onAnonymousFeedbackChange: (value: boolean) => void;
}

export const FeedbackSettings: React.FC<FeedbackSettingsProps> = ({
  anonymousFeedback,
  onAnonymousFeedbackChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Feedback-Einstellungen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Anonymes Feedback erlauben</Label>
            <p className="text-xs text-muted-foreground">
              Mitarbeiter können anonymes Feedback geben
            </p>
          </div>
          <Switch
            checked={anonymousFeedback}
            onCheckedChange={onAnonymousFeedbackChange}
          />
        </div>
        <DefaultHint text="80/20 Default: Anonymes Feedback fördert offene Kommunikation." />
      </CardContent>
    </Card>
  );
};
