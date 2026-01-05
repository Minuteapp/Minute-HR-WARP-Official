import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  MessageSquare,
  User,
  Calendar,
  MapPin,
  DollarSign,
  Workflow,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BusinessTravelRequest } from "@/hooks/business-travel/useBusinessTravelRequests";

interface TravelApprovalWorkflowProps {
  className?: string;
}

export const TravelApprovalWorkflow = ({ className }: TravelApprovalWorkflowProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<BusinessTravelRequest | null>(null);
  const [approvalComment, setApprovalComment] = useState("");

  // Fetch pending travel requests
  const { data: pendingRequests = [], isLoading } = useQuery({
    queryKey: ['pending-travel-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_travel_requests')
        .select('*')
        .in('status', ['pending'])
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as BusinessTravelRequest[];
    }
  });

  // Approve travel request mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, comments }: { id: string; comments?: string }) => {
      // Update request status
      const { error: updateError } = await supabase
        .from('business_travel_requests')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Create approval record
      const { error: approvalError } = await supabase
        .from('travel_approvals')
        .insert([{
          travel_request_id: id,
          approver_role: 'admin',
          status: 'approved',
          approved_at: new Date().toISOString(),
          comments: comments
        }]);

      if (approvalError) throw approvalError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-travel-requests'] });
      queryClient.invalidateQueries({ queryKey: ['travel-map-pins'] });
      setSelectedRequest(null);
      setApprovalComment("");
      toast({
        title: "Reiseantrag genehmigt",
        description: "Der Reiseantrag wurde erfolgreich genehmigt.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler bei Genehmigung",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Reject travel request mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, comments }: { id: string; comments: string }) => {
      // Update request status
      const { error: updateError } = await supabase
        .from('business_travel_requests')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Create approval record
      const { error: approvalError } = await supabase
        .from('travel_approvals')
        .insert([{
          travel_request_id: id,
          approver_role: 'admin',
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          comments: comments
        }]);

      if (approvalError) throw approvalError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-travel-requests'] });
      setSelectedRequest(null);
      setApprovalComment("");
      toast({
        title: "Reiseantrag abgelehnt",
        description: "Der Reiseantrag wurde abgelehnt.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler bei Ablehnung",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Genehmigungsworkflow
          <Badge variant="secondary">{pendingRequests.length} offen</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {pendingRequests.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-muted-foreground">Keine offenen Genehmigungen</p>
          </div>
        ) : (
          pendingRequests.map((request) => (
            <Card key={request.id} className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{request.employee_name}</span>
                      <Badge className={cn("text-xs", getStatusColor(request.status))}>
                        {request.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{request.destination}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(request.start_date)} - {formatDate(request.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{formatCurrency(request.estimated_cost)}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {request.purpose}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Reiseantrag Details</DialogTitle>
                        </DialogHeader>
                        
                        {selectedRequest && (
                          <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Mitarbeiter</Label>
                                <p className="font-medium">{selectedRequest.employee_name}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Abteilung</Label>
                                <p className="font-medium">{selectedRequest.department || 'N/A'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Reiseziel</Label>
                                <p className="font-medium">{selectedRequest.destination}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Kostenstelle</Label>
                                <p className="font-medium">{selectedRequest.cost_center || 'N/A'}</p>
                              </div>
                            </div>

                            {/* Travel Details */}
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Reisezweck</Label>
                              <p className="mt-1">{selectedRequest.purpose}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Reisezeit</Label>
                                <p className="font-medium">
                                  {formatDate(selectedRequest.start_date)} - {formatDate(selectedRequest.end_date)}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Geschätzte Kosten</Label>
                                <p className="font-medium text-lg">{formatCurrency(selectedRequest.estimated_cost)}</p>
                              </div>
                            </div>

                            {/* Preferences */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-muted-foreground">Präferenzen</Label>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Flugklasse:</span> {selectedRequest.flight_preferences?.class || 'Economy'}
                                </div>
                                <div>
                                  <span className="font-medium">Hotelkategorie:</span> {selectedRequest.hotel_preferences?.category || '3-4 Sterne'}
                                </div>
                                <div>
                                  <span className="font-medium">Mietwagen:</span> {selectedRequest.car_rental_needed ? 'Ja' : 'Nein'}
                                </div>
                                <div>
                                  <span className="font-medium">Risiko-Score:</span> {selectedRequest.risk_score}/10
                                </div>
                              </div>
                            </div>

                            {/* Approval Comments */}
                            <div>
                              <Label htmlFor="approval-comment" className="text-sm font-medium">
                                Kommentar (optional)
                              </Label>
                              <Textarea
                                id="approval-comment"
                                value={approvalComment}
                                onChange={(e) => setApprovalComment(e.target.value)}
                                placeholder="Kommentar zur Genehmigung/Ablehnung..."
                                className="mt-1"
                                rows={3}
                              />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  if (!approvalComment.trim()) {
                                    toast({
                                      title: "Kommentar erforderlich",
                                      description: "Bitte geben Sie einen Grund für die Ablehnung an.",
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  rejectMutation.mutate({ 
                                    id: selectedRequest.id, 
                                    comments: approvalComment 
                                  });
                                }}
                                disabled={rejectMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Ablehnen
                              </Button>
                              <Button
                                onClick={() => approveMutation.mutate({ 
                                  id: selectedRequest.id, 
                                  comments: approvalComment 
                                })}
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Genehmigen
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt("Grund für Ablehnung:");
                        if (reason) {
                          rejectMutation.mutate({ id: request.id, comments: reason });
                        }
                      }}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Ablehnen
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate({ id: request.id })}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Genehmigen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};