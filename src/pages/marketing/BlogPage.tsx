import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MarketingLayout from '@/components/marketing/layout/MarketingLayout';
import { Calendar, ArrowRight, Tag } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: '10 HR-Trends für 2026',
    excerpt: 'Die Arbeitswelt verändert sich rasant. Entdecken Sie die wichtigsten HR-Trends, die Sie 2026 im Blick haben sollten.',
    date: '2. Januar 2026',
    category: 'HR-Trends',
    categoryColor: 'bg-purple-100 text-purple-700',
    image: null,
  },
  {
    id: 2,
    title: 'DSGVO-konformes Bewerbermanagement',
    excerpt: 'Erfahren Sie, wie Sie Ihr Recruiting DSGVO-konform gestalten und welche Fallstricke Sie vermeiden sollten.',
    date: '28. Dezember 2025',
    category: 'Rechtliches',
    categoryColor: 'bg-red-100 text-red-700',
    image: null,
  },
  {
    id: 3,
    title: 'So optimieren Sie Ihr Onboarding',
    excerpt: 'Ein gutes Onboarding ist der Schlüssel zur Mitarbeiterbindung. Diese 7 Tipps helfen Ihnen dabei.',
    date: '20. Dezember 2025',
    category: 'Tipps & Tricks',
    categoryColor: 'bg-blue-100 text-blue-700',
    image: null,
  },
  {
    id: 4,
    title: 'Neue Funktion: KI-gestützte Zeiterfassung',
    excerpt: 'Mit unserem neuesten Update wird die Zeiterfassung noch intelligenter. Entdecken Sie die neuen Features.',
    date: '15. Dezember 2025',
    category: 'Produktupdates',
    categoryColor: 'bg-green-100 text-green-700',
    image: null,
  },
  {
    id: 5,
    title: 'Remote Work: Best Practices für HR',
    excerpt: 'Wie Sie Remote-Teams erfolgreich managen und welche Tools dabei helfen können.',
    date: '10. Dezember 2025',
    category: 'HR-Trends',
    categoryColor: 'bg-purple-100 text-purple-700',
    image: null,
  },
  {
    id: 6,
    title: 'Mitarbeiterfeedback richtig einholen',
    excerpt: 'Feedback ist wichtig für die Entwicklung Ihrer Mitarbeiter. So holen Sie es effektiv ein.',
    date: '5. Dezember 2025',
    category: 'Tipps & Tricks',
    categoryColor: 'bg-blue-100 text-blue-700',
    image: null,
  },
];

const categories = [
  { name: 'Alle', count: blogPosts.length },
  { name: 'HR-Trends', count: 2 },
  { name: 'Tipps & Tricks', count: 2 },
  { name: 'Produktupdates', count: 1 },
  { name: 'Rechtliches', count: 1 },
];

const BlogPage: React.FC = () => {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-[#3730a3]/5 via-white to-cyan-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            HR-Insights &{' '}
            <span className="text-[#3730a3]">News</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Aktuelle Trends, praktische Tipps und Neuigkeiten aus der Welt des HR-Managements.
          </p>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Kategorien
                </h3>
                <ul className="space-y-2">
                  {categories.map((category, index) => (
                    <li key={index}>
                      <button className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                        index === 0 
                          ? 'bg-[#3730a3] text-white' 
                          : 'text-muted-foreground hover:bg-slate-100'
                      }`}>
                        {category.name}
                        <span className="float-right opacity-60">({category.count})</span>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Newsletter CTA */}
                <div className="mt-8 p-6 rounded-xl bg-slate-50 border border-border">
                  <h4 className="font-semibold text-foreground mb-2">
                    Newsletter abonnieren
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Erhalten Sie die neuesten HR-Insights direkt in Ihr Postfach.
                  </p>
                  <input
                    type="email"
                    placeholder="Ihre E-Mail"
                    className="w-full px-4 py-2 rounded-lg border border-border mb-3 text-sm"
                  />
                  <Button className="w-full bg-[#3730a3] hover:bg-[#4f46e5] text-white">
                    Abonnieren
                  </Button>
                </div>
              </div>
            </aside>

            {/* Blog Posts Grid */}
            <div className="lg:col-span-3">
              <div className="grid md:grid-cols-2 gap-8">
                {blogPosts.map((post) => (
                  <article 
                    key={post.id}
                    className="group rounded-2xl bg-white border border-border overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Image Placeholder */}
                    <div className="aspect-video bg-gradient-to-br from-[#3730a3]/10 to-cyan-50" />
                    
                    <div className="p-6">
                      {/* Category & Date */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${post.categoryColor}`}>
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {post.date}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#3730a3] transition-colors">
                        <Link to={`/blog/${post.id}`}>
                          {post.title}
                        </Link>
                      </h2>

                      {/* Excerpt */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      {/* Read More */}
                      <Link 
                        to={`/blog/${post.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#3730a3] hover:text-[#4f46e5] transition-colors"
                      >
                        Weiterlesen
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Load More */}
              <div className="mt-12 text-center">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-[#3730a3] text-[#3730a3] hover:bg-[#3730a3]/5"
                >
                  Weitere Artikel laden
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default BlogPage;
