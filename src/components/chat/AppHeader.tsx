import { Bell, Settings, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppHeaderProps {
  isMobile?: boolean;
}

export function AppHeader({ isMobile = false }: AppHeaderProps) {
  return (
    <div className={`bg-white border-b border-border ${isMobile ? 'p-3' : 'p-4'} flex items-center justify-between`}>
      {/* Left: Logo/Menu */}
      <div className="flex items-center space-x-4">
        {isMobile && (
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Center: Search (Desktop only) */}
      {!isMobile && (
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Suche in allen Chats..." 
              className="pl-10 bg-muted/50 border-border"
            />
          </div>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Settings className="h-5 w-5" />
        </Button>
        
        <Avatar className="w-8 h-8">
          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}