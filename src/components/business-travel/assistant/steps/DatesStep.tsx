
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarIcon } from "lucide-react";
import { AssistantStepData } from "@/types/business-travel";

interface DatesStepProps {
  data: AssistantStepData;
  updateData: (data: Partial<AssistantStepData>) => void;
}

const DatesStep: React.FC<DatesStepProps> = ({ data, updateData }) => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    data.start_date ? new Date(data.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    data.end_date ? new Date(data.end_date) : undefined
  );
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      updateData({ start_date: date.toISOString() });
      
      // Wenn das Enddatum vor dem Startdatum liegt, setze es auf das Startdatum
      if (endDate && endDate < date) {
        setEndDate(date);
        updateData({ end_date: date.toISOString() });
      }
    }
    setIsStartOpen(false);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setEndDate(date);
      updateData({ end_date: date.toISOString() });
    }
    setIsEndOpen(false);
  };

  const today = new Date();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Wann findet Ihre Reise statt?</h2>
        <p className="text-gray-600 mb-6">
          Bitte wählen Sie das Start- und Enddatum für Ihre Geschäftsreise.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start-date">Startdatum</Label>
          <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                id="start-date"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? (
                  format(startDate, 'PPP', { locale: de })
                ) : (
                  <span>Datum auswählen</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date: Date | undefined) => handleStartDateChange(date)}
                initialFocus
                locale={de}
                fromDate={today}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-date">Enddatum</Label>
          <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                id="end-date"
                disabled={!startDate}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? (
                  format(endDate, 'PPP', { locale: de })
                ) : (
                  <span>Datum auswählen</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date: Date | undefined) => handleEndDateChange(date)}
                initialFocus
                locale={de}
                fromDate={startDate || today}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {startDate && endDate && (
        <div className="p-4 bg-gray-50 rounded-md border">
          <p className="text-sm font-medium">Reisedauer:</p>
          <p className="text-lg font-semibold">
            {startDate && endDate
              ? format(startDate, 'dd. MMM', { locale: de }) + 
                ' - ' + 
                format(endDate, 'dd. MMM yyyy', { locale: de })
              : ''}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {startDate && endDate
              ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 
                ' Tage'
              : ''}
          </p>
        </div>
      )}

      <div className="bg-amber-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-amber-800 mb-2">Wichtige Information</h3>
        <p className="text-sm text-amber-700">
          Bitte beantragen Sie Ihre Dienstreise mindestens 7 Tage vor dem geplanten Reiseantritt, 
          bei internationalen Reisen mindestens 14 Tage vorher. Bei kurzfristigen Reisen wenden Sie sich bitte 
          an Ihren Vorgesetzten.
        </p>
      </div>
    </div>
  );
};

export default DatesStep;
