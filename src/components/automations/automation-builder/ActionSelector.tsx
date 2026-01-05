
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Settings } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AutomationTrigger, AutomationAction, AutomationCondition } from "@/types/automations";

// Beispieldaten für Aktionstypen
const mockActionTypes = [
  {
    id: "send_email",
    name: "E-Mail senden",
    category: "communication",
    options: ["recipient", "subject", "body"],
    description: "Sendet eine E-Mail an einen oder mehrere Empfänger"
  },
  {
    id: "send_notification",
    name: "Benachrichtigung senden",
    category: "communication",
    options: ["recipient", "message"],
    description: "Sendet eine Push-Benachrichtigung"
  },
  {
    id: "create_task",
    name: "Aufgabe erstellen",
    category: "tasks",
    options: ["title", "description", "assignee", "due_date"],
    description: "Erstellt eine neue Aufgabe im System"
  },
  {
    id: "update_status",
    name: "Status aktualisieren",
    category: "projects",
    options: ["entity_id", "status"],
    description: "Aktualisiert den Status eines Elements"
  },
  {
    id: "document_assign",
    name: "Dokument zuweisen",
    category: "documents",
    options: ["document_id", "user_id"],
    description: "Weist ein Dokument einem Benutzer zu"
  }
];

export interface ActionSelectorProps {
  onAddAction: (action: AutomationAction) => void;
  onRemoveAction: (index: number) => void;
  actions?: AutomationAction[]; 
  trigger?: AutomationTrigger;
  conditions?: AutomationCondition[];
}

const ActionSelector = ({ onAddAction, onRemoveAction, actions = [], trigger, conditions }: ActionSelectorProps) => {
  const [selectedActionType, setSelectedActionType] = useState<string>("");
  const [actionParams, setActionParams] = useState<Record<string, string>>({});

  const handleAddAction = () => {
    if (!selectedActionType) return;
    
    const actionType = mockActionTypes.find((type) => type.id === selectedActionType);
    
    if (actionType) {
      const newAction: AutomationAction = {
        id: `action_${Date.now()}`,
        type: selectedActionType,
        name: actionType.name,
        params: actionParams
      };
      
      onAddAction(newAction);
      
      // Reset the form
      setSelectedActionType("");
      setActionParams({});
    }
  };

  const getActionParams = (actionId: string) => {
    const actionType = mockActionTypes.find((type) => type.id === actionId);
    if (!actionType) return [];
    
    return actionType.options;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Aktionen hinzufügen</CardTitle>
          <CardDescription>
            Was soll passieren, wenn die Bedingungen erfüllt sind?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={selectedActionType} onValueChange={setSelectedActionType}>
              <SelectTrigger>
                <SelectValue placeholder="Aktionstyp auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Kommunikation</SelectLabel>
                  {mockActionTypes
                    .filter((type) => type.category === "communication")
                    .map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Aufgaben & Projekte</SelectLabel>
                  {mockActionTypes
                    .filter((type) => type.category === "tasks" || type.category === "projects")
                    .map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Dokumente</SelectLabel>
                  {mockActionTypes
                    .filter((type) => type.category === "documents")
                    .map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {selectedActionType && (
              <div className="space-y-3 border rounded-md p-3 bg-gray-50">
                <h4 className="text-sm font-medium">Aktionsparameter:</h4>
                {getActionParams(selectedActionType).map((param) => (
                  <div key={param} className="grid gap-1.5">
                    <label htmlFor={param} className="text-sm font-medium capitalize">
                      {param.replace("_", " ")}
                    </label>
                    <Input
                      id={param}
                      value={actionParams[param] || ""}
                      onChange={(e) => 
                        setActionParams({
                          ...actionParams,
                          [param]: e.target.value,
                        })
                      }
                      placeholder={`Geben Sie ${param.replace("_", " ")} ein`}
                    />
                  </div>
                ))}

                <Button 
                  onClick={handleAddAction} 
                  className="w-full mt-2"
                  disabled={!selectedActionType}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Aktion hinzufügen
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {actions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Aktionen ({actions.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[250px]">
              <div className="p-4 space-y-3">
                {actions.map((action, index) => (
                  <div
                    key={action.id}
                    className="flex items-start justify-between border rounded-md p-3 hover:bg-gray-50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{action.name}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {Object.entries(action.params).map(([key, value]) => (
                          <div key={key} className="flex gap-1 items-center">
                            <span className="text-xs font-medium capitalize">{key.replace("_", " ")}:</span>
                            <span className="text-xs">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onRemoveAction(index)}
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActionSelector;
