
import { TabsContent } from "@/components/ui/tabs";
import { GoalsTab } from "../profile/GoalsTab";
import { TrainingTab } from "../profile/TrainingTab";
import { ExpensesTab } from "../profile/ExpensesTab";
import CommunicationTab from "../profile/CommunicationTab";
import { RolesTab } from "../profile/RolesTab";
import { SustainabilityTab } from "../profile/SustainabilityTab";

// Wrapper-Komponenten für die verschiedenen Tabs
export const GoalsTabContent = ({ employeeId }: { employeeId: string }) => (
  <TabsContent value="goals" className="bg-white p-6 rounded-lg border shadow-sm">
    <GoalsTab employeeId={employeeId} />
  </TabsContent>
);

export const TrainingTabContent = ({ employeeId }: { employeeId: string }) => (
  <TabsContent value="training" className="bg-white p-6 rounded-lg border shadow-sm">
    <TrainingTab employeeId={employeeId} />
  </TabsContent>
);

export const ExpensesTabContent = ({ employeeId }: { employeeId: string }) => (
  <TabsContent value="expenses" className="bg-white p-6 rounded-lg border shadow-sm">
    <ExpensesTab employeeId={employeeId} />
  </TabsContent>
);

export const CommunicationTabContent = ({ employeeId }: { employeeId: string }) => (
  <TabsContent value="communication" className="bg-white p-6 rounded-lg border shadow-sm">
    <CommunicationTab employeeId={employeeId} />
  </TabsContent>
);

export const RolesTabContent = ({ employeeId }: { employeeId: string }) => (
  <TabsContent value="roles" className="bg-white p-6 rounded-lg border shadow-sm">
    <RolesTab employeeId={employeeId} />
  </TabsContent>
);

export const SustainabilityTabContent = ({ employeeId }: { employeeId: string }) => (
  <TabsContent value="sustainability" className="bg-white p-6 rounded-lg border shadow-sm">
    <SustainabilityTab employeeId={employeeId} />
  </TabsContent>
);
