import { Bell, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface NotificationStats {
  unread: number;
  critical: number;
  today: number;
  done: number;
}

interface NotificationStatsCardsProps {
  stats: NotificationStats;
}

const NotificationStatsCards = ({ stats }: NotificationStatsCardsProps) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Ungelesen - Blauer Hintergrund (Logo-Farbe) */}
      <Card className="bg-blue-100 border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-200 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{stats.unread}</p>
              <p className="text-sm text-blue-700">Ungelesen</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kritisch - Weißer Hintergrund mit rotem Icon */}
      <Card className="bg-white border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.critical}</p>
              <p className="text-sm text-muted-foreground">Kritisch</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heute - Weißer Hintergrund mit blauem Icon */}
      <Card className="bg-white border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.today}</p>
              <p className="text-sm text-muted-foreground">Heute</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erledigt - Grüner Hintergrund */}
      <Card className="bg-emerald-100 border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-900">{stats.done}</p>
              <p className="text-sm text-emerald-700">Erledigt</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationStatsCards;
