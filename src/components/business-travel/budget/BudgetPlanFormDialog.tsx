
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useBusinessTravel } from "@/hooks/useBusinessTravel";
import { BudgetPlan } from "@/types/business-travel";
import { Loader2, Save } from "lucide-react";

interface BudgetPlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingBudget?: BudgetPlan;
}

const BudgetPlanFormDialog: React.FC<BudgetPlanFormDialogProps> = ({ 
  open, 
  onOpenChange,
  existingBudget
}) => {
  const { createBudgetPlan, isSubmitting } = useBusinessTravel();
  const [budgetType, setBudgetType] = useState(existingBudget?.type || 'department');

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<BudgetPlan>({
    defaultValues: existingBudget || {
      name: '',
      type: 'department',
      assigned_to: '',
      assigned_to_name: '',
      amount: 0,
      currency: 'EUR',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
      status: 'active',
      used_amount: 0,
      reserved_amount: 0,
      remaining_amount: 0
    }
  });

  const onSubmit = async (data: BudgetPlan) => {
    try {
      // Remove fields that are calculated in the service
      const { remaining_amount, used_amount, reserved_amount, ...budgetData } = data;
      
      await createBudgetPlan(budgetData);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating budget plan:', error);
    }
  };

  const handleTypeChange = (value: string) => {
    setBudgetType(value as 'department' | 'project' | 'team' | 'cost_center');
    setValue('type', value as 'department' | 'project' | 'team' | 'cost_center');
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) reset();
      onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {existingBudget ? 'Budget bearbeiten' : 'Neues Budget erstellen'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Budgetname</Label>
              <Input 
                id="name" 
                placeholder="z.B. Marketing Reisebudget Q2 2023"
                {...register("name", { required: "Budgetname ist erforderlich" })}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Typ</Label>
                <Select 
                  defaultValue={budgetType} 
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Typ auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="department">Abteilung</SelectItem>
                    <SelectItem value="project">Projekt</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="cost_center">Kostenstelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignedTo">
                  {budgetType === 'department' && 'Abteilung'}
                  {budgetType === 'project' && 'Projekt'}
                  {budgetType === 'team' && 'Team'}
                  {budgetType === 'cost_center' && 'Kostenstelle'}
                </Label>
                <Input 
                  id="assignedToName"
                  placeholder={
                    budgetType === 'department' ? 'z.B. Marketing' : 
                    budgetType === 'project' ? 'z.B. Produkteinführung' :
                    budgetType === 'team' ? 'z.B. Frontend-Team' :
                    'z.B. CC-1001'
                  }
                  {...register("assigned_to_name", { required: "Dieses Feld ist erforderlich" })}
                  onChange={(e) => {
                    setValue("assigned_to_name", e.target.value);
                    setValue("assigned_to", `${budgetType}-${Math.random().toString(36).substring(2, 10)}`);
                  }}
                />
                {errors.assigned_to_name && <p className="text-sm text-red-500">{errors.assigned_to_name.message}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Budgetbetrag</Label>
                <Input 
                  id="amount" 
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("amount", { 
                    required: "Budgetbetrag ist erforderlich",
                    valueAsNumber: true,
                    min: { value: 0, message: "Betrag muss positiv sein" }
                  })}
                />
                {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Währung</Label>
                <Select 
                  defaultValue="EUR" 
                  onValueChange={(value) => setValue("currency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Währung auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="USD">US-Dollar (USD)</SelectItem>
                    <SelectItem value="GBP">Britisches Pfund (GBP)</SelectItem>
                    <SelectItem value="CHF">Schweizer Franken (CHF)</SelectItem>
                    <SelectItem value="JPY">Japanischer Yen (JPY)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Startdatum</Label>
                <Input 
                  id="start_date" 
                  type="date"
                  {...register("start_date", { required: "Startdatum ist erforderlich" })}
                />
                {errors.start_date && <p className="text-sm text-red-500">{errors.start_date.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_date">Enddatum</Label>
                <Input 
                  id="end_date" 
                  type="date"
                  {...register("end_date", { required: "Enddatum ist erforderlich" })}
                />
                {errors.end_date && <p className="text-sm text-red-500">{errors.end_date.message}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                defaultValue="active" 
                onValueChange={(value) => setValue("status", value as 'active' | 'closed' | 'draft')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="draft">Entwurf</SelectItem>
                  <SelectItem value="closed">Abgeschlossen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Budget speichern
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetPlanFormDialog;
