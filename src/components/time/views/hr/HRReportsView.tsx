import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

const reports: Array<{ 
  id: string; 
  title: string; 
  description: string; 
  type: string; 
  size: string 
}> = [];

const HRReportsView = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">HR Berichte & Analysen</h2>
      
      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="py-5 px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-base">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="font-normal">{report.type}</Badge>
                    <span className="text-sm text-muted-foreground">{report.size}</span>
                  </div>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HRReportsView;
