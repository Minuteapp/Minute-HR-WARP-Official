import { cn } from "@/lib/utils";

interface MobileChatTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { key: "chats", label: "Chats" },
  { key: "channels", label: "Kanäle" },
  { key: "dms", label: "DMs" },
  { key: "mentions", label: "Erwähnungen" },
  { key: "dateien", label: "Dateien" },
  { key: "anrufe", label: "Anrufe" },
];

export default function MobileChatTabs({
  activeTab,
  onTabChange,
}: MobileChatTabsProps) {
  return (
    <div className="flex gap-4 overflow-x-auto px-4 border-b scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "pb-3 pt-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
            activeTab === tab.key
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
