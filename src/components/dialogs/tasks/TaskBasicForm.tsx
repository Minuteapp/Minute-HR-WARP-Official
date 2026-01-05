
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";

interface TaskBasicFormProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  priority: "low" | "medium" | "high";
  setPriority: (priority: "low" | "medium" | "high") => void;
  dueDate: string;
  setDueDate: (date: string) => void;
}

export const TaskBasicForm = ({
  title,
  setTitle,
  description,
  setDescription,
  priority,
  setPriority,
  dueDate,
  setDueDate
}: TaskBasicFormProps) => {
  const priorityOptions = [
    { value: "low", label: "Niedrig", color: "bg-green-100 text-green-800 border-green-300 hover:bg-green-200" },
    { value: "medium", label: "Mittel", color: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200" },
    { value: "high", label: "Hoch", color: "bg-red-100 text-red-800 border-red-300 hover:bg-red-200" }
  ];

  const handleDateChange = (date?: Date) => {
    if (date) {
      setDueDate(date.toISOString().split('T')[0]);
    } else {
      setDueDate('');
    }
  };

  return (
    <div className="space-y-6 p-1">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium text-gray-700">
          Titel <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Aufgabentitel eingeben..."
          className="border-gray-300 focus:border-[#9b87f5] focus:ring-[#9b87f5]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-gray-700">Beschreibung</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Beschreibung der Aufgabe..."
          rows={3}
          className="border-gray-300 focus:border-[#9b87f5] focus:ring-[#9b87f5]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Priorität</Label>
          <div className="grid grid-cols-3 gap-2">
            {priorityOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={priority === option.value ? "default" : "outline"}
                onClick={() => setPriority(option.value as "low" | "medium" | "high")}
                className={cn(
                  "text-sm transition-all duration-200",
                  priority === option.value 
                    ? option.color 
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                )}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Fälligkeitsdatum</Label>
          <DatePicker
            date={dueDate ? new Date(dueDate) : undefined}
            onChange={handleDateChange}
            placeholder="Datum wählen"
            className="w-full border-gray-300 focus:border-[#9b87f5] focus:ring-[#9b87f5]"
          />
        </div>
      </div>
    </div>
  );
};
