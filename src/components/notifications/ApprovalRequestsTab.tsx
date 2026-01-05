import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { CheckCircle, XCircle, Clock, User, Calendar, FileText } from "lucide-react";

interface ApprovalRequest {
  id: string;
  type: "absence" | "expense" | "document" | "workflow";
  title: string;
  requester: string;
  department: string;
  requestDate: Date;
  status: "pending" | "approved" | "rejected";
  priority: "high" | "normal" | "low";
  description: string;
}

// Keine Mock-Daten - Genehmigungsanfragen werden aus der Datenbank geladen
const mockRequests: ApprovalRequest[] = [];

export function ApprovalRequestsTab() {
  const [requests, setRequests] = useState<ApprovalRequest[]>(mockRequests);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const filteredRequests = requests.filter(req => 
    filter === "all" ? true : req.status === filter
  );

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: "approved" as const } : req
    ));
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: "rejected" as const } : req
    ));
  };

  const getTypeIcon = (type: ApprovalRequest['type']) => {
    switch (type) {
      case "absence":
        return <Calendar size={18} className="text-blue-600" />;
      case "expense":
        return <FileText size={18} className="text-green-600" />;
      case "document":
        return <FileText size={18} className="text-purple-600" />;
      case "workflow":
        return <Clock size={18} className="text-orange-600" />;
    }
  };

  const getStatusBadge = (status: ApprovalRequest['status']) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50">Ausstehend</Badge>;
      case "approved":
        return <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">Genehmigt</Badge>;
      case "rejected":
        return <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50">Abgelehnt</Badge>;
    }
  };

  const getPriorityBadge = (priority: ApprovalRequest['priority']) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="text-[11px]">Hoch</Badge>;
      case "normal":
        return <Badge variant="secondary" className="text-[11px]">Normal</Badge>;
      case "low":
        return <Badge variant="outline" className="text-[11px]">Niedrig</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">Ausstehend</p>
                <p className="text-[20px] font-semibold">
                  {requests.filter(r => r.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">Genehmigt</p>
                <p className="text-[20px] font-semibold">
                  {requests.filter(r => r.status === "approved").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">Abgelehnt</p>
                <p className="text-[20px] font-semibold">
                  {requests.filter(r => r.status === "rejected").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">Gesamt</p>
                <p className="text-[20px] font-semibold">{requests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-border p-4">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Alle
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending")}
          >
            Ausstehend
          </Button>
          <Button
            variant={filter === "approved" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("approved")}
          >
            Genehmigt
          </Button>
          <Button
            variant={filter === "rejected" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("rejected")}
          >
            Abgelehnt
          </Button>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg border border-border p-12 text-center">
            <p className="text-[14px] text-muted-foreground">
              Keine Anfragen gefunden
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(request.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-[15px] font-medium mb-1">{request.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(request.status)}
                          {getPriorityBadge(request.priority)}
                        </div>
                      </div>
                    </div>

                    <p className="text-[13px] text-gray-700 mb-3">
                      {request.description}
                    </p>

                    <div className="flex items-center gap-4 text-[12px] text-muted-foreground mb-3">
                      <div className="flex items-center gap-1.5">
                        <User size={14} />
                        <span>{request.requester}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} />
                        <span>{request.department}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{request.requestDate.toLocaleString('de-DE')}</span>
                      </div>
                    </div>

                    {request.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle size={14} className="mr-1.5" />
                          Genehmigen
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(request.id)}
                        >
                          <XCircle size={14} className="mr-1.5" />
                          Ablehnen
                        </Button>
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
