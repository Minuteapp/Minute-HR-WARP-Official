import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { PayType } from "@/hooks/usePayTypes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface PayTypesListProps {
  payTypes: PayType[];
  onEdit: (payType: PayType) => void;
  onDelete: (id: string) => void;
}

const typeLabels: Record<string, string> = {
  base: 'Grundgehalt',
  bonus: 'Bonus',
  overtime: 'Überstunden',
  benefit: 'Benefits',
  deduction: 'Abzüge',
};

const typeColors: Record<string, string> = {
  base: 'bg-blue-500',
  bonus: 'bg-green-500',
  overtime: 'bg-yellow-500',
  benefit: 'bg-purple-500',
  deduction: 'bg-red-500',
};

export const PayTypesList = ({ payTypes, onEdit, onDelete }: PayTypesListProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Standardbetrag</TableHead>
              <TableHead>DATEV Konto</TableHead>
              <TableHead className="text-center">Steuer</TableHead>
              <TableHead className="text-center">SV</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Keine Lohnarten gefunden
                </TableCell>
              </TableRow>
            ) : (
              payTypes.map((payType) => (
                <TableRow key={payType.id}>
                  <TableCell className="font-medium">{payType.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={typeColors[payType.component_type]}>
                      {typeLabels[payType.component_type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {payType.amount.toFixed(2)} {payType.currency}
                  </TableCell>
                  <TableCell>{payType.datev_account || '-'}</TableCell>
                  <TableCell className="text-center">
                    {payType.is_taxable ? '✓' : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {payType.is_social_security ? '✓' : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={payType.is_active ? 'default' : 'secondary'}>
                      {payType.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(payType)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(payType.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lohnart löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Lohnart wird permanent gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
