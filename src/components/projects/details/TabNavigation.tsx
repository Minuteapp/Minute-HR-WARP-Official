
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export const TabNavigation = () => {
  return (
    <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-white border p-1 shadow-sm mb-3 overflow-x-auto w-full">
      <TabsTrigger 
        value="overview"
        className="rounded-md px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-white"
      >
        Übersicht
      </TabsTrigger>
      <TabsTrigger 
        value="tasks"
        className="rounded-md px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-white"
      >
        Aufgaben
      </TabsTrigger>
      <TabsTrigger 
        value="team"
        className="rounded-md px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-white"
      >
        Team
      </TabsTrigger>
      <TabsTrigger 
        value="files"
        className="rounded-md px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-white"
      >
        Dateien
      </TabsTrigger>
    </TabsList>
  );
};
