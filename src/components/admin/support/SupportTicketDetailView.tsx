import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Building2, Settings, Clock, User, Sparkles, Lock, CheckCircle, AlertTriangle, Book, Send } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const ticketData = {
  id: "TKT-2847",
  title: "Schichtplanung: Mitarbeiter werden nicht korrekt zugeordnet",
  description: "Seit dem Update auf Version 2.4.1 werden bei der automatischen Schichtzuweisung nicht alle verfügbaren Mitarbeiter berücksichtigt. Das Problem tritt besonders bei Mitarbeitern auf, die in mehreren Teams tätig sind.",
  priority: "Kritisch",
  status: "In Bearbeitung",
  tenant: { name: "TechCorp GmbH", id: "TNT-0142" },
  module: { name: "Schichtplanung", version: "v2.4.1" },
  created: { date: "15.12.2024 09:23", by: "Thomas Berger", role: "Admin" },
  assignee: { name: "Max Müller", role: "Senior Support" },
  sla: {
    responseTime: { target: "2 Stunden", status: "met", label: "✓ Eingehalten" },
    resolutionTime: { target: "8 Stunden", status: "risk", remaining: "1,5 h", label: "⚠ Risiko" }
  },
  aiContext: {
    category: "Bug / Kritisch",
    component: "shift-assignment-engine",
    userActions: [
      "Schichtplan für KW 51 erstellt",
      "Automatische Zuweisung gestartet",
      "Fehler nach 3 Minuten gemeldet"
    ],
    similarTicket: { id: "TKT-2789", match: "78%" }
  },
  similarTickets: [
    { id: "TKT-2789", match: "78%", title: "Schichtzuweisung ignoriert Verfügbarkeit" },
    { id: "TKT-2654", match: "65%", title: "Multi-Team-Mitarbeiter nicht in Planung" }
  ],
  knowledgeBase: [
    { id: "KB-0089", title: "Schichtplanung Troubleshooting Guide" },
    { id: "KB-0124", title: "Multi-Team-Konfiguration" }
  ],
  messages: [
    { id: 1, author: "Thomas Berger", role: "Kunde", time: "15.12.2024 09:23", content: "Hallo Support-Team, seit dem letzten Update haben wir massive Probleme mit der Schichtplanung. Mitarbeiter, die in mehreren Teams sind, werden bei der automatischen Zuweisung komplett ignoriert. Das betrifft etwa 30% unserer Belegschaft.", isInternal: false },
    { id: 2, author: "Max Müller", role: "Support", time: "15.12.2024 10:45", content: "Vielen Dank für die Meldung. Ich habe das Problem reproduzieren können. Es scheint ein Bug in der neuen Multi-Team-Logik zu sein. Ich eskaliere das an unser Entwicklungsteam.", isInternal: false },
    { id: 3, author: "Max Müller", role: "Support", time: "15.12.2024 11:15", content: "Entwicklerteam informiert. Laut Analyse handelt es sich um einen Fehler im JOIN der team_members Tabelle. Hotfix wird vorbereitet.", isInternal: true }
  ]
};

