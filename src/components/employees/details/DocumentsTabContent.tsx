import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Filter,
  FileText,
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

interface DocumentsTabContentProps {
  employeeId: string;
}

export const DocumentsTabContent = ({ employeeId }: DocumentsTabContentProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Keine Mock-Daten: solange keine echte Dokumentenquelle angebunden ist, sind die Listen leer.
  const categories: Array<{ name: string; count: number; icon?: React.ComponentType<{ className?: string }> }> = [];
  const documents: Array<{ id: string; name: string; category: string; date: string; size: string }> = [];

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Categories */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                Kategorien
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Keine Kategorien verfügbar</p>
                  <p className="text-xs text-muted-foreground">Sobald Dokumente vorhanden sind, werden Kategorien automatisch angezeigt.</p>
                </div>
              ) : (
                categories.map((category, index) => {
                  const Icon = category.icon ?? MoreHorizontal;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedCategory === category.name
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-gray-50 border-transparent"
                      } border`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Button className="w-full gap-2" variant="default">
            <Upload className="h-4 w-4" />
            Dokument hochladen
          </Button>
        </div>

        {/* Right Side - All Documents */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Alle Dokumente</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-3 w-3" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    Sortieren
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Keine Dokumente vorhanden</p>
                  <p className="text-xs text-muted-foreground">Laden Sie ein Dokument hoch, um es hier zu sehen.</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.category} • {doc.date} • {doc.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Document History & Versioning */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Dokumenten-Historie & Versionierung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Keine Historie verfügbar</p>
            <p className="text-xs text-muted-foreground">Sobald Dokumente versioniert werden, erscheint die Historie hier.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
