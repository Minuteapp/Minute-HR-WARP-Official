
import { useState } from "react";
import { ProjectFormStep } from "./types";

export const useProjectFormTabs = () => {
  const [activeTab, setActiveTab] = useState<ProjectFormStep>('basic-info');

  return {
    activeTab,
    setActiveTab
  };
};
