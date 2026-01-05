import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Filter, Download, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TeamMember {
  id: string;
  name: string;
  employeeId: string;
  status: 'active' | 'pause' | 'offline' | 'vacation';
  location: string;
  todayHours: number;
  weekHours: number;
  efficiency: number;
}

interface TeamMembersTableProps {
  onSelectMember: (memberId: string) => void;
}

const TeamMembersTable = ({ onSelectMember }: TeamMembersTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const teamMembers: TeamMember[] = [];

  const totalMembers = 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span>Aktiv</span>;
      case 'pause':
        return <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500"></span>Pause</span>;
      case 'vacation':
        return <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Urlaub</span>;
      default:
        return <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400"></span>Offline</span>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="font-semibold">Team-Mitglieder</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mitarbeiter</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Standort</TableHead>
            <TableHead className="text-right">Heute</TableHead>
            <TableHead className="text-right">Woche</TableHead>
            <TableHead>Effizienz</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.map((member) => (
            <TableRow key={member.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 bg-primary/10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{member.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{member.employeeId}</TableCell>
              <TableCell className="text-sm">{getStatusBadge(member.status)}</TableCell>
              <TableCell className="text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {member.location}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium">{member.todayHours.toFixed(1)} h</TableCell>
              <TableCell className="text-right font-medium">{member.weekHours.toFixed(1)} h</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 min-w-[100px]">
                  <Progress value={member.efficiency} className="h-2 flex-1" />
                  <span className="text-sm font-medium">{member.efficiency}%</span>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => onSelectMember(member.id)}
                  className="text-primary"
                >
                  Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Zeige {filteredMembers.length} von {totalMembers} Mitarbeitern
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={currentPage === 1}>
            Zurück
          </Button>
          <Button variant="outline" size="sm">
            Weiter
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TeamMembersTable;
