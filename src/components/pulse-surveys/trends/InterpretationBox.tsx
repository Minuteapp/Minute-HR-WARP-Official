import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface InterpretationBoxProps {
  title?: string;
  text: string;
}

export const InterpretationBox = ({ title = "Interpretation", text }: InterpretationBoxProps) => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">{title}</h4>
            <p className="text-sm text-blue-800">{text}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
