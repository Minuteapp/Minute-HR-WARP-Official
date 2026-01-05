import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, Paperclip, FolderTree } from "lucide-react";

interface HRNotesStatsProps {
  notes: any[];
}

export const HRNotesStats = ({ notes }: HRNotesStatsProps) => {
  const totalNotes = notes.length;
  
  const thisMonthNotes = notes.filter(note => {
    const noteDate = new Date(note.created_at);
    const now = new Date();
    return noteDate.getMonth() === now.getMonth() && 
           noteDate.getFullYear() === now.getFullYear();
  }).length;
  
  const notesWithAttachments = notes.filter(note => note.has_attachments).length;
  
  const uniqueCategories = new Set(notes.map(note => note.category)).size;

  const stats = [
    {
      title: "Gesamt",
      value: totalNotes,
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Diesen Monat",
      value: thisMonthNotes,
      icon: Calendar,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "Mit Anhängen",
      value: notesWithAttachments,
      icon: Paperclip,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950"
    },
    {
      title: "Kategorien",
      value: uniqueCategories,
      icon: FolderTree,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
