
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatFileSize, getDocumentCategoryLabel, DOCUMENT_CATEGORIES } from "@/utils/documentUtils";
import { DocumentCategory } from "@/types/documents";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, File, FileText, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface EmployeeDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  size: number;
  uploadedAt: string;
  url: string;
}

interface EmployeeDocumentsProps {
  employeeId: string;
  documents?: EmployeeDocument[];
}


export const EmployeeDocuments = ({ employeeId, documents = [] }: EmployeeDocumentsProps) => {
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const docsToDisplay = documents;
  
  const filteredDocuments = selectedTab === "all"
    ? docsToDisplay
    : docsToDisplay.filter(doc => doc.category === selectedTab as DocumentCategory);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Dokumente</CardTitle>
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Hochladen
          </Button>
        </div>
        <CardDescription>Alle Dokumente des Mitarbeiters</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="w-full overflow-x-auto">
            <TabsTrigger value="all">Alle</TabsTrigger>
            {Object.keys(DOCUMENT_CATEGORIES).map((category) => (
              <TabsTrigger key={category} value={category}>
                {getDocumentCategoryLabel(category as DocumentCategory)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="space-y-2">
            {filteredDocuments.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Keine Dokumente gefunden</p>
              </div>
            ) : (
              filteredDocuments.map(doc => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded">
                      <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getDocumentCategoryLabel(doc.category)}
                        </Badge>
                        <span className="text-xs">{formatFileSize(doc.size)}</span>
                        <span className="text-xs">{new Date(doc.uploadedAt).toLocaleDateString('de-DE')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Details anzeigen</DropdownMenuItem>
                        <DropdownMenuItem>Freigeben</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Löschen</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="text-sm text-gray-500">
          Insgesamt {filteredDocuments.length} Dokumente
        </div>
        <Button variant="outline" size="sm">
          Alle herunterladen
        </Button>
      </CardFooter>
    </Card>
  );
};
