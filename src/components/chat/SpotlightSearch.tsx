
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Search, MessageSquare, Users, User, Bell, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const searchCategories = [
  { name: "Chats", icon: MessageSquare },
  { name: "Teams", icon: Users },
  { name: "Benutzer", icon: User },
  { name: "Benachrichtigungen", icon: Bell },
  { name: "Termine", icon: Calendar },
];

// Suchergebnisse aus der Datenbank laden
const searchResults = [];

const SpotlightSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Chats');
  const { toast } = useToast();

  const filteredResults = searchTerm.trim() === '' 
    ? searchResults
    : searchResults.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.type === 'chat' && item.lastMessage && item.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.type === 'user' && item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.type === 'notification' && item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  const handleSelectResult = (result: typeof searchResults[0]) => {
    toast({
      title: `${result.name} ausgewählt`,
      description: `Sie haben einen ${result.type === 'chat' ? 'Chat' : result.type === 'user' ? 'Benutzer' : 'Benachrichtigung'} ausgewählt.`
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 shadow hover:shadow-md transition-shadow">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Suchen</span>
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-xs bg-muted rounded">⌘K</kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="sr-only">Suche</DialogTitle>
          <Input
            placeholder="Suchen nach Chats, Personen, Nachrichten..."
            className="border-0 shadow-none text-lg focus-visible:ring-0 focus-visible:ring-offset-0 pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <Search className="h-5 w-5 text-muted-foreground absolute top-[1.8rem] left-5" />
        </DialogHeader>
        
        <div className="border-t mt-4">
          <div className="flex overflow-x-auto py-2 px-1 border-b">
            {searchCategories.map((category) => (
              <Button
                key={category.name}
                variant={activeCategory === category.name ? "secondary" : "ghost"}
                className="rounded-full text-sm"
                size="sm"
                onClick={() => setActiveCategory(category.name)}
              >
                <category.icon className="h-4 w-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>
          
          <div className="max-h-[300px] overflow-y-auto p-2">
            {filteredResults.length > 0 ? (
              <div className="space-y-1">
                {filteredResults.map((result, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center p-2 rounded-md hover:bg-muted transition-colors text-left"
                    onClick={() => handleSelectResult(result)}
                  >
                    <Avatar className="h-9 w-9 mr-3">
                      <div className={`${
                        result.type === 'chat' ? 'bg-blue-500/60' : 
                        result.type === 'user' ? 'bg-primary/60' : 'bg-yellow-500/60'
                      } h-full w-full flex items-center justify-center text-white font-medium`}>
                        {result.name.charAt(0)}
                      </div>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="font-medium">{result.name}</p>
                        {result.type === 'user' && result.online && (
                          <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {result.type === 'chat' && result.lastMessage}
                        {result.type === 'user' && result.title}
                        {result.type === 'notification' && result.content}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Keine Ergebnisse für "{searchTerm}" gefunden
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpotlightSearch;
