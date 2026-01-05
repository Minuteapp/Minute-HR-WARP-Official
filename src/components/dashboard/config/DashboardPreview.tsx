import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardConfig {
  id: string;
  name: string;
  is_default: boolean;
  layout_config: any[];
}

interface DashboardPreviewProps {
  config: DashboardConfig;
}

const DashboardPreview: React.FC<DashboardPreviewProps> = ({ config }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Vorschau: {config.name}</CardTitle>
          {config.is_default && <Badge>Standard</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
          <div className="grid grid-cols-6 gap-4 min-h-[400px]">
            {config.layout_config.length === 0 ? (
              <div className="col-span-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-medium mb-2">Dashboard ist noch leer</h3>
                  <p className="text-muted-foreground">
                    Fügen Sie Widgets über den Designer hinzu
                  </p>
                </div>
              </div>
            ) : (
              config.layout_config.map((container, index) => (
                <div
                  key={container.id || index}
                  className={`
                    bg-muted/30 rounded border border-muted flex items-center justify-center
                    min-h-[80px]
                  `}
                  style={{
                    gridColumn: `span ${container.width || 1}`,
                    gridRow: `span ${container.height || 1}`
                  }}
                >
                  <div className="text-center p-2">
                    <div className="text-sm font-medium">
                      {container.display_name || container.widget_type}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {container.module_name}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardPreview;