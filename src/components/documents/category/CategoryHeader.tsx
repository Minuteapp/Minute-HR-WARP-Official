
import { Button } from "@/components/ui/button";
import { Upload, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import type { DocumentCategory } from "@/types/documents";
import { DOCUMENT_CATEGORIES } from "@/utils/documentUtils";

interface CategoryHeaderProps {
  category: DocumentCategory;
  onUpload: () => void;
}

export const CategoryHeader = ({ category, onUpload }: CategoryHeaderProps) => {
  const categoryName = DOCUMENT_CATEGORIES[category] || category;

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0 items-start mb-6">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Link to="/documents">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{categoryName}</h1>
        <p className="text-gray-600 mt-1">
          Verwalten Sie alle Dokumente in der Kategorie "{categoryName}"
        </p>
      </div>
      <Button onClick={onUpload}>
        <Upload className="h-4 w-4 mr-2" />
        Dokument hochladen
      </Button>
    </div>
  );
};
