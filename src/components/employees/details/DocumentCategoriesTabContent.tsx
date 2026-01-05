
import { TabsContent } from "@/components/ui/tabs";
import { DocumentCategories } from "../profile/DocumentCategories";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpIcon, Filter, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export const DocumentCategoriesTabContent = ({ employeeId }: { employeeId: string }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  return (
    <TabsContent value="documents" className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="mb-6 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Dokumente</h2>
          <Button>
            <FileUpIcon className="h-4 w-4 mr-2" />
            Dokument hochladen
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Input
              placeholder="Dokumente durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select 
            value={categoryFilter || "all"} 
            onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Alle Kategorien" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              <SelectItem value="training">Schulungen</SelectItem>
              <SelectItem value="employee">Mitarbeiterdokumente</SelectItem>
              <SelectItem value="payroll">Gehaltsabrechnungen</SelectItem>
              <SelectItem value="legal">Rechtliche Dokumente</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
            {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </Button>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <div className="p-4 border-b">
          <h3 className="font-medium">Dokumentkategorien</h3>
          <p className="text-sm text-gray-500 mt-1">
            Organisieren Sie Dokumente nach Kategorien für bessere Übersicht
          </p>
        </div>
      </Card>
      
      <DocumentCategories employeeId={employeeId} />
    </TabsContent>
  );
};

interface DocumentRowProps {
  name: string;
  category: string;
  date: string;
  size: string;
}

function DocumentRow({ name, category, date, size }: DocumentRowProps) {
  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case 'training': return 'Schulung';
      case 'employee': return 'Mitarbeiterdokument';
      case 'payroll': return 'Gehaltsabrechnung';
      case 'legal': return 'Rechtliches Dokument';
      default: return cat;
    }
  };
  
  const getCategoryClass = (cat: string) => {
    switch(cat) {
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-purple-100 text-purple-800';
      case 'payroll': return 'bg-green-100 text-green-800';
      case 'legal': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center space-x-3">
        <FileUpIcon className="h-5 w-5 text-gray-500" />
        <div>
          <p className="font-medium">{name}</p>
          <div className="flex items-center space-x-3 mt-1">
            <span className={`text-xs px-2 py-1 rounded ${getCategoryClass(category)}`}>
              {getCategoryLabel(category)}
            </span>
            <span className="text-xs text-gray-500">{date}</span>
            <span className="text-xs text-gray-500">{size}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm">Anzeigen</Button>
        <Button variant="ghost" size="sm">Herunterladen</Button>
      </div>
    </div>
  );
}
