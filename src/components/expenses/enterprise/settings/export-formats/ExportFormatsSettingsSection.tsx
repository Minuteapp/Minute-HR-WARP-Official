
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ExportFormatItem from './ExportFormatItem';

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: 'file' | 'download';
}

const ExportFormatsSettingsSection = () => {
  const [formats, setFormats] = useState<ExportFormat[]>([]);

  const handleConfigure = (id: string) => {
    console.log('Configure format:', id);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Exportformate konfigurieren</CardTitle>
      </CardHeader>
      <CardContent>
        {formats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Keine Exportformate konfiguriert.
          </div>
        ) : (
          <div>
            {formats.map((format) => (
              <ExportFormatItem
                key={format.id}
                {...format}
                onConfigure={handleConfigure}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExportFormatsSettingsSection;
