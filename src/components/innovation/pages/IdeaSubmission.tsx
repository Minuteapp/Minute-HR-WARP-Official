import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Image, Sparkles, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type InnovationPage = 'dashboard' | 'visualization' | 'submission' | 'rating' | 'projects' | 'analytics';

interface IdeaSubmissionProps {
  onNavigate: (page: InnovationPage) => void;
}

const categories = [
  'KI & Technologie',
  'Digitalisierung',
  'Nachhaltigkeit',
  'Prozessoptimierung',
  'Produktinnovation',
  'Kundenservice',
  'Arbeitsplatz',
  'Sonstiges'
];

export const IdeaSubmission: React.FC<IdeaSubmissionProps> = ({ onNavigate }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    attachments: [] as File[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte fülle alle Pflichtfelder aus.",
        variant: "destructive"
      });
      return;
    }

    // Simulate submission
    toast({
      title: "Idee eingereicht!",
      description: "Deine Idee wird jetzt von der KI bewertet.",
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      attachments: []
    });

    // Navigate to rating page after submission
    setTimeout(() => {
      onNavigate('rating');
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-[hsl(var(--innovation-neon-turquoise))] to-[hsl(var(--innovation-dark-blue))]">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Neue Idee einreichen
        </h1>
        <p className="text-white/70 text-lg">
          Teile deine innovative Idee mit dem Team und lass sie von der KI bewerten.
        </p>
      </motion.div>

      {/* Submission Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-white font-medium">
                Titel der Idee *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="z.B. KI-gestützte Kundenbetreuung"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-white font-medium">
                Kategorie
              </label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Wähle eine Kategorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-white font-medium">
                Beschreibung *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beschreibe deine Idee detailliert. Was ist das Problem? Wie löst deine Idee es?"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-32"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <label className="text-white font-medium">
                Anhänge (optional)
              </label>
              
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70 mb-2">
                    Klicke hier oder ziehe Dateien hierher
                  </p>
                  <p className="text-white/50 text-sm">
                    PDF, Word-Dokumente oder Bilder (max. 10MB)
                  </p>
                </label>
              </div>

              {/* Uploaded Files */}
              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-white/70 text-sm">Hochgeladene Dateien:</p>
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      {file.type.startsWith('image/') ? (
                        <Image className="w-5 h-5 text-blue-400" />
                      ) : (
                        <FileText className="w-5 h-5 text-green-400" />
                      )}
                      <span className="text-white text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          attachments: prev.attachments.filter((_, i) => i !== index)
                        }))}
                        className="text-red-400 hover:text-red-300 ml-auto"
                      >
                        Entfernen
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[hsl(var(--innovation-neon-turquoise))] to-[hsl(var(--innovation-dark-blue))] hover:shadow-[0_0_20px_hsl(var(--innovation-neon-turquoise)/0.5)] transition-all duration-300"
                size="lg"
              >
                <Save className="w-5 h-5 mr-2" />
                Idee einreichen & bewerten lassen
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate('visualization')}
                className="border-white/20 text-white hover:bg-white/10"
                size="lg"
              >
                <Eye className="w-5 h-5 mr-2" />
                Vorschau
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-r from-[hsl(var(--innovation-neon-turquoise))]/20 to-[hsl(var(--innovation-dark-blue))]/20 border-[hsl(var(--innovation-neon-turquoise))]/30">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">💡 Tipps für eine gute Idee</h3>
            <ul className="space-y-2 text-white/80">
              <li>• Beschreibe das Problem, das deine Idee löst</li>
              <li>• Erkläre den Nutzen für das Unternehmen oder die Kunden</li>
              <li>• Füge konkrete Beispiele oder Use Cases hinzu</li>
              <li>• Schätze grob den Aufwand und die Kosten ein</li>
              <li>• Überlege dir mögliche Risiken und Herausforderungen</li>
            </ul>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};