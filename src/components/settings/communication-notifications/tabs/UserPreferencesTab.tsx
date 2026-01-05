
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserCog, Check, X, Loader2 } from "lucide-react";

export default function UserPreferencesTab() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['user-notification-preferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: employees } = useQuery({
    queryKey: ['employees-for-preferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email, avatar_url, position');
      if (error) throw error;
      return data || [];
    }
  });

  const getEmployeeForPreference = (userId: string) => {
    return employees?.find(e => e.id === userId);
  };

  const filteredPreferences = preferences?.filter(pref => {
    const employee = getEmployeeForPreference(pref.user_id);
    if (!employee) return false;
    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Benutzer-Präferenzen (Admin-Ansicht)</CardTitle>
          <CardDescription>
            Übersicht der individuellen Benachrichtigungseinstellungen aller Benutzer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Benutzer suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {filteredPreferences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Benutzer-Präferenzen gefunden</p>
              <p className="text-sm">Benutzer können ihre Präferenzen in ihren persönlichen Einstellungen festlegen</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Benutzer</TableHead>
                    <TableHead>Frequenz</TableHead>
                    <TableHead>Ruhezeiten</TableHead>
                    <TableHead>Digest</TableHead>
                    <TableHead>Wochenende</TableHead>
                    <TableHead>Sprache</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPreferences.map((pref) => {
                    const employee = getEmployeeForPreference(pref.user_id);
                    if (!employee) return null;

                    return (
                      <TableRow key={pref.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={employee.avatar_url || ''} />
                              <AvatarFallback>
                                {employee.first_name?.[0]}{employee.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {employee.first_name} {employee.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground">{employee.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {pref.frequency === 'immediate' ? 'Sofort' :
                             pref.frequency === 'hourly' ? 'Stündlich' :
                             pref.frequency === 'daily' ? 'Täglich' : pref.frequency}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {pref.quiet_hours_enabled ? (
                            <div className="flex items-center gap-1">
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-sm">
                                {pref.quiet_hours_start} - {pref.quiet_hours_end}
                              </span>
                            </div>
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          {pref.digest_enabled ? (
                            <div className="flex items-center gap-1">
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{pref.digest_time}</span>
                            </div>
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          {pref.weekend_notifications ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{pref.language?.toUpperCase()}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Standard-Einstellungen für neue Benutzer</CardTitle>
          <CardDescription>
            Diese Einstellungen werden für neue Benutzer übernommen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <Label className="text-muted-foreground">Standard-Frequenz</Label>
              <p className="font-medium mt-1">Sofort</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Label className="text-muted-foreground">Standard-Sprache</Label>
              <p className="font-medium mt-1">Deutsch</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Label className="text-muted-foreground">Wochenend-Benachrichtigungen</Label>
              <p className="font-medium mt-1">Aktiviert</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
