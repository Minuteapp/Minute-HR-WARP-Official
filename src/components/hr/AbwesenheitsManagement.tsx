import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { Calendar, Plus, Clock, CheckCircle, XCircle, User } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAbwesenheitsarten, useAbwesenheitsantraege, useCreateAbwesenheitsantrag, useGenehmigenAbwesenheitsantrag, useAblehnenAbwesenheitsantrag } from '@/hooks/useAbwesenheit';
import AbwesenheitsStatistikDashboard from './AbwesenheitsStatistikDashboard';
import { AbwesenheitsantragFormData, GENEHMIGUNG_STATUS_OPTIONS } from '@/types/sprint1.types';

const AbwesenheitsManagement = () => {
  const { data: arten } = useAbwesenheitsarten();
  const { data: antraege, isLoading } = useAbwesenheitsantraege();
  const createAntrag = useCreateAbwesenheitsantrag();
  const genehmigen = useGenehmigenAbwesenheitsantrag();
  const ablehnen = useAblehnenAbwesenheitsantrag();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const antragForm = useForm<AbwesenheitsantragFormData>();

  const onCreateAntrag = (data: AbwesenheitsantragFormData) => {
    createAntrag.mutate(data, {
      onSuccess: () => {
        setShowCreateDialog(false);
        antragForm.reset();
      },
    });
  };

  const getStatusColor = (status: string) => {
    const option = GENEHMIGUNG_STATUS_OPTIONS.find(s => s.value === status);
    return option?.color || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <AbwesenheitsStatistikDashboard />
      
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Abwesenheitsmanagement</h2>
          <p className="text-muted-foreground">{antraege?.length || 0} Anträge</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Antrag stellen</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Abwesenheitsantrag stellen</DialogTitle>
            </DialogHeader>
            <form onSubmit={antragForm.handleSubmit(onCreateAntrag)} className="space-y-4">
              <div>
                <Label>Abwesenheitsart</Label>
                <Select onValueChange={(value) => antragForm.setValue('abwesenheitsart_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Art wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {arten?.map((art) => (
                      <SelectItem key={art.id} value={art.id}>
                        {art.name} ({art.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Von</Label>
                  <Input type="date" {...antragForm.register('start_datum', { required: true })} />
                </div>
                <div>
                  <Label>Bis</Label>
                  <Input type="date" {...antragForm.register('ende_datum', { required: true })} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="halber_tag"
                  {...antragForm.register('halber_tag')}
                  className="rounded"
                />
                <Label htmlFor="halber_tag">Halber Tag</Label>
              </div>
              <div>
                <Label>Grund</Label>
                <Textarea {...antragForm.register('grund')} placeholder="Grund für die Abwesenheit" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={createAntrag.isPending}>
                  {createAntrag.isPending ? 'Erstelle...' : 'Antrag stellen'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {antraege?.map((antrag) => (
          <Card key={antrag.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5" />
                    <h3 className="font-semibold">{arten?.find(art => art.id === antrag.abwesenheitsart_id)?.name || 'Unbekannte Art'}</h3>
                    <Badge className={getStatusColor(antrag.status)}>
                      {GENEHMIGUNG_STATUS_OPTIONS.find(s => s.value === antrag.status)?.label}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>#{antrag.antrag_nummer}</p>
                    <p>{format(new Date(antrag.start_datum), 'dd.MM.yyyy', { locale: de })} - {format(new Date(antrag.ende_datum), 'dd.MM.yyyy', { locale: de })}</p>
                    <p>{antrag.tage_gesamt} Tag(e)</p>
                    {antrag.grund && <p>Grund: {antrag.grund}</p>}
                  </div>
                </div>
                {antrag.status === 'eingereicht' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => genehmigen.mutate({ id: antrag.id })}>
                      <CheckCircle className="h-4 w-4 mr-1" />Genehmigen
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => ablehnen.mutate({ id: antrag.id, grund: 'Abgelehnt' })}>
                      <XCircle className="h-4 w-4 mr-1" />Ablehnen
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </div>
  );
};

export default AbwesenheitsManagement;