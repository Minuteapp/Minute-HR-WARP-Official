import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Languages, ChevronDown, ChevronUp } from 'lucide-react';
import { translateText, detectLanguage } from '@/services/translationService';

interface TranslatedMessageViewProps {
  originalText: string;
  messageId: string;
  targetLanguage: string;
}

export const TranslatedMessageView = ({
  originalText,
  targetLanguage,
}: TranslatedMessageViewProps) => {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOriginal, setShowOriginal] = useState(true);

  const handleTranslate = async () => {
    if (translatedText) {
      setShowOriginal(!showOriginal);
      return;
    }

    setLoading(true);
    try {
      const detectedLang = await detectLanguage(originalText);
      setSourceLanguage(detectedLang);

      const translated = await translateText(
        originalText,
        detectedLang,
        targetLanguage
      );
      setTranslatedText(translated);
      setShowOriginal(false);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!translatedText && !loading) {
    return (
      <div className="space-y-1">
        <p className="text-sm whitespace-pre-wrap break-words">{originalText}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTranslate}
          className="h-7 text-xs"
        >
          <Languages className="h-3 w-3 mr-1" />
          Übersetzen
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Languages className="h-3 w-3 animate-pulse" />
          Übersetze...
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Languages className="h-3 w-3 mr-1" />
              {sourceLanguage?.toUpperCase()} → {targetLanguage.toUpperCase()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOriginal(!showOriginal)}
              className="h-6 text-xs"
            >
              {showOriginal ? (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Übersetzung zeigen
                </>
              ) : (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Original zeigen
                </>
              )}
            </Button>
          </div>
          {showOriginal ? (
            <p className="text-sm whitespace-pre-wrap break-words">{originalText}</p>
          ) : (
            <div className="p-2 bg-accent/30 rounded text-sm border-l-2 border-primary">
              {translatedText}
            </div>
          )}
        </>
      )}
    </div>
  );
};
