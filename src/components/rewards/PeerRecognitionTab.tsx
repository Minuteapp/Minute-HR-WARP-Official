import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, 
  TrendingUp, 
  Users, 
  Award,
  ThumbsUp,
  ArrowRight,
  Info
} from "lucide-react";
import { usePeerKudos } from '@/hooks/usePeerKudos';
import { SendKudosDialog } from './SendKudosDialog';
import { KUDOS_CATEGORY_LABELS, KUDOS_CATEGORY_COLORS, KudosCategory } from '@/types/peer-recognition';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const PeerRecognitionTab = () => {
  const { kudosList, statistics, isLoading, likeKudos } = usePeerKudos();
  const [showSendDialog, setShowSendDialog] = useState(false);

  const chartData = statistics.categoryStats.map(cs => ({
    name: KUDOS_CATEGORY_LABELS[cs.category],
    anzahl: cs.count,
    fill: KUDOS_CATEGORY_COLORS[cs.category]
  }));

  if (isLoading) {
    return <div className="flex justify-center py-10">Lade Daten...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">Peer-to-Peer Anerkennung</h2>
          <p className="text-sm text-muted-foreground">
            Fördern Sie eine Kultur der Wertschätzung durch gegenseitige Anerkennung
          </p>
        </div>
        <Button onClick={() => setShowSendDialog(true)}>
          <Heart className="h-4 w-4 mr-2" />
          Kudos senden
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kudos gesamt</p>
                <p className="text-2xl font-bold">{statistics.totalKudos}</p>
                <p className="text-xs text-muted-foreground">Alle Zeiten</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dieser Monat</p>
                <p className="text-2xl font-bold">{statistics.thisMonth}</p>
                <p className="text-xs text-green-600">
                  {statistics.monthlyChange >= 0 ? '+' : ''}{statistics.monthlyChange}% vs. Vormonat
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Beteiligung</p>
                <p className="text-2xl font-bold">{statistics.participationRate}%</p>
                <p className="text-xs text-muted-foreground">Aktive Teilnahme</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ø pro Person</p>
                <p className="text-2xl font-bold">{statistics.avgPerPerson}</p>
                <p className="text-xs text-muted-foreground">Kudos/Monat</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Kudos */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Neueste Anerkennungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {kudosList.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Noch keine Kudos vorhanden. Seien Sie der Erste!
                </p>
              ) : (
                kudosList.slice(0, 5).map((kudos) => (
                  <div key={kudos.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      {/* Sender -> Receiver */}
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={kudos.sender_avatar} />
                          <AvatarFallback>{kudos.sender_name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-center">
                          <div className="w-px h-2 bg-border" />
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <div className="w-px h-2 bg-border" />
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={kudos.receiver_avatar} />
                          <AvatarFallback>{kudos.receiver_name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{kudos.sender_name}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">{kudos.receiver_name}</span>
                          <Badge 
                            variant="secondary" 
                            style={{ backgroundColor: `${KUDOS_CATEGORY_COLORS[kudos.category]}20`, color: KUDOS_CATEGORY_COLORS[kudos.category] }}
                          >
                            {KUDOS_CATEGORY_LABELS[kudos.category] || kudos.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{kudos.message}</p>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-destructive">
                            <Heart className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium">{kudos.kudos_amount}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2"
                            onClick={() => likeKudos.mutate(kudos.id)}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {kudos.likes_count}
                          </Button>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {format(new Date(kudos.created_at), 'dd. MMM yyyy', { locale: de })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Category Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Anerkennungs-Kategorien</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="anzahl" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Givers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Geber (Monat)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statistics.topGivers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Keine Daten</p>
              ) : (
                statistics.topGivers.map((giver, index) => (
                  <div key={giver.id} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={giver.avatar} />
                      <AvatarFallback>{giver.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 font-medium truncate">{giver.name}</span>
                    <Badge variant="secondary">{giver.count}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Top Receivers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Empfänger (Monat)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statistics.topReceivers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Keine Daten</p>
              ) : (
                statistics.topReceivers.map((receiver, index) => (
                  <div key={receiver.id} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={receiver.avatar} />
                      <AvatarFallback>{receiver.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 font-medium truncate">{receiver.name}</span>
                    <Badge variant="secondary">{receiver.count}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Peer Recognition Richtlinien</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Seien Sie spezifisch und aufrichtig</li>
                    <li>• Anerkennen Sie zeitnah</li>
                    <li>• Wählen Sie die passende Kategorie</li>
                    <li>• Begründen Sie Ihre Anerkennung</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SendKudosDialog open={showSendDialog} onOpenChange={setShowSendDialog} />
    </div>
  );
};
