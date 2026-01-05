import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PerformanceSettingsProps {
  maxParallelWorkflows: number;
  maxWorkflowDurationSeconds: number;
  retryStrategy: string;
  maxRetries: number;
  notifyOnError: boolean;
  onSettingChange: (key: string, value: boolean | number | string) => void;
}

export const PerformanceSettings = ({
  maxParallelWorkflows,
  maxWorkflowDurationSeconds,
  retryStrategy,
  maxRetries,
  notifyOnError,
  onSettingChange
}: PerformanceSettingsProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Limits</CardTitle>
          <CardDescription>
            Optimiere Workflow-Ausführung und Ressourcennutzung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="max-parallel">Max. parallele Workflows</Label>
              <Input
                id="max-parallel"
                type="number"
                min={1}
                max={200}
                value={maxParallelWorkflows}
                onChange={(e) => onSettingChange('max_parallel_workflows', parseInt(e.target.value) || 50)}
              />
              <p className="text-xs text-muted-foreground">
                Maximale Anzahl gleichzeitig laufender Workflows
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max-duration">Max. Workflow-Dauer (Sekunden)</Label>
              <Input
                id="max-duration"
                type="number"
                min={30}
                max={3600}
                value={maxWorkflowDurationSeconds}
                onChange={(e) => onSettingChange('max_workflow_duration_seconds', parseInt(e.target.value) || 300)}
              />
              <p className="text-xs text-muted-foreground">
                Timeout für einzelne Workflow-Ausführungen
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Retry-Strategie</CardTitle>
          <CardDescription>
            Konfiguriere, wie fehlgeschlagene Schritte wiederholt werden
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="retry-strategy">Strategie</Label>
              <Select
                value={retryStrategy}
                onValueChange={(value) => onSettingChange('retry_strategy', value)}
              >
                <SelectTrigger id="retry-strategy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine Wiederholung</SelectItem>
                  <SelectItem value="linear">Linear (1s, 1s, 1s...)</SelectItem>
                  <SelectItem value="exponential">Exponentiell (1s, 2s, 4s, 8s...)</SelectItem>
                  <SelectItem value="fibonacci">Fibonacci (1s, 1s, 2s, 3s, 5s...)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Wartezeit zwischen Wiederholungsversuchen
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max-retries">Maximale Wiederholungsversuche</Label>
              <Input
                id="max-retries"
                type="number"
                min={0}
                max={10}
                value={maxRetries}
                onChange={(e) => onSettingChange('max_retries', parseInt(e.target.value) || 3)}
              />
              <p className="text-xs text-muted-foreground">
                Anzahl der Versuche bevor Fehler gemeldet wird
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Label htmlFor="notify-error" className="flex flex-col gap-0.5">
              <span>Benachrichtigung bei Fehlern</span>
              <span className="text-xs text-muted-foreground font-normal">
                Automatische Benachrichtigung wenn Workflows fehlschlagen
              </span>
            </Label>
            <Switch
              id="notify-error"
              checked={notifyOnError}
              onCheckedChange={(checked) => onSettingChange('notify_on_error', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
