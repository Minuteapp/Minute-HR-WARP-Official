import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Copy, Pencil, Plus, HelpCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: string;
  question: string;
  type: string;
  category: string;
  usedCount: number;
  isFavorite: boolean;
}

export const QuestionLibrarySubTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [localFavorites, setLocalFavorites] = useState<string[]>([]);

  // Lade Fragen aus der Datenbank
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['survey-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('survey_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Zähle Verwendung pro Frage
      const questionsWithCount = await Promise.all((data || []).map(async (q) => {
        const { count } = await supabase
          .from('survey_responses')
          .select('*', { count: 'exact', head: true })
          .eq('question_id', q.id);

        return {
          id: q.id,
          question: q.question_text || q.question || '',
          type: q.question_type || q.type || 'Likert 1-5',
          category: q.category || 'Allgemein',
          usedCount: count || 0,
          isFavorite: q.is_favorite || false
        };
      }));

      return questionsWithCount;
    }
  });

  const filteredQuestions = questions.filter((q: Question) =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favorites = [...localFavorites, ...questions.filter((q: Question) => q.isFavorite).map((q: Question) => q.id)];

  const toggleFavorite = async (id: string) => {
    const isFav = favorites.includes(id);
    
    // Optimistisches Update
    if (isFav) {
      setLocalFavorites(prev => prev.filter(f => f !== id));
    } else {
      setLocalFavorites(prev => [...prev, id]);
    }

    // DB Update
    await supabase
      .from('survey_questions')
      .update({ is_favorite: !isFav })
      .eq('id', id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Frage suchen..." className="pl-9" disabled />
        </div>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Frage suchen..."
            className="pl-9"
          />
        </div>

        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Fragen vorhanden</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Erstellen Sie Ihre erste Umfrage-Frage, um sie in zukünftigen Pulse Surveys zu verwenden.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Erste Frage erstellen
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Frage suchen..."
          className="pl-9"
        />
      </div>

      {/* Questions List */}
      <div className="space-y-2">
        {filteredQuestions.map((q: Question) => (
          <Card key={q.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">{q.question}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {q.type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {q.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {q.usedCount}× verwendet
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleFavorite(q.id)}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        favorites.includes(q.id)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Question */}
      <Button
        variant="outline"
        className="w-full border-dashed h-14"
      >
        <Plus className="h-4 w-4 mr-2" />
        Neue Frage erstellen
      </Button>
    </div>
  );
};
