
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, MessageSquare, AlertTriangle, CheckCircle, XCircle, UserPlus, Edit, Trash2, Copy } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Employee } from '@/types/shift-planning';
import { Separator } from "@/components/ui/separator";

interface ShiftDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shift: any;
  employee?: Employee | undefined;
  onShiftUpdated?: () => Promise<void>;
}

const ShiftDetailDialog = ({ isOpen, onOpenChange, shift, employee, onShiftUpdated }: ShiftDetailDialogProps) => {
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [sendNotification, setSendNotification] = useState(true);
  const [selectedTab, setSelectedTab] = useState("details");
  
  const handleCommentSubmit = () => {
    if (!comment.trim()) return;
    
    toast({
      title: "Kommentar hinzugefügt",
      description: "Ihr Kommentar wurde erfolgreich hinzugefügt."
    });
    
    setComment("");
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Bestätigt</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Geplant</Badge>;
      case 'conflict':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Konflikt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Null-Check für shift
  if (!shift) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">{/* Größerer Dialog */}
        <DialogHeader>
          <DialogTitle>Schichtdetails</DialogTitle>
          <DialogDescription>
            Details und Aktionen für die ausgewählte Schicht
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Kommentare</TabsTrigger>
            <TabsTrigger value="history">Verlauf</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Schichttyp</Label>
                <div className="text-sm font-medium mt-1">
                  {shift?.type === 'early' ? 'Frühschicht' : 
                   shift?.type === 'late' ? 'Spätschicht' : 
                   shift?.type === 'night' ? 'Nachtschicht' : 'Schicht'}
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <div className="mt-1">
                  {getStatusBadge(shift?.status || 'unknown')}
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Datum</Label>
                <div className="text-sm font-medium mt-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {shift?.date ? format(new Date(shift.date), 'EEEE, d. MMMM yyyy', { locale: de }) : 'Kein Datum'}
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Uhrzeit</Label>
                <div className="text-sm font-medium mt-1 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  {shift?.start_time && shift?.end_time 
                    ? `${format(new Date(shift.start_time), 'HH:mm')} - ${format(new Date(shift.end_time), 'HH:mm')} Uhr`
                    : 'Keine Zeit angegeben'
                  }
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-sm text-muted-foreground">Zugewiesener Mitarbeiter</Label>
              {employee ? (
                <div className="flex items-center gap-3 mt-2">
                  <Avatar>
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}`} />
                    <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-xs text-muted-foreground">{employee.department}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-2 p-3 border rounded-md bg-muted/20">
                  <span className="text-muted-foreground">Kein Mitarbeiter zugewiesen</span>
                  <Button size="sm" variant="secondary">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Zuweisen
                  </Button>
                </div>
              )}
            </div>
            
            <Separator />
            
            {shift?.requirements && shift.requirements.length > 0 && (
              <div>
                <Label className="text-sm text-muted-foreground">Anforderungen</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {shift.requirements.map((req: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {shift?.notes && (
              <div>
                <Label className="text-sm text-muted-foreground">Notizen</Label>
                <div className="p-3 border rounded-md bg-muted/10 text-sm mt-2">
                  {shift.notes}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="comments" className="space-y-4">
            <div className="space-y-4">
              <div className="max-h-[200px] overflow-y-auto space-y-3">
                <div className="p-3 border rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">Admin</span>
                    <span className="text-xs text-muted-foreground">vor 2 Stunden</span>
                  </div>
                  <p className="text-sm">Schicht wurde erfolgreich eingeplant.</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Textarea 
                  placeholder="Kommentar hinzufügen..." 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="notify" 
                      checked={sendNotification}
                      onCheckedChange={setSendNotification}
                    />
                    <Label htmlFor="notify" className="text-sm">Benachrichtigung senden</Label>
                  </div>
                  <Button size="sm" onClick={handleCommentSubmit} disabled={!comment.trim()}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Senden
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-green-100 p-1 rounded-full text-green-600">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Schicht erstellt</p>
                  <p className="text-xs text-muted-foreground">Heute, 09:15 Uhr</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-blue-100 p-1 rounded-full text-blue-600">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Mitarbeiter zugewiesen</p>
                  <p className="text-xs text-muted-foreground">Heute, 09:20 Uhr</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex gap-2 w-full justify-start">
            <Button variant="outline" size="sm" className="h-9">
              <Copy className="h-4 w-4 mr-2" />
              Duplizieren
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
            <Button variant="outline" size="sm" className="h-9 text-red-600 hover:text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Löschen
            </Button>
          </div>
          
          <div className="flex gap-2">
            {shift?.status !== 'confirmed' && (
              <Button variant="default" size="sm" className="h-9">
                <CheckCircle className="h-4 w-4 mr-2" />
                Bestätigen
              </Button>
            )}
            {shift?.status === 'conflict' && (
              <Button variant="destructive" size="sm" className="h-9">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Konflikt lösen
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-9" onClick={() => onOpenChange(false)}>
              Schließen
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftDetailDialog;
