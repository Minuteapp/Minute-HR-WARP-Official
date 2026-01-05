import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Star, ThumbsUp, ThumbsDown, FileText, Video, HelpCircle, Bookmark, Share2, Printer, User, Calendar, Eye as EyeIcon, CheckCircle } from "lucide-react";
import { useKnowledgeBase } from '@/hooks/useHelpdesk';
import { Skeleton } from "@/components/ui/skeleton";
import type { HelpdeskKnowledgeBase } from '@/types/helpdesk';

const categories = [
  { name: 'Abwesenheit', icon: BookOpen },
  { name: 'Payroll', icon: FileText },
  { name: 'HR', icon: BookOpen },
  { name: 'Spesen', icon: FileText },
  { name: 'Compliance', icon: BookOpen },
  { name: 'IT', icon: BookOpen },
];

const getTypeBadge = (category: string) => {
  const types: Record<string, { label: string; icon: typeof FileText; className: string }> = {
    'Abwesenheit': { label: 'Richtlinie', icon: BookOpen, className: 'bg-violet-50 text-violet-700 border-violet-200' },
    'Payroll': { label: 'Artikel', icon: FileText, className: 'bg-blue-50 text-blue-700 border-blue-200' },
    'HR': { label: 'FAQ', icon: HelpCircle, className: 'bg-blue-50 text-blue-700 border-blue-200' },
    'IT': { label: 'Video', icon: Video, className: 'bg-red-50 text-red-700 border-red-200' },
  };
  return types[category] || { label: 'Artikel', icon: FileText, className: 'bg-blue-50 text-blue-700 border-blue-200' };
};

export const HelpdeskKnowledgeBaseTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpdeskKnowledgeBase | null>(null);
  
  const { data: articles, isLoading } = useKnowledgeBase();

  const filteredArticles = (articles || []).filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topArticles = [...(articles || [])]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 5);

  // Artikel-Detail-Ansicht
  if (selectedArticle) {
    return (
      <ArticleDetailView 
        article={selectedArticle} 
        onBack={() => setSelectedArticle(null)} 
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Wissensdatenbank</h2>
        <p className="text-sm text-muted-foreground">
          Durchsuchen Sie Richtlinien, FAQs und Anleitungen
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Wissensdatenbank durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => {
              const typeBadge = getTypeBadge(article.category);
              return (
                <Card 
                  key={article.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedArticle(article)}
                >
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      {/* Type Badge + Category */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${typeBadge.className} flex items-center gap-1`}>
                          <typeBadge.icon className="h-3 w-3" />
                          {typeBadge.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{article.category}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-semibold text-foreground">
                        {article.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.content}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground pt-2">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {article.helpful_votes > 0 ? (article.helpful_votes / 10).toFixed(1) : '-'}
                        </span>
                        <span>•</span>
                        <span>{article.view_count} Aufrufe</span>
                        <span>•</span>
                        <span>Aktualisiert: {new Date(article.updated_at).toLocaleDateString('de-DE')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-10">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Keine Artikel gefunden</p>
              <p className="text-sm text-muted-foreground">
                {articles?.length === 0 ? 'Die Wissensdatenbank ist noch leer' : 'Versuchen Sie andere Suchbegriffe'}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Top Artikel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Top Artikel</CardTitle>
              <p className="text-sm text-muted-foreground">Meistgelesene Inhalte</p>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {topArticles.length > 0 ? (
                topArticles.map((article) => (
                  <div 
                    key={article.id} 
                    className="cursor-pointer hover:bg-muted/50 rounded p-2 -mx-2"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <p className="text-sm font-medium text-foreground mb-1 line-clamp-1">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {article.helpful_votes > 0 ? (article.helpful_votes / 10).toFixed(1) : '-'}
                      </span>
                      <span>•</span>
                      <span>{article.view_count} Aufrufe</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Noch keine Artikel</p>
              )}
            </CardContent>
          </Card>

          {/* Kategorien */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Kategorien</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {categories.map((category, index) => {
                const count = (articles || []).filter(a => a.category === category.name).length;
                return (
                  <div 
                    key={index}
                    className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded p-2 -mx-2"
                    onClick={() => setSearchTerm(category.name)}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{category.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardContent className="p-4">
              <p className="text-base font-medium text-foreground mb-2">
                Feedback
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Fehlt ein Artikel zu einem Thema?
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Artikel vorschlagen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Artikel-Detail-Ansicht Komponente
interface ArticleDetailViewProps {
  article: HelpdeskKnowledgeBase;
  onBack: () => void;
}

const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({ article, onBack }) => {
  const typeBadge = getTypeBadge(article.category);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <button 
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1"
          >
            ← Zurück
          </button>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${typeBadge.className} flex items-center gap-1`}>
              <typeBadge.icon className="h-3 w-3" />
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
          {/* Meta Info Card */}
          <Card>
            <CardContent className="p-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Aktualisiert: {new Date(article.updated_at).toLocaleDateString('de-DE')}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <EyeIcon className="h-4 w-4" />
                {article.view_count} Aufrufe
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {article.helpful_votes > 0 ? (article.helpful_votes / 10).toFixed(1) : '-'} / 5
              </span>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardContent className="p-6 prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-foreground">
                {article.content}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback */}
          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <h3 className="text-base font-semibold text-foreground mb-2">
                War dieser Artikel hilfreich?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ihr Feedback hilft uns, unsere Inhalte zu verbessern
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Ja, hilfreich
                </Button>
                <Button variant="outline" className="flex-1">
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Nicht hilfreich
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Artikel-Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kategorie</span>
                <span className="font-medium">{article.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sprache</span>
                <span className="font-medium">{article.language === 'de' ? 'Deutsch' : article.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Öffentlich</span>
                <span className="font-medium">{article.is_public ? 'Ja' : 'Nein'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};