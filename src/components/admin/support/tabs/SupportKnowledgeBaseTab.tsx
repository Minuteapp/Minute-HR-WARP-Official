import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, HelpCircle, Book, FileText, Wrench, FileQuestion } from "lucide-react";

const articles = [
  { id: "KB-0089", title: "Schichtplanung Troubleshooting Guide", category: "How-to", module: "Schichtplanung", views: 892, helpful: { count: 156, rate: "94%" }, updated: "14.12.2024", tags: ["Schichtplanung", "Fehlersuche"] },
  { id: "KB-0124", title: "Multi-Team-Konfiguration", category: "How-to", module: "Admin", views: 543, helpful: { count: 98, rate: "91%" }, updated: "12.12.2024", tags: ["Teams", "Konfiguration"] },
  { id: "KB-0156", title: "Bekanntes Problem: Login nach Passwort-Reset", category: "Known Issues", module: "Auth", views: 1234, helpful: { count: 89, rate: "87%" }, updated: "10.12.2024", tags: ["Login", "Passwort"] },
  { id: "KB-0178", title: "Release Notes v2.4.1", category: "Release Notes", module: "Allgemein", views: 2341, helpful: { count: 234, rate: "96%" }, updated: "08.12.2024", tags: ["Release", "v2.4.1"] },
  { id: "KB-0045", title: "Wie exportiere ich Berichte?", category: "FAQ", module: "Berichte", views: 678, helpful: { count: 145, rate: "93%" }, updated: "05.12.2024", tags: ["Export", "Berichte"] },
];

const getCategoryBadge = (category: string) => {
  switch (category) {
    case "How-to": return <Badge className="bg-green-100 text-green-700 border-green-200">How-to</Badge>;
    case "Known Issues": return <Badge className="bg-red-100 text-red-700 border-red-200">Known Issues</Badge>;
    case "FAQ": return <Badge className="bg-blue-100 text-blue-700 border-blue-200">FAQ</Badge>;
    case "Release Notes": return <Badge className="bg-primary/10 text-primary border-primary/20">Release Notes</Badge>;
    default: return <Badge variant="outline">{category}</Badge>;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "FAQ": return <HelpCircle className="w-4 h-4" />;
    case "How-to": return <Book className="w-4 h-4" />;
    case "Release Notes": return <FileText className="w-4 h-4" />;
    case "Known Issues": return <Wrench className="w-4 h-4" />;
    default: return <FileQuestion className="w-4 h-4" />;
  }
};

const SupportKnowledgeBaseTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryTab, setCategoryTab] = useState("all");

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryTab === "all" || article.category === categoryTab;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Wissensdatenbank durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Artikel erstellen
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs value={categoryTab} onValueChange={setCategoryTab}>
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none p-0 h-auto">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2"
          >
            Alle
          </TabsTrigger>
          <TabsTrigger
            value="FAQ"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger
            value="How-to"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 flex items-center gap-2"
          >
            <Book className="w-4 h-4" />
            How-to
          </TabsTrigger>
          <TabsTrigger
            value="Release Notes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Release Notes
          </TabsTrigger>
          <TabsTrigger
            value="Known Issues"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 flex items-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            Known Issues
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">5</p>
            <p className="text-xs text-gray-500">Artikel gesamt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">3.233</p>
            <p className="text-xs text-gray-500">Views (Monat)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">92%</p>
            <p className="text-xs text-gray-500">Hilfreich-Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">18</p>
            <p className="text-xs text-gray-500">Artikel aus Tickets</p>
          </CardContent>
        </Card>
      </div>

      {/* Articles Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artikel</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Modul</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Hilfreich</TableHead>
                <TableHead>Aktualisiert</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow key={article.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-start gap-2">
                      {getCategoryIcon(article.category)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-medium">{article.id}</span>
                          <span className="text-sm text-gray-900">{article.title}</span>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {article.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs bg-gray-50">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(article.category)}</TableCell>
                  <TableCell className="text-sm">{article.module}</TableCell>
                  <TableCell className="text-sm">{article.views.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">
                    {article.helpful.count} ({article.helpful.rate})
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{article.updated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-gray-500">{filteredArticles.length} von {articles.length} Artikeln</p>
    </div>
  );
};

export default SupportKnowledgeBaseTab;
