
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const CalendarHolidaySettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Feiertagseinstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Feiertage und arbeitsfreie Tage verwalten.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarHolidaySettings;
