import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar,
  Star,
  FileText,
  MessageSquare,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CandidateListProps {
  limit?: number;
  filters?: {
    search?: string;
    stage?: string;
    position?: string;
  };
}

const CandidateList = ({ limit, filters }: CandidateListProps) => {
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['candidates', companyId, filters],
    queryFn: async () => {
      let query = supabase
        .from('candidates')
        .select(`
          *,
          job_postings (title)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (filters?.stage && filters.stage !== 'all') {
        query = query.eq('stage', filters.stage);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "interview":
        return "default";
      case "screening":
        return "secondary";
      case "new":
        return "outline";
      case "offer":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "interview": return "Interview";
      case "screening": return "Screening";
      case "new": return "Neu";
      case "offer": return "Angebot";
      case "hired": return "Eingestellt";
      case "rejected": return "Abgelehnt";
      default: return status;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Filter auf Client-Seite für Suche
  let filteredCandidates = candidates;
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredCandidates = candidates.filter((c: any) => 
      c.first_name?.toLowerCase().includes(searchLower) ||
      c.last_name?.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower)
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (filteredCandidates.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Keine Kandidaten vorhanden</p>
          <p className="text-sm mt-1">Fügen Sie Ihre ersten Kandidaten hinzu.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredCandidates.map((candidate: any) => (
        <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">
                    {candidate.first_name} {candidate.last_name}
                  </h3>
                  {candidate.rating && (
                    <div className="flex">{getRatingStars(candidate.rating)}</div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {candidate.job_postings?.title || candidate.position || 'Keine Position'}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  {candidate.email && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {candidate.email}
                    </div>
                  )}
                  {candidate.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      {candidate.phone}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="outline">
                    {getStatusLabel(candidate.stage || candidate.status || 'new')}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Erstellt: {format(new Date(candidate.created_at), 'dd.MM.yyyy', { locale: de })}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant={getStatusColor(candidate.stage || candidate.status || 'new')}>
                  {getStatusLabel(candidate.stage || candidate.status || 'new')}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Nachricht senden
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Calendar className="h-4 w-4 mr-2" />
                      Interview planen
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="h-4 w-4 mr-2" />
                      Unterlagen ansehen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CandidateList;
