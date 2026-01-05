
import { useState } from 'react';
import { SupportedLanguage } from '@/services/translationService';
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Languages, Check } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: string;
  languages: SupportedLanguage[];
  onSelect: (language: string) => void;
}

const LanguageSelector = ({ currentLanguage, languages, onSelect }: LanguageSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <Command className="rounded-lg border">
        <CommandInput 
          placeholder="Sprache suchen..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>Keine Sprache gefunden.</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-[300px]">
              {filteredLanguages.map(language => (
                <CommandItem
                  key={language.code}
                  value={language.code}
                  onSelect={() => onSelect(language.code)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Languages className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{language.nativeName}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({language.name})
                    </span>
                  </div>
                  {currentLanguage === language.code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </CommandList>
      </Command>
      
      <div className="flex gap-2 pt-4 border-t mt-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onSelect('')}
        >
          Abbrechen
        </Button>
        <Button 
          className="w-full"
          onClick={() => onSelect(currentLanguage)}
        >
          Bestätigen
        </Button>
      </div>
    </div>
  );
};

export default LanguageSelector;
