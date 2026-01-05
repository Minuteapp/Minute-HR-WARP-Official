
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarClock, Plus, Trash, Edit } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface Holiday {
  id: string;
  name: string;
  date: Date;
  type: 'fixed' | 'variable';
  isNationwide: boolean;
  states?: string[];
}

const Holidays = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([
    {
      id: '1',
      name: 'Neujahr',
      date: new Date(new Date().getFullYear(), 0, 1),
      type: 'fixed',
      isNationwide: true
    },
    {
      id: '2',
      name: 'Tag der Arbeit',
      date: new Date(new Date().getFullYear(), 4, 1),
      type: 'fixed',
      isNationwide: true
    },
    {
      id: '3',
      name: 'Tag der Deutschen Einheit',
      date: new Date(new Date().getFullYear(), 9, 3),
      type: 'fixed',
      isNationwide: true
    },
    {
      id: '4',
      name: 'Fronleichnam',
      date: new Date(new Date().getFullYear(), 5, 8), // Beispieldatum
      type: 'variable',
      isNationwide: false,
      states: ['Baden-Württemberg', 'Bayern', 'Hessen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland']
    }
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [newHoliday, setNewHoliday] = useState<Omit<Holiday, 'id'>>({
    name: '',
    date: new Date(),
    type: 'fixed',
    isNationwide: true,
    states: []
  });
  
  const germanyStates = [
    'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 
    'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 
    'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen', 
    'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'
  ];

  const handleAddHoliday = () => {
    const id = Date.now().toString();
    setHolidays([...holidays, { id, ...newHoliday }]);
    setNewHoliday({
      name: '',
      date: new Date(),
      type: 'fixed',
      isNationwide: true,
      states: []
    });
    setShowAddDialog(false);
  };

  const handleEditHoliday = () => {
    if (selectedHoliday) {
      setHolidays(
        holidays.map(holiday => 
          holiday.id === selectedHoliday.id ? selectedHoliday : holiday
        )
      );
      setShowEditDialog(false);
      setSelectedHoliday(null);
    }
  };

  const handleDeleteHoliday = (id: string) => {
    setHolidays(holidays.filter(holiday => holiday.id !== id));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    }).format(date);
  };

  const handleStateToggle = (state: string, isAdding: boolean) => {
    if (isAdding) {
      // Für neue Feiertage
      if (newHoliday.states?.includes(state)) {
        setNewHoliday({
          ...newHoliday,
          states: newHoliday.states.filter(s => s !== state)
        });
      } else {
        setNewHoliday({
          ...newHoliday,
          states: [...(newHoliday.states || []), state]
        });
      }
    } else if (selectedHoliday) {
      // Für bestehende Feiertage
      if (selectedHoliday.states?.includes(state)) {
        setSelectedHoliday({
          ...selectedHoliday,
          states: selectedHoliday.states.filter(s => s !== state)
        });
      } else {
        setSelectedHoliday({
          ...selectedHoliday,
          states: [...(selectedHoliday.states || []), state]
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Feiertage</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Feiertag hinzufügen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarClock className="mr-2 h-5 w-5 text-blue-500" />
            Feiertage {new Date().getFullYear()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Gültigkeit</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holidays.map(holiday => (
                <TableRow key={holiday.id}>
                  <TableCell className="font-medium">{holiday.name}</TableCell>
                  <TableCell>{formatDate(holiday.date)}</TableCell>
                  <TableCell>
                    {holiday.type === 'fixed' ? 'Festes Datum' : 'Variables Datum'}
                  </TableCell>
                  <TableCell>
                    {holiday.isNationwide 
                      ? 'Bundesweit' 
                      : holiday.states && holiday.states.length > 0 
                        ? `${holiday.states.length} Bundesländer` 
                        : 'Keine Angabe'
                    }
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedHoliday(holiday);
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteHoliday(holiday.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog zum Hinzufügen eines Feiertags */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Neuen Feiertag hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name des Feiertags</Label>
                <Input
                  id="name"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                  placeholder="z.B. Neujahr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Typ</Label>
                <Select 
                  value={newHoliday.type} 
                  onValueChange={(value: 'fixed' | 'variable') => setNewHoliday({...newHoliday, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Typ wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Festes Datum</SelectItem>
                    <SelectItem value="variable">Variables Datum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum</Label>
                <Calendar
                  mode="single"
                  selected={newHoliday.date}
                  onSelect={(date) => date && setNewHoliday({...newHoliday, date})}
                  className="border rounded-md p-3"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-4">
                  <Switch 
                    id="isNationwide" 
                    checked={newHoliday.isNationwide}
                    onCheckedChange={(checked) => setNewHoliday({
                      ...newHoliday, 
                      isNationwide: checked,
                      states: checked ? [] : newHoliday.states
                    })}
                  />
                  <Label htmlFor="isNationwide">Bundesweiter Feiertag</Label>
                </div>
                
                {!newHoliday.isNationwide && (
                  <div className="space-y-2">
                    <Label>Gültigkeit in Bundesländern</Label>
                    <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                      {germanyStates.map(state => (
                        <div key={state} className="flex items-center space-x-2 mb-2">
                          <input 
                            type="checkbox" 
                            id={`state-${state}`} 
                            checked={newHoliday.states?.includes(state) || false}
                            onChange={() => handleStateToggle(state, true)}
                            className="rounded"
                          />
                          <label htmlFor={`state-${state}`} className="text-sm">{state}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Abbrechen</Button>
            <Button onClick={handleAddHoliday}>Hinzufügen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog zum Bearbeiten eines Feiertags */}
      {selectedHoliday && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Feiertag bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name des Feiertags</Label>
                  <Input
                    id="edit-name"
                    value={selectedHoliday.name}
                    onChange={(e) => setSelectedHoliday({...selectedHoliday, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Typ</Label>
                  <Select 
                    value={selectedHoliday.type} 
                    onValueChange={(value: 'fixed' | 'variable') => setSelectedHoliday({...selectedHoliday, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Typ wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Festes Datum</SelectItem>
                      <SelectItem value="variable">Variables Datum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Datum</Label>
                  <Calendar
                    mode="single"
                    selected={selectedHoliday.date}
                    onSelect={(date) => date && setSelectedHoliday({...selectedHoliday, date})}
                    className="border rounded-md p-3"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch 
                      id="edit-isNationwide" 
                      checked={selectedHoliday.isNationwide}
                      onCheckedChange={(checked) => setSelectedHoliday({
                        ...selectedHoliday, 
                        isNationwide: checked,
                        states: checked ? [] : selectedHoliday.states
                      })}
                    />
                    <Label htmlFor="edit-isNationwide">Bundesweiter Feiertag</Label>
                  </div>
                  
                  {!selectedHoliday.isNationwide && (
                    <div className="space-y-2">
                      <Label>Gültigkeit in Bundesländern</Label>
                      <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                        {germanyStates.map(state => (
                          <div key={state} className="flex items-center space-x-2 mb-2">
                            <input 
                              type="checkbox" 
                              id={`edit-state-${state}`} 
                              checked={selectedHoliday.states?.includes(state) || false}
                              onChange={() => handleStateToggle(state, false)}
                              className="rounded"
                            />
                            <label htmlFor={`edit-state-${state}`} className="text-sm">{state}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Abbrechen</Button>
              <Button onClick={handleEditHoliday}>Speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Holidays;
