import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Settings } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { documentService } from '@/services/documentService';
import { toast } from 'sonner';
import type { Document } from '@/types/documents';
import { DocumentApprovalManager } from './DocumentApprovalManager';

interface DocumentApprovalActionsProps {
  document: Document;
  showActions?: boolean;
}

export const DocumentApprovalActions: React.FC<DocumentApprovalActionsProps> = ({
  document,
  showActions = false
}) => {
  const queryClient = useQueryClient();
  const [showApprovalManager, setShowApprovalManager] = useState(false);

  const approveDocument = useMutation({
    mutationFn: (documentId: string) => documentService.approveDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Dokument wurde genehmigt');
    },
    onError: () => {
      toast.error('Fehler beim Genehmigen des Dokuments');
    }
  });

  const rejectDocument = useMutation({
    mutationFn: (documentId: string) => documentService.rejectDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Dokument wurde abgelehnt');
    },
    onError: () => {
      toast.error('Fehler beim Ablehnen des Dokuments');
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Genehmigt
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Abgelehnt
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Ausstehend
          </Badge>
        );
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {getStatusBadge(document.status)}
        
        {showActions && (
          <div className="flex gap-2 ml-2">
            {/* Genehmigungsmanager Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowApprovalManager(true)}
            >
              <Settings className="w-4 h-4 mr-1" />
              Genehmigungen
            </Button>
            
            {/* Direkte Genehmigungsaktionen nur für ausstehende Dokumente */}
            {document.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                  onClick={() => approveDocument.mutate(document.id)}
                  disabled={approveDocument.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Genehmigen
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => rejectDocument.mutate(document.id)}
                  disabled={rejectDocument.isPending}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Ablehnen
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <DocumentApprovalManager
        document={document}
        open={showApprovalManager}
        onOpenChange={setShowApprovalManager}
      />
    </>
  );
};