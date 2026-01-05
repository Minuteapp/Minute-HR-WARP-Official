
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Filter, X, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ShiftFilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShiftFilterDialog = ({ isOpen, onOpenChange }: ShiftFilterDialogProps) => {
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [shiftTypes, setShiftTypes] = useState({
    early: true,
    late: true,
    night: true,
  });
  const [statuses, setStatuses] = useState({
    scheduled: true,
    confirmed: true,
    conflict: true,
  });
  const [locations, setLocations] = useState("all");
  const [departments, setDepartments] = useState("all");
  
  const handleReset = () => {
    setEmployeeFilter("");
    setShiftTypes({
      early: true,
      late: true,
      night: true,
    });
    setStatuses({
      scheduled: true,
      confirmed: true,
      conflict: true,
    });
    setLocations("all");
    setDepartments("all");
  };
  
  const handleApply = () => {
    // Hier würde die Logik zur Anwendung der Filter implementiert
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Schichtplan filtern
          </DialogTitle>
          <DialogDescription>
            Passen Sie die Filtereinstellungen an, um nur die relevanten Schichten anzuzeigen.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="employee">Mitarbeitersuche</Label>
            <Input 
              id="employee" 
              placeholder="Name eingeben..." 
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Schichttypen</Label>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="early" 
                  checked={shiftTypes.early}
                  onCheckedChange={(checked) => setShiftTypes({...shiftTypes, early: !!checked})}
                />
                <Label htmlFor="early" className="text-sm font-normal">Frühschicht</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="late" 
                  checked={shiftTypes.late}
                  onCheckedChange={(checked) => setShiftTypes({...shiftTypes, late: !!checked})}
                />
                <Label htmlFor="late" className="text-sm font-normal">Spätschicht</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="night" 
                  checked={shiftTypes.night}
                  onCheckedChange={(checked) => setShiftTypes({...shiftTypes, night: !!checked})}
                />
                <Label htmlFor="night" className="text-sm font-normal">Nachtschicht</Label>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="scheduled" 
                  checked={statuses.scheduled}
                  onCheckedChange={(checked) => setStatuses({...statuses, scheduled: !!checked})}
                />
                <Label htmlFor="scheduled" className="text-sm font-normal">Geplant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="confirmed" 
                  checked={statuses.confirmed}
                  onCheckedChange={(checked) => setStatuses({...statuses, confirmed: !!checked})}
                />
                <Label htmlFor="confirmed" className="text-sm font-normal">Bestätigt</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="conflict" 
                  checked={statuses.conflict}
                  onCheckedChange={(checked) => setStatuses({...statuses, conflict: !!checked})}
                />
                <Label htmlFor="conflict" className="text-sm font-normal">Konflikt</Label>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Standort</Label>
              <Select value={locations} onValueChange={setLocations}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Alle Standorte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Standorte</SelectItem>
                  <SelectItem value="berlin">Berlin</SelectItem>
                  <SelectItem value="hamburg">Hamburg</SelectItem>
                  <SelectItem value="munich">München</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Abteilung</Label>
              <Select value={departments} onValueChange={setDepartments}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Alle Abteilungen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Abteilungen</SelectItem>
                  <SelectItem value="sales">Vertrieb</SelectItem>
                  <SelectItem value="production">Produktion</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="hr">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Zurücksetzen
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleApply}>
              <Check className="h-4 w-4 mr-2" />
              Anwenden
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftFilterDialog;
