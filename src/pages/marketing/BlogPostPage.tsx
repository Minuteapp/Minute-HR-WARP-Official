import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MarketingLayout from '@/components/marketing/layout/MarketingLayout';
import { Calendar, ArrowLeft, Share2, Bookmark } from 'lucide-react';

const BlogPostPage: React.FC = () => {
  const { id } = useParams();

  // Placeholder content
  const post = {
    title: '10 HR-Trends für 2026',
    date: '2. Januar 2026',
    category: 'HR-Trends',
    author: 'Sarah Müller',
    authorRole: 'HR-Expertin bei Minute HR',
    content: `
      <p>Die Arbeitswelt verändert sich rasant. Künstliche Intelligenz, Remote Work und neue Generationen von Arbeitnehmern stellen HR-Abteilungen vor neue Herausforderungen.</p>
      
      <h2>1. KI-gestützte HR-Prozesse</h2>
      <p>Künstliche Intelligenz wird 2026 noch stärker in HR-Prozesse integriert. Von der Bewerberauswahl bis zur Personalplanung – KI unterstützt HR-Teams bei Routineaufgaben und ermöglicht datenbasierte Entscheidungen.</p>
      
      <h2>2. Employee Experience im Fokus</h2>
      <p>Die Mitarbeitererfahrung wird zum wichtigsten Differenzierungsmerkmal. Unternehmen investieren in digitale Self-Service-Portale und personalisierte Entwicklungsangebote.</p>
      
      <h2>3. Flexible Arbeitsmodelle</h2>
      <p>Hybride Arbeitsmodelle sind zur Norm geworden. HR-Teams müssen Policies entwickeln, die sowohl Remote- als auch Präsenzarbeit optimal unterstützen.</p>
      
      <p>Weitere Trends und tiefgehende Analysen finden Sie in unserem vollständigen Trendbericht...</p>
    `,
  };

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-[#3730a3]/5 via-white to-cyan-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zum Blog
          </Link>
          
          <span className="inline-block px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 rounded-full mb-4">
            {post.category}
          </span>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {post.date}
            </span>
            <span>•</span>
            <span>{post.author}</span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Share Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 flex lg:flex-col gap-3">
                <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
                  <Bookmark className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <article className="lg:col-span-11">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-[#3730a3]"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Author Box */}
              <div className="mt-12 p-6 rounded-xl bg-slate-50 border border-border flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#3730a3]/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-[#3730a3]">SM</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{post.author}</h4>
                  <p className="text-sm text-muted-foreground">{post.authorRole}</p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-12 p-8 rounded-xl bg-[#3730a3] text-center">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Optimieren Sie Ihr HR-Management
                </h3>
                <p className="text-white/80 mb-6">
                  Testen Sie Minute HR 14 Tage kostenlos und erleben Sie moderne HR-Prozesse.
                </p>
                <Link to="/auth/register">
                  <Button className="bg-white text-[#3730a3] hover:bg-white/90">
                    Kostenlos starten
                  </Button>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default BlogPostPage;
