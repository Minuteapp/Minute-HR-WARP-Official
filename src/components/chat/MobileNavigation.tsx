import { MessageSquare, Users, Info, Phone, Video, Hash, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavigationProps {
  activeTab: 'direct' | 'groups' | 'public' | 'mentions';
  onTabChange: (tab: 'direct' | 'groups' | 'public' | 'mentions') => void;
  onOpenContacts: () => void;
  unreadCount: number;
}

export function MobileNavigation({ 
  activeTab,
  onTabChange,
  onOpenContacts,
  unreadCount
}: MobileNavigationProps) {
  return (
    <div className="bg-card border-t border-border px-4 py-2 flex items-center justify-around mobile-safe-area">
      <Button 
        variant={activeTab === 'direct' ? 'default' : 'ghost'}
        size="sm" 
        onClick={() => onTabChange('direct')}
        className="flex flex-col items-center space-y-1 h-auto py-2 min-h-[44px] relative"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="text-xs">Chats</span>
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </Button>

      <Button 
        variant={activeTab === 'groups' ? 'default' : 'ghost'}
        size="sm" 
        onClick={() => onTabChange('groups')}
        className="flex flex-col items-center space-y-1 h-auto py-2 min-h-[44px]"
      >
        <Hash className="w-4 h-4" />
        <span className="text-xs">Kanäle</span>
      </Button>

      <Button 
        variant={activeTab === 'public' ? 'default' : 'ghost'}
        size="sm" 
        onClick={() => onTabChange('public')}
        className="flex flex-col items-center space-y-1 h-auto py-2 min-h-[44px]"
      >
        <Users className="w-4 h-4" />
        <span className="text-xs">DMs</span>
      </Button>

      <Button 
        variant={activeTab === 'mentions' ? 'default' : 'ghost'}
        size="sm" 
        onClick={() => onTabChange('mentions')}
        className="flex flex-col items-center space-y-1 h-auto py-2 min-h-[44px]"
      >
        <AtSign className="w-4 h-4" />
        <span className="text-xs">Erwähnungen</span>
      </Button>
    </div>
  );
}