const SupportTicketDetailView = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [commentTab, setCommentTab] = useState<"external" | "internal">("external");
  const [newComment, setNewComment] = useState("");

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Button variant="ghost" onClick={() => navigate("/admin/support")} className="text-gray-600 hover:text-gray-900 -ml-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück zur Ticket-Liste
      </Button>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-primary font-semibold">{ticketData.id}</span>
            <Badge className="bg-red-600 text-white">CRITICAL</Badge>
            <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">SLA-Risiko</Badge>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">{ticketData.title}</h1>
          <p className="text-gray-600 mb-6">{ticketData.description}</p>
          
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Mandant</p>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{ticketData.tenant.name}</p>
                  <p className="text-xs text-gray-500">{ticketData.tenant.id}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Modul</p>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{ticketData.module.name}</p>
                  <p className="text-xs text-gray-500">{ticketData.module.version}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Erstellt</p>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{ticketData.created.date}</p>
                  <p className="text-xs text-gray-500">von {ticketData.created.by} ({ticketData.created.role})</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Zugewiesen</p>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{ticketData.assignee.name}</p>
                  <p className="text-xs text-gray-500">({ticketData.assignee.role})</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* AI Context */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-primary">KI-Kontext & Analyse</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Automatische Kategorisierung:</span>
                  <span className="ml-2 font-medium">{ticketData.aiContext.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">Betroffene Komponente:</span>
                  <span className="ml-2 font-medium text-primary">{ticketData.aiContext.component}</span>
                </div>
                <div>
                  <span className="text-gray-500">Letzte Nutzer-Aktionen:</span>
                  <ul className="mt-1 ml-4 list-disc text-gray-700">
                    {ticketData.aiContext.userActions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-gray-500">Ähnlichkeit zu:</span>
                  <span className="ml-2 text-primary font-medium">{ticketData.aiContext.similarTicket.id}</span>
                  <span className="ml-1 text-gray-500">({ticketData.aiContext.similarTicket.match} Match)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communication */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kommunikation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticketData.messages.map((msg) => (
                <div key={msg.id} className={`p-4 rounded-lg ${msg.isInternal ? 'border-l-4 border-primary bg-primary/5' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{msg.author}</span>
                      <Badge variant="outline" className="text-xs">{msg.role}</Badge>
                      {msg.isInternal && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Lock className="w-3 h-3" />
                          <span>Interner Kommentar (nicht sichtbar für Kunden)</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                  </div>
                  <p className="text-sm text-gray-700">{msg.content}</p>
                </div>
              ))}

              <div className="border-t pt-4 mt-4">
                <div className="flex gap-2 mb-3">
                  <Button
                    variant={commentTab === "external" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCommentTab("external")}
                  >
                    Extern (sichtbar für Kunde)
                  </Button>
                  <Button
                    variant={commentTab === "internal" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCommentTab("internal")}
                  >
                    Intern (nur für Team)
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder={commentTab === "external" ? "Antwort an den Kunden..." : "Interner Kommentar..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                  />
                  <Button className="self-end">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* SLA Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SLA-Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Antwortzeit</p>
                  <p className="font-medium">Ziel: {ticketData.sla.responseTime.target}</p>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{ticketData.sla.responseTime.label}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Lösungszeit</p>
                  <p className="font-medium">Ziel: {ticketData.sla.resolutionTime.target}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">{ticketData.sla.resolutionTime.label}</span>
                  </div>
                  <p className="text-xs text-red-600">Verbleibend: {ticketData.sla.resolutionTime.remaining}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Similar Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ähnliche Tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ticketData.similarTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-medium">{ticket.id}</span>
                  <span className="text-gray-500">({ticket.match})</span>
                  <span className="text-gray-700 line-clamp-1">{ticket.title}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Knowledge Base */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Wissensdatenbank</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ticketData.knowledgeBase.map((article) => (
                <div key={article.id} className="flex items-center gap-2 text-sm">
                  <Book className="w-4 h-4 text-gray-400" />
                  <span className="text-primary">{article.id}</span>
                  <span className="text-gray-700">{article.title}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Status ändern</label>
                <Select defaultValue="in-progress">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Neu</SelectItem>
                    <SelectItem value="in-progress">In Bearbeitung</SelectItem>
                    <SelectItem value="waiting">Wartet</SelectItem>
                    <SelectItem value="resolved">Gelöst</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Priorität ändern</label>
                <Select defaultValue="critical">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Kritisch</SelectItem>
                    <SelectItem value="high">Hoch</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="low">Niedrig</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Zuweisen</label>
                <Select defaultValue="max">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* ZERO-DATA: Support-Mitarbeiter aus DB laden */}
                    <SelectItem value="placeholder" disabled>Support-Mitarbeiter laden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupportTicketDetailView;
