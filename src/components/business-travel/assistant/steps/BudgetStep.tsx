
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssistantStepData } from "@/types/business-travel";
import { Banknote } from "lucide-react"; 

interface BudgetStepProps {
  data: AssistantStepData;
  updateData: (data: Partial<AssistantStepData>) => void;
}

const BudgetStep: React.FC<BudgetStepProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Budgetinformationen</h2>
        <p className="text-gray-600 mb-6">
          Bitte geben Sie die Budgetinformationen für diese Reise an.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cost-center">Kostenstelle</Label>
          <Input
            type="text"
            id="cost-center"
            placeholder="Kostenstelle eingeben"
            value={data.cost_center || ''}
            onChange={(e) => updateData({ cost_center: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="project-id">Projekt ID</Label>
          <Input
            type="text"
            id="project-id"
            placeholder="Projekt ID eingeben"
            value={data.project_id || ''}
            onChange={(e) => updateData({ project_id: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="budget-id">Budget auswählen</Label>
        <Select onValueChange={(value) => updateData({ budget_id: value })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Budget auswählen" defaultValue={data.budget_id} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="budget1">Marketing Budget</SelectItem>
            <SelectItem value="budget2">Sales Budget</SelectItem>
            <SelectItem value="budget3">Development Budget</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Hinweis</h3>
        <p className="text-sm text-blue-700">
          Die Angabe von Budget, Kostenstelle und Projekt ID hilft uns, die Reisekosten korrekt zu verbuchen.
        </p>
      </div>
    </div>
  );
};

export default BudgetStep;
