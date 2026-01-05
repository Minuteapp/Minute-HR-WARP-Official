
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmployeeInfoSectionProps {
  register: any;
}

const EmployeeInfoSection = ({ register }: EmployeeInfoSectionProps) => {
  return (
    <div className="col-span-2 space-y-4">
      <h3 className="text-lg font-medium">Mitarbeiter-Informationen</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="employee_name">Name</Label>
          <Input
            id="employee_name"
            {...register("employee_name")}
            placeholder="Vollständiger Name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Abteilung</Label>
          <Input
            id="department"
            {...register("department")}
            placeholder="z.B. Vertrieb, IT, Marketing"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supervisor">Vorgesetzter</Label>
          <Input
            id="supervisor"
            {...register("supervisor")}
            placeholder="Name des Vorgesetzten"
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeInfoSection;
