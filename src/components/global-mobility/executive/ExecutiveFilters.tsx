
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";

interface ExecutiveFiltersProps {
  region: string;
  setRegion: (value: string) => void;
  zeitraum: string;
  setZeitraum: (value: string) => void;
  einheit: string;
  setEinheit: (value: string) => void;
  entsendungstyp: string;
  setEntsendungstyp: (value: string) => void;
}

export const ExecutiveFilters = ({
  region,
  setRegion,
  zeitraum,
  setZeitraum,
  einheit,
  setEinheit,
  entsendungstyp,
  setEntsendungstyp
}: ExecutiveFiltersProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-foreground mb-4">Filter & Ansichtsoptionen</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Region</label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Alle Regionen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Regionen</SelectItem>
                    <SelectItem value="europe">Europa</SelectItem>
                    <SelectItem value="asia">Asien</SelectItem>
                    <SelectItem value="americas">Amerika</SelectItem>
                    <SelectItem value="africa">Afrika</SelectItem>
                    <SelectItem value="oceania">Ozeanien</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Zeitraum</label>
                <Select value={zeitraum} onValueChange={setZeitraum}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Jahr bis heute" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ytd">Jahr bis heute</SelectItem>
                    <SelectItem value="q1">Q1</SelectItem>
                    <SelectItem value="q2">Q2</SelectItem>
                    <SelectItem value="q3">Q3</SelectItem>
                    <SelectItem value="q4">Q4</SelectItem>
                    <SelectItem value="last-year">Letztes Jahr</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Organisationseinheit</label>
                <Select value={einheit} onValueChange={setEinheit}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Alle Einheiten" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Einheiten</SelectItem>
                    <SelectItem value="hq">Hauptsitz</SelectItem>
                    <SelectItem value="sales">Vertrieb</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="finance">Finanzen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Entsendungstyp</label>
                <Select value={entsendungstyp} onValueChange={setEntsendungstyp}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Alle Typen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Typen</SelectItem>
                    <SelectItem value="short-term">Kurzzeit</SelectItem>
                    <SelectItem value="long-term">Langzeit</SelectItem>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="rotational">Rotation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button variant="outline" className="ml-6 self-end">
            <Download className="h-4 w-4 mr-2" />
            Dashboard exportieren
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
