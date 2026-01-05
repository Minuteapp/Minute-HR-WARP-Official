
import { Label } from "@/components/ui/label";

interface EventColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const EventColorPicker = ({ selectedColor, onColorChange }: EventColorPickerProps) => {
  const colors = [
    { id: "blue", label: "Blau", bg: "bg-blue-500", border: "border-blue-300" },
    { id: "purple", label: "Lila", bg: "bg-purple-500", border: "border-purple-300" },
    { id: "pink", label: "Rosa", bg: "bg-pink-500", border: "border-pink-300" },
    { id: "orange", label: "Orange", bg: "bg-orange-500", border: "border-orange-300" },
    { id: "yellow", label: "Gelb", bg: "bg-yellow-500", border: "border-yellow-300" },
    { id: "green", label: "Grün", bg: "bg-green-500", border: "border-green-300" },
    { id: "red", label: "Rot", bg: "bg-red-500", border: "border-red-300" },
    { id: "indigo", label: "Indigo", bg: "bg-indigo-500", border: "border-indigo-300" },
  ];

  return (
    <div>
      <Label htmlFor="event-color">Farbkategorie</Label>
      <div className="mt-1">
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <button
              key={color.id}
              type="button"
              className={`h-10 rounded-md border ${color.bg} ${color.border} transition-all ${
                selectedColor === color.id
                  ? "ring-2 ring-offset-2 ring-primary"
                  : "hover:scale-105"
              }`}
              title={color.label}
              onClick={() => onColorChange(color.id)}
              aria-label={`Farbe: ${color.label}`}
            />
          ))}
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Wählen Sie eine Farbe für den Termin
        </div>
      </div>
    </div>
  );
};

export default EventColorPicker;
