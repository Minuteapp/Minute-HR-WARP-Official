import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Lightbulb, 
  Send, 
  Upload, 
  Star, 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown,
  Plus,
  X,
  FileText,
  Image as ImageIcon,
  Brain
} from 'lucide-react';
import { IdeaData } from './IdeaVisualization';
import AIAnalysisSystem from './AIAnalysisSystem';

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: Date;
  rating?: number; // 1-5 stars
}

interface IdeaFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  expectedBenefit: string;
  attachments: File[];
}

interface IdeaSubmissionFormProps {
  onSubmit: (idea: IdeaFormData) => void;
  onClose: () => void;
}

const categories = [
  'Technologie',
  'Nachhaltigkeit', 
  'Arbeitsplatz',
  'Kundenservice',
  'Prozessoptimierung',
  'HR',
  'Marketing',
  'Finanzen'
];

const priorityOptions = [
  { value: 'high', label: 'Hoch', color: 'bg-red-100 text-red-800' },
  { value: 'medium', label: 'Mittel', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: 'Niedrig', color: 'bg-green-100 text-green-800' }
];

// Kommentare werden aus der Datenbank geladen
const initialComments: Comment[] = [];

const IdeaSubmissionForm: React.FC<IdeaSubmissionFormProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState<IdeaFormData>({
    title: '',
    description: '',
    category: '',
    tags: [],
    priority: 'medium',
    expectedBenefit: '',
    attachments: []
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState<number>(0);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysis, setAIAnalysis] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const addComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: 'Aktueller User',
        authorAvatar: 'AU',
        content: newComment,
        timestamp: new Date(),
        rating: newRating > 0 ? newRating : undefined
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
      setNewRating(0);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRate?.(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Neue Idee einreichen
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* KI-Analyse Toggle */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-800">KI-Unterstützung aktivieren</span>
                  </div>
                  <Button
                    type="button"
                    variant={showAIAnalysis ? "default" : "outline"}
                    onClick={() => setShowAIAnalysis(!showAIAnalysis)}
                    className={showAIAnalysis ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    {showAIAnalysis ? "KI aktiv" : "KI aktivieren"}
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Titel */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Titel der Idee</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="z.B. KI-gestützte Kundenbetreuung"
                      required
                    />
                  </div>

                  {/* Beschreibung */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Detaillierte Beschreibung</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Beschreiben Sie Ihre Idee ausführlich..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  {/* Kategorie und Priorität */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Kategorie</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Kategorie wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Priorität</Label>
                      <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className={`px-2 py-1 rounded text-xs ${option.color}`}>
                                {option.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Schlagwörter</Label>
                    <div className="flex gap-2">
                      <Input
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="Tag hinzufügen..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Erwarteter Nutzen */}
                  <div className="space-y-2">
                    <Label htmlFor="benefit">Erwarteter Nutzen</Label>
                    <Textarea
                      id="benefit"
                      value={formData.expectedBenefit}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedBenefit: e.target.value }))}
                      placeholder="Welchen Nutzen erwarten Sie von dieser Idee?"
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Anhänge */}
                  <div className="space-y-2">
                    <Label>Anhänge</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept="image/*,.pdf,.doc,.docx"
                      />
                      <Label htmlFor="file-upload" className="flex items-center justify-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800">
                        <Upload className="h-5 w-5" />
                        Dateien hochladen (Bilder, PDFs, Dokumente)
                      </Label>
                    </div>
                    
                    {formData.attachments.length > 0 && (
                      <div className="space-y-2">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center gap-2">
                              {file.type.startsWith('image/') ? (
                                <ImageIcon className="h-4 w-4 text-blue-600" />
                              ) : (
                                <FileText className="h-4 w-4 text-gray-600" />
                              )}
                              <span className="text-sm">{file.name}</span>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeAttachment(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Abbrechen
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-cyan-600 to-blue-600">
                      <Send className="h-4 w-4 mr-2" />
                      Idee einreichen
                    </Button>
                  </div>
                </form>
              </div>

              {/* Team Comments Sidebar */}
              <div className="space-y-4">
                {/* KI-Analyse System */}
                {showAIAnalysis && formData.title && formData.description && (
                  <div className="mb-6">
                    <AIAnalysisSystem 
                      idea={{
                        id: 'temp',
                        title: formData.title,
                        description: formData.description,
                        category: formData.category,
                        priority: formData.priority,
                        status: 'draft',
                        tags: formData.tags,
                        votes: 0,
                        roiPotential: 0,
                      } as IdeaData}
                      onAnalysisComplete={setAIAnalysis}
                    />
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                    <MessageCircle className="h-4 w-4" />
                    Team-Feedback
                  </h3>

                  {/* Comments List */}
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {comments.map(comment => (
                      <div key={comment.id} className="bg-white p-3 rounded border">
                        <div className="flex items-start gap-2 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                              {comment.authorAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{comment.author}</span>
                              <span className="text-xs text-gray-500">
                                {comment.timestamp.toLocaleDateString('de-DE')}
                              </span>
                            </div>
                            {comment.rating && (
                              <div className="mt-1">
                                {renderStars(comment.rating)}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Add Comment */}
                  <div className="space-y-3 mt-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Bewertung (optional)</Label>
                      {renderStars(newRating, true, setNewRating)}
                    </div>
                    
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Kommentar hinzufügen..."
                      className="min-h-[80px]"
                    />
                    
                    <Button 
                      onClick={addComment} 
                      size="sm" 
                      className="w-full"
                      disabled={!newComment.trim()}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Kommentar hinzufügen
                    </Button>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Gefällt mir
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Bedenken
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IdeaSubmissionForm;