
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Search, Filter, ArrowLeft } from 'lucide-react';

const ExpensesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const expenses = [
    {
      id: 1,
      description: "Schulung: Projektmanagement",
      category: "Weiterbildung",
      amount: 1200,
      status: "Genehmigt",
      date: "2024-03-15"
    },
    {
      id: 2,
      description: "Dienstreise: Berlin",
      category: "Reisekosten",
      amount: 450,
      status: "Ausstehend",
      date: "2024-03-10"
    },
    {
      id: 3,
      description: "Büromaterial",
      category: "Bürobedarf",
      amount: 150,
      status: "Abgelehnt",
      date: "2024-03-05"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Genehmigt":
        return "bg-green-100 text-green-800";
      case "Ausstehend":
        return "bg-yellow-100 text-yellow-800";
      case "Abgelehnt":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/reports')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Ausgaben</h1>
          <p className="text-sm text-gray-500">Verwalten Sie Ihre Ausgaben und Abrechnungen</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              className="pl-9" 
              placeholder="Ausgaben suchen..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              <SelectItem value="travel">Reisekosten</SelectItem>
              <SelectItem value="training">Weiterbildung</SelectItem>
              <SelectItem value="office">Bürobedarf</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="approved">Genehmigt</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
              <SelectItem value="rejected">Abgelehnt</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neue Ausgabe
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ausgabenübersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="space-y-1">
                  <p className="font-medium">{expense.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{expense.category}</span>
                    <span className="mx-2">•</span>
                    <span>{expense.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">€{expense.amount}</span>
                  <Badge className={getStatusColor(expense.status)}>
                    {expense.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesPage;
