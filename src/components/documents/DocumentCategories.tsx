
import { Card } from "@/components/ui/card";
import { 
  GraduationCap, UserPlus, Building, Users, 
  DollarSign, Scale, File, Bell, 
  Archive, Tag
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DocumentCategory } from "@/types/documents";
import { useState, useEffect } from "react";

const DocumentCategories = () => {
  const [documentCounts, setDocumentCounts] = useState<Record<string, number>>({});

  // Abfrage, um Dokumentenzahlen pro Kategorie zu ermitteln
  const { data: documents } = useQuery({
    queryKey: ['documents', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .is('deleted_at', null);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Dokumentenzählung nach Kategorien
  useEffect(() => {
    if (documents) {
      const counts: Record<string, number> = {};
      documents.forEach((doc) => {
        counts[doc.category] = (counts[doc.category] || 0) + 1;
      });
      setDocumentCounts(counts);
    }
  }, [documents]);

  // Kategoriedefinitionen mit Icons, Beschreibungen und Farbcodes
  const categories = [
    {
      id: 'training' as DocumentCategory,
      name: 'Schulung & Weiterbildung',
      icon: GraduationCap,
      color: 'bg-indigo-100 text-indigo-600',
      description: 'Schulungsunterlagen, Zertifikate und Trainingsmaterialien'
    },
    {
      id: 'recruiting' as DocumentCategory,
      name: 'Recruiting & Onboarding',
      icon: UserPlus,
      color: 'bg-emerald-100 text-emerald-600',
      description: 'Bewerbungsunterlagen, Arbeitsverträge und Checklisten'
    },
    {
      id: 'company' as DocumentCategory,
      name: 'Unternehmensdokumente',
      icon: Building,
      color: 'bg-sky-100 text-sky-600',
      description: 'Richtlinien, Datenschutz und Sicherheitsanweisungen'
    },
    {
      id: 'employee' as DocumentCategory,
      name: 'Mitarbeiterdokumente',
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      description: 'Arbeitsverträge, Gehaltsabrechnungen und Krankmeldungen'
    },
    {
      id: 'payroll' as DocumentCategory,
      name: 'Lohn & Gehalt',
      icon: DollarSign,
      color: 'bg-pink-100 text-pink-600',
      description: 'Gehaltsnachweise, Lohnzettel und Steuerunterlagen'
    },
    {
      id: 'legal' as DocumentCategory,
      name: 'Rechtliche Dokumente',
      icon: Scale,
      color: 'bg-orange-100 text-orange-600',
      description: 'DSGVO-Einwilligungen und Vereinbarungen'
    }
  ];

  // Hilfsfunktion, um Dokumentanzahl pro Kategorie als Badge anzuzeigen
  const getDocumentCount = (categoryId: string) => {
    const count = documentCounts[categoryId] || 0;
    return count > 0 ? (
      <Badge variant="secondary" className="ml-2">
        {count}
      </Badge>
    ) : null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <Link to={`/documents/${category.id}`} key={category.id}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow p-4">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${category.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="font-medium">{category.name}</h3>
                    {getDocumentCount(category.id)}
                  </div>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};

export default DocumentCategories;
