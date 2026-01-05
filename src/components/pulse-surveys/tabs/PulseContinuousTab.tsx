import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  MessageSquare,
  Plus,
  Clock,
  Users,
  FileText,
  Calendar,
  Repeat,
  Target,
  BookOpen
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const trendData = [
  { week: "KW 18", fuehrung: 7.2, stimmung: 7.5, workload: 6.8 },
  { week: "KW 19", fuehrung: 7.4, stimmung: 7.3, workload: 6.5 },
  { week: "KW 20", fuehrung: 7.3, stimmung: 7.6, workload: 6.9 },
  { week: "KW 21", fuehrung: 7.5, stimmung: 7.4, workload: 7.0 },
  { week: "KW 22", fuehrung: 7.6, stimmung: 7.7, workload: 6.7 },
  { week: "KW 23", fuehrung: 7.8, stimmung: 7.8, workload: 6.5 },
];

const activePulses = [
  {
    title: "Weekly Mood Check",
    frequency: "Wöchentlich (Montag)",
    questions: 3,
    participants: 520,
    responseRate: 89,
    topics: ["Stimmung", "Workload", "Support"],
    lastRun: "16.12.2024",
    nextRun: "23.12.2024"
  },
  {
    title: "IT Workload Pulse",
    frequency: "Alle 2 Wochen",
    questions: 5,
    participants: 45,
    responseRate: 92,
    topics: ["Workload", "Ressourcen", "Projekte"],
    lastRun: "09.12.2024",
    nextRun: "23.12.2024"
  },
  {
    title: "Leadership Quick Check",
    frequency: "Monatlich",
    questions: 4,
    participants: 320,
    responseRate: 78,
    topics: ["Führung", "Kommunikation"],
    lastRun: "01.12.2024",
    nextRun: "01.01.2025"
  }
];

const eventFeedback = [
  {
    title: "Projekt-Abschluss",
    trigger: "Automatisch bei Projekt-Ende",
    questions: 5,
    totalResponses: 127,
    avgScore: 8.2,
    lastTriggered: "12.12.2024"
  },
  {
    title: "Change Feedback",
    trigger: "Bei größeren Änderungen",
    questions: 6,
    totalResponses: 89,
    avgScore: 7.1,
    lastTriggered: "28.11.2024"
  },
  {
    title: "Schulungs-Feedback",
    trigger: "Nach jeder Schulung",
    questions: 4,
    totalResponses: 234,
    avgScore: 8.5,
    lastTriggered: "15.12.2024"
  }
];

const questionLibrary = [
  "Wie zufrieden bist du mit deiner aktuellen Arbeitsbelastung?",
  "Fühlst du dich von deiner Führungskraft ausreichend unterstützt?",
  "Wie gut funktioniert die Zusammenarbeit in deinem Team?",
  "Hast du das Gefühl, dass deine Meinung gehört wird?",
  "Wie würdest du die Kommunikation im Unternehmen bewerten?"
];

const liveCheckins = [
  { emoji: "😊", name: "Anna M.", comment: "Guter Start in die Woche!", time: "vor 2 Min" },
  { emoji: "😐", name: "Thomas K.", comment: "Noch viel zu tun heute", time: "vor 5 Min" },
  { emoji: "😊", name: "Sarah L.", comment: "Projekt läuft super!", time: "vor 8 Min" },
  { emoji: "😐", name: "Marcus W.", comment: "Meetings überlasten mich", time: "vor 12 Min" },
  { emoji: "😊", name: "Julia R.", comment: "Team-Support ist toll", time: "vor 15 Min" }
];

export const PulseContinuousTab = () => {
  const [autoReminders, setAutoReminders] = useState(true);
  const [microCheckins, setMicroCheckins] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Pulse & Continuous Feedback</h2>
          <p className="text-sm text-muted-foreground">Kontinuierliches Feedback in Echtzeit</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Neue Pulse-Umfrage
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100">
                <Activity className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktive Pulses</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ø Rücklaufquote</p>
                <p className="text-2xl font-bold">86%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check-ins heute</p>
                <p className="text-2xl font-bold">287</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100">
                <MessageSquare className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktuelle Stimmung</p>
                <p className="text-2xl font-bold">7.7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pulse Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pulse-Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[6, 8]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="fuehrung" name="Führung" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="stimmung" name="Stimmung" stroke="#22C55E" strokeWidth={2} />
              <Line type="monotone" dataKey="workload" name="Workload" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Pulse Surveys */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Aktive Pulse-Umfragen</h3>
        <div className="grid grid-cols-3 gap-4">
          {activePulses.map((pulse, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{pulse.title}</h4>
                  <Badge variant="outline" className="text-green-600 border-green-600">Aktiv</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Repeat className="h-4 w-4" />
                    <span>{pulse.frequency}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{pulse.questions} Fragen</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{pulse.participants} Teilnehmer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">{pulse.responseRate}% Rücklauf</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {pulse.topics.map((topic, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{topic}</Badge>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Zuletzt: {pulse.lastRun}</span>
                    <span>Nächste: {pulse.nextRun}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Event-based Feedback */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Event-basiertes Feedback</h3>
        <div className="grid grid-cols-3 gap-4">
          {eventFeedback.map((event, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{event.title}</h4>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">Auto-Trigger</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{event.trigger}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Fragen</p>
                    <p className="font-medium">{event.questions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Antworten</p>
                    <p className="font-medium">{event.totalResponses}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ø Score</p>
                    <p className="font-medium">{event.avgScore}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Zuletzt</p>
                    <p className="font-medium">{event.lastTriggered}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-3 gap-4">
        {/* Question Library */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Pulse-Fragen Bibliothek
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {questionLibrary.map((question, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                <span className="flex-1 truncate pr-2">{question}</span>
                <button className="text-red-600 hover:underline text-xs font-medium whitespace-nowrap">Verwenden</button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Live Check-ins */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Micro Check-ins</CardTitle>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-1 animate-pulse" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {liveCheckins.map((checkin, index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <span className="text-xl">{checkin.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium">{checkin.name}</p>
                  <p className="text-muted-foreground">{checkin.comment}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{checkin.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pulse Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pulse-Einstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-reminders">Automatische Pulse-Erinnerungen</Label>
              <Switch 
                id="auto-reminders" 
                checked={autoReminders} 
                onCheckedChange={setAutoReminders} 
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="micro-checkins">Micro Check-ins aktivieren</Label>
              <Switch 
                id="micro-checkins" 
                checked={microCheckins} 
                onCheckedChange={setMicroCheckins} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
