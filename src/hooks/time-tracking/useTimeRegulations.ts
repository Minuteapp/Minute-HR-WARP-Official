
import { useToast } from "@/hooks/use-toast";

export const useTimeRegulations = () => {
  const { toast } = useToast();

  const sendRestPeriodReminder = () => {
    // Einfache Ruhezeiterinnerung nach Arbeitsende
    toast({
      title: "Ruhezeit beachten",
      description: "Denken Sie an ausreichende Ruhepausen zwischen den Arbeitstagen.",
    });
  };

  return {
    sendRestPeriodReminder
  };
};
