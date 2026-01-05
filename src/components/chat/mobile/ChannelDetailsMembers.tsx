import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, Briefcase, MapPin, Crown, MoreVertical, FileText, Link, ChevronRight } from "lucide-react";

interface Member {
  id: string;
  name: string;
  initials: string;
  position: string;
  department: string;
  location: string;
  isOnline: boolean;
  isAdmin: boolean;
}

interface ChannelDetailsMembersProps {
  channelId: string;
}

const mockMembers: Member[] = [];

export default function ChannelDetailsMembers({ channelId }: ChannelDetailsMembersProps) {
  const totalMembers = 8;
  const onlineMembers = 5;
  const adminCount = 3;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* KPI-Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{totalMembers}</div>
            <div className="text-xs text-muted-foreground">Gesamt</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{onlineMembers}</div>
            <div className="text-xs text-muted-foreground">Online</div>
          </div>
          <div className="bg-primary/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{adminCount}</div>
            <div className="text-xs text-muted-foreground">Admins</div>
          </div>
        </div>

        {/* Mitglieder hinzufügen Button */}
        <Button variant="outline" className="w-full justify-center gap-2">
          <Plus className="w-4 h-4" />
          Mitglieder hinzufügen
        </Button>

        {/* Suchfeld */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Mitglieder durchsuchen..." className="pl-10" />
        </div>

        {/* Filter-Dropdowns */}
        <div className="grid grid-cols-2 gap-3">
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Alle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Abteilungen</SelectItem>
              <SelectItem value="it">IT</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Alle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Standorte</SelectItem>
              <SelectItem value="berlin">Berlin</SelectItem>
              <SelectItem value="munich">München</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select defaultValue="all-roles">
          <SelectTrigger>
            <SelectValue placeholder="Alle Rollen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-roles">Alle Rollen</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="member">Mitglieder</SelectItem>
          </SelectContent>
        </Select>

        {/* Mitgliederzahl */}
        <h3 className="text-sm font-medium text-muted-foreground">
          {totalMembers} Mitglieder
        </h3>

        {/* Mitgliederliste */}
        <div className="space-y-2">
          {mockMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted"
            >
              {/* Avatar mit Online-Status */}
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                {member.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Name + Admin-Badge */}
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{member.name}</span>
                  {member.isAdmin && <Crown className="w-4 h-4 text-yellow-500" />}
                </div>

                {/* Position */}
                <div className="text-sm text-muted-foreground">{member.position}</div>

                {/* Abteilung + Standort */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Briefcase className="w-3 h-3" />
                  <span>{member.department}</span>
                  <span>•</span>
                  <MapPin className="w-3 h-3" />
                  <span>{member.location}</span>
                </div>
              </div>

              {/* Drei-Punkte-Menü */}
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Integrationen-Sektion */}
        <div className="mt-6 space-y-3">
          <h3 className="font-semibold">Integrationen</h3>

          {/* Aufgaben-Card */}
          <button className="w-full bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between hover:bg-primary/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Aufgaben</h4>
                <p className="text-sm text-muted-foreground">3 verknüpfte Aufgaben</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Dokumente-Card */}
          <button className="w-full bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between hover:bg-green-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Link className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Dokumente</h4>
                <p className="text-sm text-muted-foreground">12 geteilte Dateien</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </ScrollArea>
  );
}
