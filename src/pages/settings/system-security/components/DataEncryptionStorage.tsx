import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Lock, Database, Cloud, Key, Download, Upload, Shield } from "lucide-react";

export default function DataEncryptionStorage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verschlüsselte Daten</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">AES-256 Verschlüsselung</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Speicher belegt</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 TB</div>
            <p className="text-xs text-muted-foreground">von 5 TB</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backup-Status</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">✓</div>
            <p className="text-xs text-muted-foreground">Letztes Backup: vor 2h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schlüssel-Rotation</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">90d</div>
            <p className="text-xs text-muted-foreground">Nächste Rotation</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Verschlüsselungseinstellungen</CardTitle>
            <CardDescription>
              Konfiguration der Datenverschlüsselung und Sicherheitsstandards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Ende-zu-Ende Verschlüsselung</div>
                  <div className="text-sm text-muted-foreground">
                    Alle Mitarbeiterdaten verschlüsselt speichern
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600">AES-256</Badge>
                  <Switch checked disabled />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Dokumentenverschlüsselung</div>
                  <div className="text-sm text-muted-foreground">
                    Uploaded Dateien automatisch verschlüsseln
                  </div>
                </div>
                <Switch checked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Transport Layer Security</div>
                  <div className="text-sm text-muted-foreground">
                    TLS 1.3 für alle Datenübertragungen
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600">TLS 1.3</Badge>
                  <Switch checked disabled />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Database Encryption at Rest</div>
                  <div className="text-sm text-muted-foreground">
                    Verschlüsselung der Datenbank auf Speicherebene
                  </div>
                </div>
                <Switch checked />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="encryption-algorithm">Verschlüsselungsalgorithmus</Label>
              <Select defaultValue="aes256">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aes256">AES-256 (empfohlen)</SelectItem>
                  <SelectItem value="aes128">AES-128</SelectItem>
                  <SelectItem value="chacha20">ChaCha20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="key-derivation">Schlüssel-Ableitung</Label>
              <Select defaultValue="pbkdf2">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pbkdf2">PBKDF2</SelectItem>
                  <SelectItem value="scrypt">Scrypt</SelectItem>
                  <SelectItem value="argon2">Argon2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Speicherregionen & DSGVO</CardTitle>
            <CardDescription>
              Konfiguration der Datenspeicherung und Compliance-Einstellungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primary-region">Primäre Speicherregion</Label>
              <Select defaultValue="eu-central">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eu-central">🇪🇺 EU-Central (Frankfurt)</SelectItem>
                  <SelectItem value="eu-west">🇪🇺 EU-West (Dublin)</SelectItem>
                  <SelectItem value="eu-north">🇪🇺 EU-North (Stockholm)</SelectItem>
                  <SelectItem value="ch-central">🇨🇭 Switzerland Central</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-region">Backup-Region</Label>
              <Select defaultValue="eu-west">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eu-west">🇪🇺 EU-West (Dublin)</SelectItem>
                  <SelectItem value="eu-north">🇪🇺 EU-North (Stockholm)</SelectItem>
                  <SelectItem value="ch-central">🇨🇭 Switzerland Central</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">DSGVO-Compliance</div>
                  <div className="text-sm text-muted-foreground">
                    Nur EU-Server verwenden
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600">Aktiv</Badge>
                  <Switch checked />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Cross-Border Transfer</div>
                  <div className="text-sm text-muted-foreground">
                    Datenübertragung außerhalb der EU
                  </div>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Data Residency Lock</div>
                  <div className="text-sm text-muted-foreground">
                    Daten dürfen Region nicht verlassen
                  </div>
                </div>
                <Switch checked />
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">DSGVO-konform</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Alle Daten werden gemäß EU-DSGVO verarbeitet und gespeichert.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Backup & Restore</CardTitle>
            <CardDescription>
              Automatische Sicherungen und Wiederherstellungsoptionen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup-Häufigkeit</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Stündlich</SelectItem>
                  <SelectItem value="daily">Täglich (empfohlen)</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention-period">Aufbewahrungsdauer</Label>
              <Select defaultValue="90days">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30days">30 Tage</SelectItem>
                  <SelectItem value="90days">90 Tage</SelectItem>
                  <SelectItem value="1year">1 Jahr</SelectItem>
                  <SelectItem value="3years">3 Jahre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Backup-Fortschritt</Label>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <Progress value={85} />
            </div>

            <div className="space-y-2">
              <Label>Letztes Backup</Label>
              <div className="p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">15.01.2024, 02:30</div>
                    <div className="text-sm text-muted-foreground">2.1 GB • Erfolgreich</div>
                  </div>
                  <Badge variant="outline" className="text-green-600">Erfolgreich</Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Backup jetzt erstellen
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Wiederherstellen
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schlüssel-Management</CardTitle>
            <CardDescription>
              Verwaltung der Verschlüsselungsschlüssel und Sicherheitsrichtlinien
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Automatische Schlüssel-Rotation</div>
                  <div className="text-sm text-muted-foreground">
                    Regelmäßige Erneuerung der Verschlüsselungsschlüssel
                  </div>
                </div>
                <Switch checked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rotation-interval">Rotations-Intervall</Label>
                <Select defaultValue="90days">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30days">30 Tage</SelectItem>
                    <SelectItem value="90days">90 Tage (empfohlen)</SelectItem>
                    <SelectItem value="180days">180 Tage</SelectItem>
                    <SelectItem value="365days">1 Jahr</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Hardware Security Module</div>
                  <div className="text-sm text-muted-foreground">
                    Schlüssel in dedizierter Hardware speichern
                  </div>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Unternehmens-Masterschlüssel</div>
                  <div className="text-sm text-muted-foreground">
                    Eigene Schlüssel für zusätzliche Kontrolle
                  </div>
                </div>
                <Switch />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Aktueller Hauptschlüssel</Label>
              <div className="p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-sm">KEY-2024-001</div>
                    <div className="text-sm text-muted-foreground">Erstellt: 01.01.2024</div>
                  </div>
                  <Badge variant="outline" className="text-green-600">Aktiv</Badge>
                </div>
              </div>
            </div>

            <Button className="w-full">
              <Key className="h-4 w-4 mr-2" />
              Neue Schlüssel generieren
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}