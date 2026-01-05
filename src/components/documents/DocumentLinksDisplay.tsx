
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FolderOpen, CheckSquare, X, Link, Bot } from 'lucide-react';
import { useLinkedProjects, useLinkedTasks, useRemoveDocumentProjectLink, useRemoveDocumentTaskLink } from '@/hooks/useDocumentLinking';

interface DocumentLinksDisplayProps {
  documentId: string;
  readOnly?: boolean;
}

export const DocumentLinksDisplay: React.FC<DocumentLinksDisplayProps> = ({ 
  documentId, 
  readOnly = false 
}) => {
  const { data: linkedProjects = [], isLoading: loadingProjects } = useLinkedProjects(documentId);
  const { data: linkedTasks = [], isLoading: loadingTasks } = useLinkedTasks(documentId);
  const removeProjectLink = useRemoveDocumentProjectLink();
  const removeTaskLink = useRemoveDocumentTaskLink();

  const handleRemoveProjectLink = (linkId: string) => {
    removeProjectLink.mutate(linkId);
  };

  const handleRemoveTaskLink = (linkId: string) => {
    removeTaskLink.mutate(linkId);
  };

  if (loadingProjects || loadingTasks) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (linkedProjects.length === 0 && linkedTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Verknüpfungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Dieses Dokument ist noch nicht mit Projekten oder Aufgaben verknüpft.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Verknüpfungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Verknüpfte Projekte */}
        {linkedProjects.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 font-medium mb-2">
              <FolderOpen className="h-4 w-4" />
              Projekte ({linkedProjects.length})
            </h4>
            <div className="space-y-2">
              {linkedProjects.map((link) => (
                <div key={link.projects?.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{link.projects?.name}</span>
                      {link.auto_linked && (
                        <Badge variant="secondary" className="text-xs">
                          <Bot className="h-3 w-3 mr-1" />
                          Automatisch
                        </Badge>
                      )}
                    </div>
                    {link.projects?.description && (
                      <p className="text-sm text-gray-500 mt-1">{link.projects.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Relevanz: {Math.round(link.relevance_score * 100)}%
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {link.projects?.status}
                      </Badge>
                    </div>
                  </div>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProjectLink(link.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verknüpfte Aufgaben */}
        {linkedTasks.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 font-medium mb-2">
              <CheckSquare className="h-4 w-4" />
              Aufgaben ({linkedTasks.length})
            </h4>
            <div className="space-y-2">
              {linkedTasks.map((link) => (
                <div key={link.tasks?.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{link.tasks?.title}</span>
                      {link.auto_linked && (
                        <Badge variant="secondary" className="text-xs">
                          <Bot className="h-3 w-3 mr-1" />
                          Automatisch
                        </Badge>
                      )}
                    </div>
                    {link.tasks?.description && (
                      <p className="text-sm text-gray-500 mt-1">{link.tasks.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Relevanz: {Math.round(link.relevance_score * 100)}%
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {link.tasks?.status}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          link.tasks?.priority === 'high' ? 'text-red-600' :
                          link.tasks?.priority === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}
                      >
                        {link.tasks?.priority}
                      </Badge>
                    </div>
                  </div>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTaskLink(link.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
