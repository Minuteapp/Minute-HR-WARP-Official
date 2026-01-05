import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  FileText, 
  Calendar, 
  Clock, 
  DollarSign, 
  GraduationCap,
  Briefcase,
  Bell,
  ChevronRight,
  TrendingUp,
  Award,
  Plane,
  CreditCard,
  Target,
  MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";

interface QuickLink {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
}

const quickLinks: QuickLink[] = [
  { 
    title: "Meine Dokumente", 
    description: "Gehaltsabrechnungen, Verträge, Bescheinigungen",
    icon: <FileText className="h-5 w-5" />, 
    href: "/documents",
    badge: "3 neu"
  },
  { 
    title: "Abwesenheit beantragen", 
    description: "Urlaub, Krankheit, Sonderurlaub",
    icon: <Calendar className="h-5 w-5" />, 
    href: "/absence" 
  },
  { 
    title: "Zeiterfassung", 
    description: "Arbeitszeiten erfassen und verwalten",
    icon: <Clock className="h-5 w-5" />, 
    href: "/time" 
  },
  { 
    title: "Gehaltsabrechnungen", 
    description: "Aktuelle und vergangene Abrechnungen",
    icon: <DollarSign className="h-5 w-5" />, 
    href: "/payroll" 
  },
  { 
    title: "Weiterbildungen", 
    description: "Kurse und Zertifizierungen",
    icon: <GraduationCap className="h-5 w-5" />, 
    href: "/goals",
    badge: "2 offen"
  },
  { 
    title: "Spesen einreichen", 
    description: "Ausgaben und Belege erfassen",
    icon: <CreditCard className="h-5 w-5" />, 
    href: "/expenses" 
  },
  { 
    title: "Geschäftsreisen", 
    description: "Reisen planen und buchen",
    icon: <Plane className="h-5 w-5" />, 
    href: "/business-travel" 
  },
  { 
    title: "Meine Ziele", 
    description: "OKRs und persönliche Ziele",
    icon: <Target className="h-5 w-5" />, 
    href: "/goals" 
  },
];

// Mock-Daten für den aktuellen Benutzer
const userStats = {
  name: "Max Mustermann",
  position: "Senior Developer",
  department: "IT",
  employeeSince: "15.03.2020",
  remainingVacation: 18,
  totalVacation: 30,
  usedVacation: 12,
  overtimeHours: 24.5,
  pendingExpenses: 345.50,
  completedTrainings: 5,
  upcomingTrainings: 2,
  goalsProgress: 65
};

const notifications = [
  { id: 1, title: "Gehaltsabrechnung verfügbar", description: "Dezember 2024", time: "vor 2 Stunden", type: "info" },
  { id: 2, title: "Urlaubsantrag genehmigt", description: "23.12. - 02.01.2025", time: "vor 1 Tag", type: "success" },
  { id: 3, title: "Training-Erinnerung", description: "IT-Sicherheit Kurs endet in 3 Tagen", time: "vor 2 Tagen", type: "warning" },
];

const MyPortalDashboard = () => {
  const vacationProgress = (userStats.usedVacation / userStats.totalVacation) * 100;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mein Portal</h1>
          <p className="text-muted-foreground">Willkommen zurück, {userStats.name}</p>
        </div>
        <Link to="/profile">
          <Button variant="outline">
            <User className="h-4 w-4 mr-2" />
            Profil bearbeiten
          </Button>
        </Link>
      </div>

      {/* Persönliche Infokarte */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{userStats.name}</h2>
              <p className="text-muted-foreground">{userStats.position} • {userStats.department}</p>
              <p className="text-sm text-muted-foreground mt-1">
                <Briefcase className="h-4 w-4 inline mr-1" />
                Dabei seit {userStats.employeeSince}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{userStats.remainingVacation}</div>
                <div className="text-xs text-muted-foreground">Resturlaub</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">+{userStats.overtimeHours}h</div>
                <div className="text-xs text-muted-foreground">Überstunden</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{userStats.pendingExpenses}€</div>
                <div className="text-xs text-muted-foreground">Offene Spesen</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Urlaubskonto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-bold">{userStats.remainingVacation} Tage</span>
              <span className="text-sm text-muted-foreground">von {userStats.totalVacation}</span>
            </div>
            <Progress value={vacationProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Zielfortschritt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-bold">{userStats.goalsProgress}%</span>
              <span className="text-sm text-muted-foreground">erreicht</span>
            </div>
            <Progress value={userStats.goalsProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Trainings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.completedTrainings}</div>
            <p className="text-sm text-muted-foreground">
              abgeschlossen • {userStats.upcomingTrainings} ausstehend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Arbeitszeit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{userStats.overtimeHours}h</div>
            <p className="text-sm text-muted-foreground">Überstundenkonto</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Links */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Schnellzugriff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickLinks.map((link, index) => (
                  <Link key={index} to={link.href}>
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {link.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{link.title}</span>
                          {link.badge && (
                            <Badge variant="secondary" className="text-xs">{link.badge}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{link.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benachrichtigungen */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Neueste Mitteilungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className={`h-2 w-2 rounded-full mt-2 ${
                      notification.type === 'success' ? 'bg-green-500' :
                      notification.type === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/notifications">
                <Button variant="ghost" className="w-full mt-4">
                  Alle Mitteilungen anzeigen
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="text-center">
                <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <h3 className="font-medium">Brauchen Sie Hilfe?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Kontaktieren Sie das HR-Team
                </p>
                <Link to="/helpdesk">
                  <Button variant="outline" className="w-full">
                    Ticket erstellen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyPortalDashboard;
