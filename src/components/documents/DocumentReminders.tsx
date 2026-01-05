import { AlertCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { documentService } from "@/services/documentService";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

const DocumentReminders = () => {
  const { data: allDocuments = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getDocuments(),
  });

  // Filter Dokumente mit expiry_date in den nächsten 30 Tagen
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const expiringDocuments = allDocuments
    .filter(doc => {
      if (!doc.expiry_date) return false;
      const expiryDate = new Date(doc.expiry_date);
      return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
    })
    .sort((a, b) => new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime())
    .map(doc => ({
      id: doc.id,
      title: doc.title,
      expires: new Date(doc.expiry_date!).toLocaleDateString('de-DE'),
      type: doc.category
    }));

  if (expiringDocuments.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-800">
          <AlertCircle className="h-5 w-5" />
          <span>Ablaufende Dokumente</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {expiringDocuments.map((reminder) => (
            <div key={reminder.id} className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">{reminder.title}</span>
              </div>
              <Badge variant="outline" className="text-orange-700 border-orange-300">
                {reminder.expires}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentReminders;