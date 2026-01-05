import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PayType } from "@/hooks/usePayTypes";

interface PayTypeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payType?: PayType | null;
  onSubmit: (data: Partial<PayType>) => void;
}

export const PayTypeForm = ({ open, onOpenChange, payType, onSubmit }: PayTypeFormProps) => {
  const [formData, setFormData] = useState<Partial<PayType>>({
    name: '',
    component_type: 'base',
    amount: 0,
    currency: 'EUR',
    description: '',
    is_taxable: true,
    is_social_security: true,
    datev_account: '',
    is_active: true,
  });

  useEffect(() => {
    if (payType) {
      setFormData(payType);
    } else {
      setFormData({
        name: '',
        component_type: 'base',
        amount: 0,
        currency: 'EUR',
        description: '',
        is_taxable: true,
        is_social_security: true,
        datev_account: '',
        is_active: true,
      });
    }
  }, [payType, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{payType ? 'Lohnart bearbeiten' : 'Neue Lohnart'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Kategorie *</Label>
              <Select
                value={formData.component_type}
                onValueChange={(value: any) => setFormData({ ...formData, component_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">Grundgehalt</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="overtime">Überstunden</SelectItem>
                  <SelectItem value="benefit">Benefits</SelectItem>
                  <SelectItem value="deduction">Abzüge</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Standardbetrag</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Währung</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="datev_account">DATEV Konto</Label>
            <Input
              id="datev_account"
              value={formData.datev_account || ''}
              onChange={(e) => setFormData({ ...formData, datev_account: e.target.value })}
              placeholder="z.B. 4100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_taxable" className="cursor-pointer">Steuerpflichtig</Label>
              <Switch
                id="is_taxable"
                checked={formData.is_taxable}
                onCheckedChange={(checked) => setFormData({ ...formData, is_taxable: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_social_security" className="cursor-pointer">Sozialversicherungspflichtig</Label>
              <Switch
                id="is_social_security"
                checked={formData.is_social_security}
                onCheckedChange={(checked) => setFormData({ ...formData, is_social_security: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active" className="cursor-pointer">Aktiv</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit">
              {payType ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
