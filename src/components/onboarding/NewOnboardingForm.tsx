
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEmployeeData } from "@/hooks/useEmployeeData";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { User, UserPlus } from 'lucide-react';

interface OnboardingFormData {
  employeeId: string;
  templateId: string;
  mentorId: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

const NewOnboardingForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>({
    employeeId: '',
    templateId: '',
    mentorId: '',
    startDate: new Date(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('onboarding_processes')
        .insert({
          employee_id: formData.employeeId,
          template_id: formData.templateId,
          mentor_id: formData.mentorId,
          start_date: formData.startDate.toISOString(),
          end_date: formData.endDate?.toISOString(),
          notes: formData.notes,
          status: 'active'
        });

      if (error) throw error;

      toast.success("Onboarding-Prozess erfolgreich erstellt");
      navigate('/onboarding/active');
    } catch (error) {
      console.error('Error creating onboarding process:', error);
      toast.error("Fehler beim Erstellen des Onboarding-Prozesses");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Neues Onboarding erstellen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Mitarbeiter*in</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mitarbeiter*in auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {/* ZERO-DATA: Mitarbeiter aus DB laden */}
                  <SelectItem value="placeholder" disabled>Mitarbeiter aus Datenbank laden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateId">Onboarding-Vorlage</Label>
              <Select
                value={formData.templateId}
                onValueChange={(value) => setFormData({ ...formData, templateId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vorlage auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Standard Onboarding</SelectItem>
                  <SelectItem value="2">IT Onboarding</SelectItem>
                  <SelectItem value="3">Management Onboarding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mentorId">Mentor*in</Label>
              <Select
                value={formData.mentorId}
                onValueChange={(value) => setFormData({ ...formData, mentorId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mentor*in auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {/* ZERO-DATA: Mentoren aus DB laden */}
                  <SelectItem value="placeholder" disabled>Mentor aus Datenbank laden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Startdatum</Label>
              <DatePicker
                date={formData.startDate}
                onChange={(date) => date && setFormData({ ...formData, startDate: date })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Enddatum (optional)</Label>
              <DatePicker
                date={formData.endDate}
                onChange={(date) => setFormData({ ...formData, endDate: date })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Zusätzliche Informationen zum Onboarding-Prozess"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/onboarding')}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Wird erstellt..." : "Onboarding erstellen"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default NewOnboardingForm;
