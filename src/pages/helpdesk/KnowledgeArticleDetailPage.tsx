import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  Printer, 
  User, 
  Calendar, 
  Eye, 
  Star, 
  ThumbsUp, 
  ThumbsDown,
  CheckCircle,
  MessageSquare,
  FileText
} from "lucide-react";
import { toast } from "sonner";

interface ArticleContent {
  id: string;
  type: 'article' | 'policy' | 'video' | 'faq';
  category: string;
  title: string;
  description: string;
  author: string;
  updatedAt: string;
  views: number;
  rating: number;
  sections: {
    id: string;
    title: string;
    content: string;
    checkmarks?: string[];
  }[];
}

const mockArticle: ArticleContent = {
  id: '',
  type: 'article',
  category: '',
  title: '',
  description: '',
  author: '',
  updatedAt: '',
  views: 0,
  rating: 0,
  sections: []
};

const relatedArticles: { id: string; category: string; title: string; rating: number }[] = [];

const getTypeBadge = (type: ArticleContent['type']) => {
  switch (type) {
    case 'article':
      return { label: 'Artikel', className: 'bg-blue-100 text-blue-700 border-blue-200' };
    case 'policy':
      return { label: 'Richtlinie', className: 'bg-violet-100 text-violet-700 border-violet-200' };
    case 'video':
      return { label: 'Video', className: 'bg-red-100 text-red-700 border-red-200' };
    case 'faq':
      return { label: 'FAQ', className: 'bg-green-100 text-green-700 border-green-200' };
    default:
      return { label: 'Artikel', className: 'bg-blue-100 text-blue-700 border-blue-200' };
  }
};

const KnowledgeArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedbackGiven, setFeedbackGiven] = useState<'helpful' | 'not-helpful' | null>(null);

  const article = mockArticle;
  const typeBadge = getTypeBadge(article.type);

  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    setFeedbackGiven(type);
    toast.success(type === 'helpful' ? 'Vielen Dank für Ihr positives Feedback!' : 'Danke für Ihr Feedback. Wir werden den Artikel verbessern.');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Vorschau</Badge>
            <button 
              onClick={() => navigate('/helpdesk')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={typeBadge.className}>
              {typeBadge.label}
            </Badge>
            <span className="text-sm text-muted-foreground">{article.category}</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{article.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-1.5" />
            Speichern
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1.5" />
            Teilen
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-1.5" />
            Drucken
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Author Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{article.author}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Aktualisiert: {article.updatedAt}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {article.views} Aufrufe
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {article.rating} / 5
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Beschreibung</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{article.description}</p>
            </CardContent>
          </Card>

          {/* Content Sections */}
          {article.sections.map((section) => (
            <Card key={section.id} id={section.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{section.content}</p>
                {section.checkmarks && (
                  <div className="space-y-2">
                    {section.checkmarks.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Feedback Card */}
          <Card className="bg-muted/30">
            <CardContent className="p-6 text-center">
              <p className="text-base font-medium text-foreground mb-1">
                War dieser Artikel hilfreich?
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Ihr Feedback hilft uns, unsere Inhalte zu verbessern
              </p>
              <div className="flex justify-center gap-3">
                <Button 
                  variant={feedbackGiven === 'helpful' ? 'default' : 'outline'}
                  onClick={() => handleFeedback('helpful')}
                  disabled={feedbackGiven !== null}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Ja, hilfreich
                </Button>
                <Button 
                  variant={feedbackGiven === 'not-helpful' ? 'default' : 'outline'}
                  onClick={() => handleFeedback('not-helpful')}
                  disabled={feedbackGiven !== null}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Nicht hilfreich
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Inhaltsverzeichnis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Inhaltsverzeichnis</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {article.sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="block w-full text-left text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {index + 1}. {section.title}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Verwandte Artikel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Verwandte Artikel</CardTitle>
              <p className="text-xs text-muted-foreground">Das könnte Sie auch interessieren</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {relatedArticles.map((related) => (
                  <div 
                    key={related.id}
                    className="cursor-pointer hover:bg-muted/50 rounded p-2 -mx-2"
                    onClick={() => navigate(`/helpdesk/knowledge/${related.id}`)}
                  >
                    <p className="text-xs text-muted-foreground">{related.category}</p>
                    <p className="text-sm text-foreground font-medium">{related.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">{related.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Noch Fragen? */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Noch Fragen?</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Wenn Sie weitere Unterstützung benötigen, erstellen Sie ein Support-Ticket.
              </p>
              <Button 
                variant="outline"
                size="sm" 
                className="w-full"
                onClick={() => navigate('/helpdesk')}
              >
                <MessageSquare className="h-4 w-4 mr-1.5" />
                Ticket erstellen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeArticleDetailPage;
