
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Filter, Download } from 'lucide-react';

interface TimeEntriesHeaderProps {
  handleFilter: () => void;
  handleExport: () => void;
}

const TimeEntriesHeader = ({ handleFilter, handleExport }: TimeEntriesHeaderProps) => {
  return (
    <Card className="p-6 border-[#9b87f5]/40 border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#9b87f5]" />
          Zeiterfassungen
        </h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-[#9b87f5] hover:bg-[#9b87f5]/5"
            onClick={handleFilter}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button 
            variant="outline" 
            className="border-[#9b87f5] hover:bg-[#9b87f5]/5"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportieren
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TimeEntriesHeader;
