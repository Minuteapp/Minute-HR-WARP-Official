import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Mail, Smartphone, MessageSquare } from "lucide-react";

interface AINotificationRule {
  id: string;
  trigger: string;
  channels: string[];
  frequency: string;
  enabled: boolean;
  recipients: string[];
}

interface NotificationSettingsProps {
  rules: AINotificationRule[];
  onUpdateRule: (ruleId: string, updates: Partial<AINotificationRule>) => void;
}

const channelOptions = [
  { value: 'email', label: 'E-Mail', icon: Mail },
  { value: 'push', label: 'Push-Benachrichtigung', icon: Bell },
  { value: 'sms', label: 'SMS', icon: Smartphone },
  { value: 'inapp', label: 'In-App', icon: MessageSquare }
];

const frequencyOptions = [
  { value: 'immediate', label: 'Sofort' },
  { value: 'hourly', label: 'Stündlich' },
  { value: 'daily', label: 'Täglich' },
  { value: 'weekly', label: 'Wöchentlich' }
];

const recipientOptions = [
  { value: 'hr', label: 'HR-Team' },
  { value: 'manager', label: 'Direkte Vorgesetzte' },
  { value: 'admin', label: 'System-Administratoren' },
  { value: 'affected', label: 'Betroffene Mitarbeiter' }
];

export function NotificationSettings({ rules, onUpdateRule }: NotificationSettingsProps) {
  const handleChannelChange = (ruleId: string, channel: string, checked: boolean) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    
    const newChannels = checked 
      ? [...rule.channels, channel]
      : rule.channels.filter(c => c !== channel);
    
    onUpdateRule(ruleId, { channels: newChannels });
  };

  const handleRecipientChange = (ruleId: string, recipient: string, checked: boolean) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    
    const newRecipients = checked 
      ? [...rule.recipients, recipient]
      : rule.recipients.filter(r => r !== recipient);
    
    onUpdateRule(ruleId, { recipients: newRecipients });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          KI-Benachrichtigungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {rules.map((rule) => (
          <div key={rule.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{rule.trigger}</h4>
                <p className="text-sm text-muted-foreground">
                  Benachrichtigung bei KI-generierten Ereignissen
                </p>
              </div>
              <Switch
                checked={rule.enabled}
                onCheckedChange={(checked) => onUpdateRule(rule.id, { enabled: checked })}
              />
            </div>
            
            {rule.enabled && (
              <>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Benachrichtigungskanäle</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {channelOptions.map((channel) => {
                      const Icon = channel.icon;
                      return (
                        <div key={channel.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${rule.id}-${channel.value}`}
                            checked={rule.channels.includes(channel.value)}
                            onCheckedChange={(checked) => 
                              handleChannelChange(rule.id, channel.value, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={`${rule.id}-${channel.value}`}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <Icon className="h-4 w-4" />
                            {channel.label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`frequency-${rule.id}`} className="text-sm font-medium">
                      Frequenz
                    </Label>
                    <Select 
                      value={rule.frequency} 
                      onValueChange={(value) => onUpdateRule(rule.id, { frequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Empfänger</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {recipientOptions.map((recipient) => (
                      <div key={recipient.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${rule.id}-${recipient.value}`}
                          checked={rule.recipients.includes(recipient.value)}
                          onCheckedChange={(checked) => 
                            handleRecipientChange(rule.id, recipient.value, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={`${rule.id}-${recipient.value}`}
                          className="text-sm cursor-pointer"
                        >
                          {recipient.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        
        {rules.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine Benachrichtigungsregeln konfiguriert</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}