
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Eye, Clock, CheckCircle } from 'lucide-react';
import { useDocumentStats, useDocuments } from '@/hooks/useDocuments';

export const DocumentsWidget = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDocumentStats();
  const { data: recentDocuments, isLoading: docsLoading } = useDocuments();

  const recentDocs = recentDocuments?.slice(0, 3) || [];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Dokumente</CardTitle>
        <FileText className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats */}
          {statsLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-2xl font-bold">{stats?.totalDocuments || 0}</p>
                <p className="text-xs text-muted-foreground">Gesamt</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-orange-600">{stats?.pendingApprovals || 0}</p>
                <p className="text-xs text-muted-foreground">Ausstehend</p>
              </div>
            </div>
          )}

          {/* Recent Documents */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Letzte Dokumente</h4>
            {docsLoading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            ) : recentDocs.length > 0 ? (
              <div className="space-y-2">
                {recentDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center space-x-2 text-sm">
                    <div className="flex-shrink-0">
                      {doc.status === 'approved' ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : doc.status === 'pending' ? (
                        <Clock className="h-3 w-3 text-orange-500" />
                      ) : (
                        <FileText className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                    <span className="flex-1 truncate">{doc.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Keine Dokumente vorhanden</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate('/documents')}
            >
              <Eye className="h-3 w-3 mr-1" />
              Alle
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => navigate('/documents')}
            >
              <Upload className="h-3 w-3 mr-1" />
              Upload
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
