import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TemplatesSubTab } from "../components/TemplatesSubTab";
import { QuestionLibrarySubTab } from "../components/QuestionLibrarySubTab";
import { QuestionTypesSubTab } from "../components/QuestionTypesSubTab";
import { TemplateDetailView } from "../views/TemplateDetailView";
import { AIQuestionGeneratorDialog } from "../dialogs/AIQuestionGeneratorDialog";
import { CreateTemplateDialog } from "../dialogs/CreateTemplateDialog";

type SubTab = "vorlagen" | "fragenbibliothek" | "fragetypen";

export const QuestionsTemplatesTab = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("vorlagen");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);

  if (selectedTemplate) {
    return (
      <TemplateDetailView
        templateId={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Fragen & Vorlagen</h2>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie Fragenvorlagen und erstellen Sie wiederverwendbare Fragenkataloge
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateTemplate(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Neue Vorlage
        </Button>
      </div>

      {/* Sub-Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveSubTab("vorlagen")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeSubTab === "vorlagen"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Vorlagen
          </button>
          <button
            onClick={() => setActiveSubTab("fragenbibliothek")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeSubTab === "fragenbibliothek"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Fragenbibliothek
          </button>
          <button
            onClick={() => setActiveSubTab("fragetypen")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeSubTab === "fragetypen"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Fragetypen
          </button>
        </div>
      </div>

      {/* Sub-Tab Content */}
      {activeSubTab === "vorlagen" && (
        <TemplatesSubTab
          onSelectTemplate={setSelectedTemplate}
          onOpenAIGenerator={() => setShowAIGenerator(true)}
        />
      )}
      {activeSubTab === "fragenbibliothek" && <QuestionLibrarySubTab />}
      {activeSubTab === "fragetypen" && <QuestionTypesSubTab />}

      {/* Dialogs */}
      <AIQuestionGeneratorDialog
        open={showAIGenerator}
        onOpenChange={setShowAIGenerator}
      />
      <CreateTemplateDialog
        open={showCreateTemplate}
        onOpenChange={setShowCreateTemplate}
      />
    </div>
  );
};
