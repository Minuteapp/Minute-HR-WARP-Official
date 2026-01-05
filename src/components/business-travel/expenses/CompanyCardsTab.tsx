import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CreditCard,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Building,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-300",
  blocked: "bg-red-100 text-red-700 border-red-300",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
  expired: "bg-gray-100 text-gray-700 border-gray-300",
};

const statusLabels: Record<string, string> = {
  active: "Aktiv",
  blocked: "Gesperrt",
  pending: "Ausstehend",
  expired: "Abgelaufen",
};

const transactionStatusIcons: Record<string, any> = {
  approved: { icon: CheckCircle, color: "text-green-600" },
  pending: { icon: Clock, color: "text-yellow-600" },
  flagged: { icon: AlertTriangle, color: "text-red-600" },
};

const categoryColors: Record<string, string> = {
  Unterkunft: "bg-blue-100 text-blue-700",
  Reise: "bg-purple-100 text-purple-700",
  IT: "bg-cyan-100 text-cyan-700",
  Bewirtung: "bg-orange-100 text-orange-700",
  Transport: "bg-green-100 text-green-700",
  Sonstiges: "bg-gray-100 text-gray-700",
};

export function CompanyCardsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  // Company Cards Query with Employee data
  const { data: companyCards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ["company-cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_cards")
        .select(`
          *,
          employees (
            id,
            first_name,
            last_name,
            department,
            position,
            profile_image,
            location
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Card Transactions Query
  const { data: cardTransactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["card-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_transactions")
        .select(`
          *,
          company_cards (
            card_number_last4,
            employees (
              first_name,
              last_name
            )
          )
        `)
        .order("transaction_date", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate statistics
  const activeCards = companyCards.filter(c => c.status === "active").length;
  const totalMonthlyVolume = companyCards.reduce((sum, c) => sum + (Number(c.current_spent) || 0), 0);
  const uniqueCardholders = new Set(companyCards.map(c => c.employee_id)).size;
  const flaggedTransactions = cardTransactions.filter(t => t.is_flagged).length;

  // Get unique departments and locations from cards
  const departments = [...new Set(companyCards.map(c => c.employees?.department).filter(Boolean))];
  const locations = [...new Set(companyCards.map(c => c.employees?.location).filter(Boolean))];

  // Filter cards
  const filteredCards = companyCards.filter(card => {
    const employee = card.employees;
    const fullName = `${employee?.first_name || ""} ${employee?.last_name || ""}`.toLowerCase();
    const matchesSearch = !searchQuery || 
      fullName.includes(searchQuery.toLowerCase()) ||
      (employee?.department || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee?.location || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = selectedDepartments.length === 0 || 
      selectedDepartments.includes(employee?.department || "");
    
    const matchesLocation = selectedLocations.length === 0 || 
      selectedLocations.includes(employee?.location || "");
    
    const matchesStatus = selectedStatus === "all" || card.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesLocation && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  const paginatedCards = filteredCards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleDepartment = (dept: string) => {
    setSelectedDepartments(prev => 
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const toggleLocation = (loc: string) => {
    setSelectedLocations(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const isLoading = cardsLoading || transactionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Firmenkarten-Verwaltung</h2>
          <p className="text-muted-foreground">Verwalten Sie {companyCards.length} Firmenkarten</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Neue Karte
          </Button>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Aktive Karten</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{activeCards}</p>
              <span className="text-xs text-green-600">+2 diese Woche</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Monatliches Volumen</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">
                {totalMonthlyVolume.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
              </p>
              <span className="text-xs text-muted-foreground">vs. Vormonat</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Karteninhaber</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{uniqueCardholders}</p>
              <span className="text-xs text-muted-foreground">24% aller Mitarbeiter</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Auffällige Transaktionen</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{flaggedTransactions}</p>
              <span className="text-xs text-red-600">Prüfung erforderlich</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search with Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Mitarbeiter suchen nach Name, Abteilung, Standort oder E-Mail... (${companyCards.length} Mitarbeiter)`}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
                {(selectedDepartments.length > 0 || selectedLocations.length > 0 || selectedStatus !== "all") && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedDepartments.length + selectedLocations.length + (selectedStatus !== "all" ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Abteilung
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {departments.map((dept) => (
                      <Badge
                        key={dept}
                        variant={selectedDepartments.includes(dept) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleDepartment(dept)}
                      >
                        {dept}
                      </Badge>
                    ))}
                    {departments.length === 0 && (
                      <span className="text-sm text-muted-foreground">Keine Abteilungen</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Standort
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((loc) => (
                      <Badge
                        key={loc}
                        variant={selectedLocations.includes(loc) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleLocation(loc)}
                      >
                        {loc}
                      </Badge>
                    ))}
                    {locations.length === 0 && (
                      <span className="text-sm text-muted-foreground">Keine Standorte</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={selectedStatus === "all" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedStatus("all")}
                    >
                      Alle
                    </Badge>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <Badge
                        key={key}
                        variant={selectedStatus === key ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedStatus(key)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setSelectedDepartments([]);
                    setSelectedLocations([]);
                    setSelectedStatus("all");
                  }}
                >
                  Filter zurücksetzen
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Main Content: 2-Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Cardholders Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Karteninhaber</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {filteredCards.length} aktive Karteninhaber in der Datenbank
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCards.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Keine Firmenkarten vorhanden</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Erstellen Sie neue Firmenkarten für Ihre Mitarbeiter.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Neue Karte erstellen
                  </Button>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mitarbeiter</TableHead>
                        <TableHead>Karte</TableHead>
                        <TableHead>Monatslimit</TableHead>
                        <TableHead>Ausgaben</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCards.map((card: any) => {
                        const employee = card.employees;
                        const spentPercent = (Number(card.current_spent) / Number(card.monthly_limit)) * 100;
                        const progressColor = spentPercent > 100 ? "bg-red-500" : spentPercent > 80 ? "bg-yellow-500" : "bg-green-500";

                        return (
                          <TableRow key={card.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarImage src={employee?.profile_image} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                    {(employee?.first_name?.[0] || "") + (employee?.last_name?.[0] || "")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {employee?.first_name} {employee?.last_name}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                                      {employee?.department || "–"}
                                    </Badge>
                                    <span>{employee?.location || "–"}</span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-mono text-sm">**** {card.card_number_last4}</p>
                                <p className="text-xs text-muted-foreground">{card.card_type}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">
                                {Number(card.monthly_limit).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span>
                                    {Number(card.current_spent).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                                  </span>
                                  <span className="text-muted-foreground">{spentPercent.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${progressColor} transition-all`}
                                    style={{ width: `${Math.min(spentPercent, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[card.status] || statusColors.active}>
                                {statusLabels[card.status] || card.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t mt-4">
                      <p className="text-sm text-muted-foreground">
                        Zeige {((currentPage - 1) * itemsPerPage) + 1} bis {Math.min(currentPage * itemsPerPage, filteredCards.length)} von {filteredCards.length} Karteninhabern
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => p - 1)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(p => p + 1)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Latest Transactions */}
        <div>
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Letzte Transaktionen</CardTitle>
              <p className="text-sm text-muted-foreground">Echtzeit-Transaktionsüberwachung</p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {cardTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">Keine Transaktionen vorhanden</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cardTransactions.map((tx: any) => {
                      const statusInfo = transactionStatusIcons[tx.status] || transactionStatusIcons.pending;
                      const StatusIcon = statusInfo.icon;
                      const employee = tx.company_cards?.employees;

                      return (
                        <div key={tx.id} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{tx.merchant_name}</span>
                              <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="text-muted-foreground">
                              {employee?.first_name} {employee?.last_name} • **** {tx.company_cards?.card_number_last4}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge className={categoryColors[tx.category] || categoryColors.Sonstiges}>
                              {tx.category || "Sonstiges"}
                            </Badge>
                            <div className="text-right">
                              <p className="font-semibold">
                                {Number(tx.amount).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {tx.transaction_date 
                                  ? new Date(tx.transaction_date).toLocaleString("de-DE", { 
                                      day: "2-digit", 
                                      month: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })
                                  : "–"
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <Shield className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <p className="font-medium">Sichere Kartenverwaltung</p>
          <p className="text-sm text-muted-foreground mb-3">
            Alle Kartendaten werden nach höchsten Sicherheitsstandards verwaltet. 
            Echtzeit-Überwachung und automatische Betrugserkennung schützen vor unberechtigten Transaktionen.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">PCI-DSS konform</Badge>
            <Badge variant="outline">3D Secure</Badge>
            <Badge variant="outline">Fraud Detection</Badge>
            <Badge variant="outline">Real-time Monitoring</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
