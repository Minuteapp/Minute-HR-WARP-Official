import { OverviewTab } from "../profile/OverviewTab";

export const OverviewTabContent = ({ employeeId }: { employeeId: string }) => (
  <div className="space-y-6">
    <OverviewTab employeeId={employeeId} />
  </div>
);
