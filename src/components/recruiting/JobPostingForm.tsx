
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface JobPostingFormProps {
  onSuccess?: () => void;
}

const JobPostingForm = ({ onSuccess }: JobPostingFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "",
    description: "",
    requirements: "",
    salary: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Hier würde normalerweise der Datei-Upload zur API erfolgen
    console.log("Form submitted:", formData);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Neue Stelle erstellen</h2>
        <p className="text-sm text-muted-foreground">
          Füllen Sie die Details für die neue Stellenanzeige aus.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Stellentitel</label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="z.B. Senior Frontend Developer"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Abteilung</label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleSelectChange("department", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Abteilung auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Standort</label>
          <Select
            value={formData.location}
            onValueChange={(value) => handleSelectChange("location", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Standort auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="berlin">Berlin</SelectItem>
              <SelectItem value="hamburg">Hamburg</SelectItem>
              <SelectItem value="munich">München</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Beschäftigungsart</label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleSelectChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Art auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fulltime">Vollzeit</SelectItem>
              <SelectItem value="parttime">Teilzeit</SelectItem>
              <SelectItem value="freelance">Freiberuflich</SelectItem>
              <SelectItem value="internship">Praktikum</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Stellenbeschreibung</label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Beschreiben Sie die Rolle und Verantwortlichkeiten"
            rows={4}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Anforderungen</label>
          <Textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="Listen Sie die erforderlichen Qualifikationen und Fähigkeiten auf"
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Gehaltsspanne</label>
          <Input
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            placeholder="z.B. 60.000 - 80.000 €"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          Abbrechen
        </Button>
        <Button type="submit">Stelle veröffentlichen</Button>
      </div>
    </form>
  );
};

export default JobPostingForm;
