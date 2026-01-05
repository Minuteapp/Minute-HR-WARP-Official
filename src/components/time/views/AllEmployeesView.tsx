import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download } from "lucide-react";
import AllEmployeesStats from "./AllEmployeesStats";
import AllEmployeesTable from "./AllEmployeesTable";

interface AllEmployeesViewProps {
  onSelectEmployee: (employeeId: string) => void;
}

const AllEmployeesView = ({ onSelectEmployee }: AllEmployeesViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Alle Mitarbeiter</h1>

      {/* Statistik-Karten */}
      <AllEmployeesStats />

      {/* Such- und Filter-Leiste */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Mitarbeiter suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 max-w-full"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Alle Abteilungen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Abteilungen</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Alle Standorte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Standorte</SelectItem>
              <SelectItem value="berlin">Berlin</SelectItem>
              <SelectItem value="muenchen">München</SelectItem>
              <SelectItem value="hamburg">Hamburg</SelectItem>
              <SelectItem value="frankfurt">Frankfurt</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Mitarbeiter-Tabelle */}
      <AllEmployeesTable onSelectEmployee={onSelectEmployee} />
    </div>
  );
};

export default AllEmployeesView;
