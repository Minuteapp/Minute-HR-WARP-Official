import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, 
  Monitor, 
  Smartphone, 
  Key, 
  Globe, 
  Box,
  Mail,
  MoreHorizontal,
  Eye,
  Download
} from "lucide-react";

interface HardwareItem {
  id: number;
  employee: {
    name: string;
    position: string;
    initials: string;
    department: string;
  };
  hardware: string;
  specs: string;
  serialNumber: string;
  category: string;
  status: 'confirmed' | 'assigned' | 'pending' | 'returned';
  assignedDate: string;
  confirmedDate: string | null;
}

interface OnboardingHardwareDetailViewProps {
  hardware: HardwareItem;
  onBack: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Laptop": return Monitor;
    case "Smartphone": return Smartphone;
    case "Zugang": return Key;
    case "Software": return Globe;
    case "Sonstiges": return Box;
    default: return Box;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "confirmed":
      return <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100">Bestätigt</Badge>;
    case "assigned":
      return <Badge className="bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-100">Zugewiesen</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-100">Ausstehend</Badge>;
    case "returned":
      return <Badge className="bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-100">Zurückgegeben</Badge>;
    default:
      return null;
  }
};

const OnboardingHardwareDetailView = ({ hardware, onBack }: OnboardingHardwareDetailViewProps) => {
  const CategoryIcon = getCategoryIcon(hardware.category);

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Übersicht
      </Button>

      {/* Header Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <CategoryIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold">{hardware.hardware}</h2>
                {getStatusBadge(hardware.status)}
                <Badge variant="outline">{hardware.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{hardware.specs}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee & Department */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Mitarbeiter</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                {hardware.employee.initials}
              </div>
              <div>
                <p className="font-medium">{hardware.employee.name}</p>
                <p className="text-sm text-muted-foreground">{hardware.employee.position}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Abteilung</p>
            <p className="font-medium text-lg">{hardware.employee.department}</p>
          </CardContent>
        </Card>
      </div>

      {/* Serial Number */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Seriennummer</p>
          <p className="font-mono font-medium text-lg">{hardware.serialNumber}</p>
        </CardContent>
      </Card>

      {/* Date Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Zugewiesen am</p>
            <p className="font-medium text-lg">{hardware.assignedDate}</p>
          </CardContent>
        </Card>

        {hardware.confirmedDate ? (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <p className="text-sm text-green-700 mb-1">Bestätigt am</p>
              <p className="font-medium text-lg text-green-700">{hardware.confirmedDate}</p>
              <p className="text-xs text-green-600 mt-1">✓ Übergabe dokumentiert</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Bestätigt am</p>
              <p className="font-medium text-lg text-muted-foreground">—</p>
              <p className="text-xs text-muted-foreground mt-1">Noch nicht bestätigt</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button variant="outline" className="flex-1">
          <Mail className="h-4 w-4 mr-2" />
          E-Mail senden
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              Details bearbeiten
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Übergabeprotokoll
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Hardware zurückgeben
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default OnboardingHardwareDetailView;
