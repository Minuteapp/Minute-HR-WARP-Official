import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DefaultHint } from './DefaultHint';

interface ReviewCycleSettingsProps {
  reviewCycle: string;
  mandatoryCheckins: boolean;
  onReviewCycleChange: (value: string) => void;
  onMandatoryCheckinsChange: (value: boolean) => void;
}

export const ReviewCycleSettings: React.FC<ReviewCycleSettingsProps> = ({
  reviewCycle,
  mandatoryCheckins,
  onReviewCycleChange,
  onMandatoryCheckinsChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Review-Zyklus</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="review-cycle">Standard Review-Zyklus</Label>
          <Select value={reviewCycle} onValueChange={onReviewCycleChange}>
            <SelectTrigger id="review-cycle" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monatlich</SelectItem>
              <SelectItem value="quarterly">Quartalsweise (empfohlen)</SelectItem>
              <SelectItem value="yearly">Jährlich</SelectItem>
            </SelectContent>
          </Select>
          <DefaultHint />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Pflicht-Check-ins aktivieren</Label>
            <p className="text-xs text-muted-foreground">
              Mitarbeiter werden an regelmäßige Check-ins erinnert
            </p>
          </div>
          <Switch
            checked={mandatoryCheckins}
            onCheckedChange={onMandatoryCheckinsChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};
