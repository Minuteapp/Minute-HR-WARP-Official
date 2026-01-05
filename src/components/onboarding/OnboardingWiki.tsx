
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Tag, Clock, Plus, FileEdit } from "lucide-react";
import { useState } from 'react';
import { WikiArticle } from "@/hooks/useEnhancedOnboarding";

interface OnboardingWikiProps {
  articles: WikiArticle[];
  isLoading: boolean;
  isAdmin?: boolean;
}

const OnboardingWiki = ({ articles = [], isLoading, isAdmin = false }: OnboardingWikiProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('alle');
  
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'alle' || article.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });
  
  // Extracts unique categories from articles
  const categories = ['alle', ...Array.from(new Set(articles.map(article => article.category)))];
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Onboarding Wiki
          </CardTitle>
          
          {isAdmin && (
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>Artikel erstellen</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Wiki-Artikel werden geladen...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search and Category filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Artikel suchen..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Tabs 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
                className="w-full sm:w-auto"
              >
                <TabsList className="w-full sm:w-auto">
                  {categories.map((category) => (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="capitalize"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            
            {/* Articles list */}
            {filteredArticles.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                <h3 className="text-lg font-medium mb-1">Keine Wiki-Artikel gefunden</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? `Keine Ergebnisse für "${searchTerm}"`
                    : 'Es wurden keine Artikel in dieser Kategorie gefunden'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="overflow-hidden">
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between">
                        <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                          {article.category}
                        </div>
                        {article.recommended && (
                          <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                            Empfohlen
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-medium">{article.title}</h3>
                      <p className="text-sm text-muted-foreground">{article.summary}</p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>{article.readTime} Min. Lesezeit</span>
                        </div>
                        
                        <Button variant="ghost" size="sm" asChild>
                          <a href={article.link}>Lesen</a>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnboardingWiki;
