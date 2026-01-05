import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, Send, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReportQualityCard } from './ReportQualityCard';
import { CSRDRequirementsCard } from './CSRDRequirementsCard';
import { ESRSProgressSection } from './ESRSProgressSection';

export const EUReportingTab = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            EU-Nachhaltigkeitsberichterstattung (CSRD)
          </h2>
          <p className="text-sm text-muted-foreground">
            Corporate Sustainability Reporting Directive nach ESRS-Standards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Vorschau
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            PDF Export
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Send className="h-4 w-4 mr-2" />
            An Wirtschaftsprüfer
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Berichtsjahr:</span>
          <Select defaultValue="2024">
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Jahr wählen" />
            </SelectTrigger>
            <SelectContent className="bg-background border">
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Abgabefrist: 31.03.2025</span>
          <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
            98 Tage verbleibend
          </Badge>
        </div>
      </div>

      {/* Report Quality Card */}
      <ReportQualityCard />

      {/* CSRD Requirements Card */}
      <CSRDRequirementsCard />

      {/* ESRS Progress Section */}
      <ESRSProgressSection />
    </div>
  );
};
