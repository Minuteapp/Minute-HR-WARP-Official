import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Calendar, DollarSign, Clock, Users, CheckCircle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import RequestDetailView from "./details/RequestDetailView";
import { useToast } from "@/hooks/use-toast";

const mockRequests: any[] = [];

interface RequestCardProps {
  request: any;
  onDetailsClick: () => void;
  onApprove: () => void;
  onReject: () => void;
}

const RequestCard = ({ request, onDetailsClick, onApprove, onReject }: RequestCardProps) => {
  const Icon = request.icon;
  const isOpen = request.status === 'open';
  
  return (
    <div className={`p-4 border rounded-lg bg-white transition-all hover:shadow-sm ${isOpen ? 'border-l-4 border-l-orange-500' : ''}`}>
      <div className="flex gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-full ${request.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`h-5 w-5 ${request.iconColor}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold">{request.title}</h4>
                <span className="text-sm text-muted-foreground">{request.id}</span>
                {request.priorityBadge && (
                  <Badge variant="outline" className={request.priorityBadge.class}>
                    {request.priorityBadge.text}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{request.subtitle}</p>
            </div>
            
            <Badge variant="outline" className={request.statusBadge.class}>
              {request.statusBadge.text}
            </Badge>
          </div>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{request.submitter.name}</span>
              <span>({request.submitter.department})</span>
            </div>
            {request.dateRange && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{request.dateRange}</span>
              </div>
            )}
            {request.date && !request.dateRange && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{request.date}</span>
              </div>
            )}
            {request.amount && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>{request.amount}</span>
              </div>
            )}
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {request.type === 'vacation' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Urlaub</Badge>
            )}
            {request.type === 'expense' && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Spesen</Badge>
            )}
            {request.type === 'overtime' && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Überstunden</Badge>
            )}
            {request.duration && (
              <Badge variant="outline">{request.duration}</Badge>
            )}
            {request.receipts && (
              <Badge variant="outline">{request.receipts}</Badge>
            )}
            {request.hours && (
              <Badge variant="outline">{request.hours}</Badge>
            )}
          </div>
          
          {/* Rejection Reason */}
          {request.status === 'rejected' && request.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
              <div className="flex items-start gap-2">
                <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Ablehnungsgrund:</p>
                  <p className="text-sm text-red-700">{request.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {isOpen && (
                <>
                  <Button size="sm" variant="outline" onClick={onReject}>
                    <X className="h-4 w-4 mr-1" />
                    Ablehnen
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={onApprove}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Genehmigen
                  </Button>
                </>
              )}
            </div>
            
            <Button variant="link" size="sm" onClick={onDetailsClick}>
              Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationRequests = () => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { toast } = useToast();

  // Filter-Logik
  const filteredRequests = mockRequests.filter(req => {
    // Status-Filter
    if (statusFilter !== 'all' && req.status !== statusFilter) {
      return false;
    }
    
    // Such-Filter
    if (searchQuery && 
        !req.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !req.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !req.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !req.submitter.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Anzahl berechnen
  const counts = {
    all: mockRequests.length,
    open: mockRequests.filter(r => r.status === 'open').length,
    approved: mockRequests.filter(r => r.status === 'approved').length,
    rejected: mockRequests.filter(r => r.status === 'rejected').length
  };

  const handleApprove = (requestId: string, comment?: string) => {
    console.log('Approve request:', requestId, comment);
    toast({
      title: "Anfrage genehmigt",
      description: `Anfrage ${requestId} wurde erfolgreich genehmigt.`,
    });
    setSelectedRequest(null);
  };

  const handleReject = (requestId: string, reason: string) => {
    console.log('Reject request:', requestId, reason);
    toast({
      title: "Anfrage abgelehnt",
      description: `Anfrage ${requestId} wurde abgelehnt.`,
      variant: "destructive",
    });
    setSelectedRequest(null);
  };

  const handleQuickApprove = (request: any) => {
    handleApprove(request.id);
  };

  const handleQuickReject = (request: any) => {
    setSelectedRequest(request);
  };

  return (
    <div className="space-y-6">
      {/* Filter-Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant={statusFilter === 'all' ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            Alle <Badge className="ml-2 bg-background text-foreground">{counts.all}</Badge>
          </Button>
          <Button 
            variant={statusFilter === 'open' ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter('open')}
          >
            Offen <Badge className="ml-2 bg-background text-foreground">{counts.open}</Badge>
          </Button>
          <Button 
            variant={statusFilter === 'approved' ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter('approved')}
          >
            Genehmigt <Badge className="ml-2 bg-background text-foreground">{counts.approved}</Badge>
          </Button>
          <Button 
            variant={statusFilter === 'rejected' ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter('rejected')}
          >
            Abgelehnt <Badge className="ml-2 bg-background text-foreground">{counts.rejected}</Badge>
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Erweiterte Filter
        </Button>
      </div>

      {/* Suchfeld */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Anfragen durchsuchen..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Anfragen-Liste */}
      <ScrollArea className="h-[calc(100vh-22rem)]">
        <div className="space-y-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <RequestCard 
                key={req.id} 
                request={req}
                onDetailsClick={() => setSelectedRequest(req)}
                onApprove={() => handleQuickApprove(req)}
                onReject={() => handleQuickReject(req)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Keine Anfragen gefunden</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Detail-Dialog */}
      <RequestDetailView
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
        request={selectedRequest}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default NotificationRequests;
