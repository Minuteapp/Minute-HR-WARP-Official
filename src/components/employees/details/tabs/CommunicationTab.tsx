import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Send,
  TrendingUp,
  ThumbsUp,
  Info,
  AlertCircle,
} from "lucide-react";

interface CommunicationTabProps {
  employee: any;
}

export const CommunicationTab: React.FC<CommunicationTabProps> = ({ employee }) => {
  const [message, setMessage] = useState("");

  // Keine Mock-Daten
  const channels: Array<{ id: string; name: string; message: string; time: string; isNew: boolean }> = [];
  const feedbackItems: Array<{ id: string; author: string; type: string; date: string; content: string }> = [];

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linke Spalte - Team-Kommunikation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team-Kommunikation */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Team-Kommunikation</h3>
                </div>
                <Button size="sm">Neue Nachricht</Button>
              </div>

              {channels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Keine Nachrichten vorhanden</p>
                  <p className="text-xs text-muted-foreground">Sobald Nachrichten vorhanden sind, werden sie hier angezeigt.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {channels.map((channel) => (
                    <div
                      key={channel.id}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer hover:bg-accent ${
                        channel.isNew ? "bg-primary/5 border-primary/20" : "bg-background"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="text-2xl">👥</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{channel.name}</h4>
                              {channel.isNew && <Badge className="bg-black text-white text-xs">Neu</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{channel.message}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{channel.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Nachricht senden */}
              <div className="mt-6">
                <p className="text-sm font-medium mb-2">Nachricht senden</p>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Nachricht an Team schreiben..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 resize-none"
                    rows={2}
                  />
                  <Button size="icon" onClick={handleSendMessage} className="self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback & Performance-Kommentare */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ThumbsUp className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Feedback & Performance-Kommentare</h3>
              </div>

              {feedbackItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Kein Feedback vorhanden</p>
                  <p className="text-xs text-muted-foreground">Sobald Feedback erfasst ist, wird es hier angezeigt.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbackItems.map((feedback) => (
                    <div key={feedback.id} className="p-4 bg-muted rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{feedback.author}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-black text-white text-xs">{feedback.type}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(feedback.date).toLocaleDateString("de-DE")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-foreground">{feedback.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* KI-Stimmungsanalyse */}
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5" />
                <h3 className="font-semibold text-lg">KI-Stimmungsanalyse</h3>
              </div>

              <div className="flex items-start gap-2 rounded-lg border bg-background p-4">
                <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">Keine Analyse verfügbar (keine Datenbasis).</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rechte Spalte - Statistik */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5" />
                <h3 className="font-semibold">Statistik</h3>
              </div>

              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Keine Statistik verfügbar</p>
                <p className="text-xs text-muted-foreground">Sobald Kommunikationsdaten vorliegen, werden Kennzahlen angezeigt.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Informationen */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>Statusinformationen nicht verfügbar</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
