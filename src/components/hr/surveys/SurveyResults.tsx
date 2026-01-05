
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Users, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SurveyResultsProps {
  survey: any;
}

export const SurveyResults = ({ survey }: SurveyResultsProps) => {
  const { data: responses = [], isLoading } = useQuery({
    queryKey: ['survey-responses', survey.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_survey_responses')
        .select('*')
        .eq('survey_id', survey.id);

      if (error) throw error;
      return data;
    }
  });

  const calculateQuestionResults = (questionId: string, questionType: string) => {
    const questionResponses = responses
      .map(response => response.responses[questionId])
      .filter(answer => answer !== undefined && answer !== null && answer !== '');

    const totalResponses = questionResponses.length;
    
    if (totalResponses === 0) {
      return { totalResponses: 0, results: [] };
    }

    switch (questionType) {
      case 'multiple_choice':
      case 'yes_no':
        const counts: Record<string, number> = {};
        questionResponses.forEach(answer => {
          counts[answer] = (counts[answer] || 0) + 1;
        });
        
        const results = Object.entries(counts).map(([option, count]) => ({
          option,
          count,
          percentage: Math.round((count / totalResponses) * 100)
        })).sort((a, b) => b.count - a.count);
        
        return { totalResponses, results };

      case 'rating':
        const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        questionResponses.forEach(rating => {
          const ratingValue = Number(rating);
          if (ratingValue >= 1 && ratingValue <= 5) {
            ratingCounts[ratingValue]++;
          }
        });

        const averageRating = questionResponses.reduce((sum, rating) => sum + Number(rating), 0) / totalResponses;
        
        const ratingResults = Object.entries(ratingCounts).map(([rating, count]) => ({
          option: `${rating} Sterne`,
          count,
          percentage: Math.round((count / totalResponses) * 100)
        }));

        return { 
          totalResponses, 
          results: ratingResults, 
          averageRating: Math.round(averageRating * 10) / 10 
        };

      case 'text':
        return { 
          totalResponses, 
          results: questionResponses.map((answer, index) => ({
            id: index,
            text: answer
          }))
        };

      default:
        return { totalResponses: 0, results: [] };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{responses.length}</p>
                <p className="text-sm text-gray-500">Antworten gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{survey.questions?.length || 0}</p>
                <p className="text-sm text-gray-500">Fragen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {responses.length > 0 ? '100%' : '0%'}
                </p>
                <p className="text-sm text-gray-500">Vollständigkeit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fragen und Ergebnisse */}
      <div className="space-y-6">
        {survey.questions?.map((question: any, index: number) => {
          const questionResults = calculateQuestionResults(question.id, question.type);
          
          return (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Frage {index + 1}: {question.title}
                    </CardTitle>
                    {question.description && (
                      <p className="text-sm text-gray-600 mt-1">{question.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{question.type}</Badge>
                      {question.required && <Badge variant="secondary">Pflichtfeld</Badge>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {questionResults.totalResponses} von {responses.length} Antworten
                    </p>
                    {questionResults.totalResponses > 0 && (
                      <p className="text-xs text-gray-400">
                        {Math.round((questionResults.totalResponses / responses.length) * 100)}% Antwortrate
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {questionResults.totalResponses === 0 ? (
                  <p className="text-gray-500 italic">Noch keine Antworten für diese Frage</p>
                ) : (
                  <div className="space-y-4">
                    {/* Rating Fragen */}
                    {question.type === 'rating' && questionResults.averageRating && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-semibold">
                            ⌀ {questionResults.averageRating} / 5
                          </span>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= questionResults.averageRating!
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Multiple Choice, Yes/No, Rating Verteilung */}
                    {(question.type === 'multiple_choice' || question.type === 'yes_no' || question.type === 'rating') && (
                      <div className="space-y-3">
                        {questionResults.results.map((result: any, resultIndex: number) => (
                          <div key={resultIndex} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{result.option}</span>
                              <span className="text-sm text-gray-500">
                                {result.count} ({result.percentage}%)
                              </span>
                            </div>
                            <Progress value={result.percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Text Antworten */}
                    {question.type === 'text' && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700">Alle Antworten:</h4>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {questionResults.results.map((result: any) => (
                            <div key={result.id} className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm">{result.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {responses.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Noch keine Antworten vorhanden</p>
              <p className="text-sm text-gray-400">
                Sobald Mitarbeiter an der Umfrage teilnehmen, werden hier die Ergebnisse angezeigt.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
