
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNewEmployeeInvitation } from '@/hooks/useNewEmployeeInvitation';
import { NewEmployeeFormData, MentorOption } from '@/types/onboarding.types';
import { supabase } from '@/integrations/supabase/client';

export const NewEmployeeForm = ({ onCancel }: { onCancel: () => void }) => {
  const [formData, setFormData] = useState<NewEmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    department: '',
    startDate: new Date().toISOString().split('T')[0],
    role: 'employee'
  });
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const { createEmployeeWithOnboarding, isSubmitting } = useNewEmployeeInvitation();

  useEffect(() => {
    // Mentoren-Liste laden
    const fetchMentors = async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, position, department')
        .eq('status', 'active')
        .order('name');

      if (!error && data) {
        setMentors(data);
      }
    };

    fetchMentors();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmployeeWithOnboarding(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Neuen Mitarbeiter einladen</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Abteilung</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Startdatum</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rolle</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rolle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Mitarbeiter</SelectItem>
                  <SelectItem value="manager">Vorgesetzter</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mentorId">Mentor (optional)</Label>
            <Select
              value={formData.mentorId || ''}
              onValueChange={(value) => handleSelectChange('mentorId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Mentor auswählen (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_mentor">Keinen Mentor zuweisen</SelectItem>
                {mentors.map((mentor) => (
                  <SelectItem key={mentor.id} value={mentor.id}>
                    {mentor.name} {mentor.position ? `(${mentor.position})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Wird erstellt..." : "Mitarbeiter einladen"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
