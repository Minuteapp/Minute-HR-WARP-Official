import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Send } from "lucide-react";
import { PeerKudos, KudosSummary } from "@/integrations/supabase/hooks/useEmployeeRecognition";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useState } from "react";
import { SendKudosDialog } from "./SendKudosDialog";

interface PeerKudosCardProps {
  kudos?: PeerKudos[];
  summary?: KudosSummary;
  employeeId?: string;
}

const getCategoryBadge = (category: string) => {
  switch (category) {
    case 'teamwork':
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Teamwork</Badge>;
    case 'innovation':
      return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">Innovation</Badge>;
    case 'excellence':
      return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">Excellence</Badge>;
    case 'leadership':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Leadership</Badge>;
    default:
      return <Badge variant="outline">{category}</Badge>;
  }
};

export const PeerKudosCard = ({ kudos = [], summary, employeeId }: PeerKudosCardProps) => {
  const [showSendDialog, setShowSendDialog] = useState(false);

  return (
    <>
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-600" />
              Peer Recognition & Kudos
            </CardTitle>
            <Button size="sm" onClick={() => setShowSendDialog(true)}>
              <Send className="h-4 w-4 mr-2" />
              Kudos senden
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statistiken */}
          {summary && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{summary.kudos_received_count}</div>
                <div className="text-xs text-muted-foreground">Erhaltene Kudos</div>
                {summary.kudos_received_this_year > 0 && (
                  <div className="text-xs text-green-600 mt-1">+{summary.kudos_received_this_year} dieses Jahr</div>
                )}
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.kudos_sent_count}</div>
                <div className="text-xs text-muted-foreground">Gesendete Kudos</div>
                <div className="text-xs text-muted-foreground mt-1">Seit Eintritt</div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-indigo-600">{summary.top_category}</div>
                <div className="text-xs text-muted-foreground">Top-Kategorie</div>
                <div className="text-xs text-muted-foreground mt-1">{summary.top_category_count} Kudos</div>
              </div>
            </div>
          )}

          {/* Letzte Kudos */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Letzte Kudos</h4>
            <div className="space-y-3">
              {kudos.map((kudo) => (
                <div 
                  key={kudo.id} 
                  className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-purple-200 dark:border-purple-800"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                        <span className="text-xs font-semibold">MA</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">Mitarbeiter</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(kudo.sent_date), { addSuffix: true, locale: de })}
                        </div>
                      </div>
                    </div>
                    {getCategoryBadge(kudo.category)}
                  </div>
                  <p className="text-sm text-muted-foreground italic">"{kudo.kudos_message}"</p>
                </div>
              ))}
            </div>
          </div>

          {kudos.length === 0 && !summary && (
            <div className="text-center text-muted-foreground py-8">
              Noch keine Kudos vorhanden
            </div>
          )}

          {/* Alle anzeigen Button */}
          {summary && summary.kudos_received_count > kudos.length && (
            <Button variant="outline" className="w-full">
              Alle Kudos anzeigen ({summary.kudos_received_count})
            </Button>
          )}
        </CardContent>
      </Card>

      <SendKudosDialog 
        open={showSendDialog} 
        onOpenChange={setShowSendDialog}
        receiverId={employeeId}
      />
    </>
  );
};
