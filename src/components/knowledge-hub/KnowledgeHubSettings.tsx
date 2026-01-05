import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Globe, 
  GitBranch, 
  Bell, 
  Shield, 
  Link, 
  Save,
  CheckCircle,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useEffectiveSettings } from '@/hooks/useEffectiveSettings';

export const KnowledgeHubSettings = () => {
  const { settings, getValue, saveSettings, loading, isSaving } = useEffectiveSettings('knowledge-hub');
  
  // Allgemein
  const [language, setLanguage] = useState('de');
  const [autoTranslation, setAutoTranslation] = useState(true);
  const [timezone, setTimezone] = useState('europe-berlin');
  const [dateFormat, setDateFormat] = useState('dd-mm-yyyy');

  // KI & Suche
  const [aiSearch, setAiSearch] = useState(true);
  const [aiTraining, setAiTraining] = useState(false);
  const [gapDetection, setGapDetection] = useState(true);
  const [conflictDetection, setConflictDetection] = useState(true);
  const [aiModel, setAiModel] = useState('gpt4');
  const [searchDepth, setSearchDepth] = useState('deep');

  // Artikel-Workflow
  const [twoStageApproval, setTwoStageApproval] = useState(false);
  const [autoArchive, setAutoArchive] = useState(true);
  const [reviewCycle, setReviewCycle] = useState('quarterly');
  const [minQuality, setMinQuality] = useState('70');

  // Benachrichtigungen - E-Mail
  const [emailNewArticles, setEmailNewArticles] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [emailComments, setEmailComments] = useState(true);
  const [emailReviewReminders, setEmailReviewReminders] = useState(true);
  const [emailAiSuggestions, setEmailAiSuggestions] = useState(false);

  // Benachrichtigungen - In-App
  const [inAppNewComments, setInAppNewComments] = useState(true);
  const [inAppApproved, setInAppApproved] = useState(true);
  const [inAppQualityIssues, setInAppQualityIssues] = useState(true);
  const [digestFrequency, setDigestFrequency] = useState('daily');

  // Sicherheit
  const [encryption, setEncryption] = useState(true);
  const [auditLogging, setAuditLogging] = useState(true);
  const [accessLevel, setAccessLevel] = useState('team');
  const [dataRetention, setDataRetention] = useState('5-years');

  // Integrationen
  const [sharePointEnabled, setSharePointEnabled] = useState(true);
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [apiArticle, setApiArticle] = useState(true);
  const [apiAssistant, setApiAssistant] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');

  // Lade gespeicherte Einstellungen
  useEffect(() => {
    if (!loading && settings) {
      // Allgemein
      setLanguage(getValue('language', 'de'));
      setAutoTranslation(getValue('autoTranslation', true));
      setTimezone(getValue('timezone', 'europe-berlin'));
      setDateFormat(getValue('dateFormat', 'dd-mm-yyyy'));
      
      // KI & Suche
      setAiSearch(getValue('aiSearch', true));
      setAiTraining(getValue('aiTraining', false));
      setGapDetection(getValue('gapDetection', true));
      setConflictDetection(getValue('conflictDetection', true));
      setAiModel(getValue('aiModel', 'gpt4'));
      setSearchDepth(getValue('searchDepth', 'deep'));
      
      // Workflow
      setTwoStageApproval(getValue('twoStageApproval', false));
      setAutoArchive(getValue('autoArchive', true));
      setReviewCycle(getValue('reviewCycle', 'quarterly'));
      setMinQuality(getValue('minQuality', '70'));
      
      // E-Mail
      setEmailNewArticles(getValue('emailNewArticles', true));
      setEmailUpdates(getValue('emailUpdates', true));
      setEmailComments(getValue('emailComments', true));
      setEmailReviewReminders(getValue('emailReviewReminders', true));
      setEmailAiSuggestions(getValue('emailAiSuggestions', false));
      
      // In-App
      setInAppNewComments(getValue('inAppNewComments', true));
      setInAppApproved(getValue('inAppApproved', true));
      setInAppQualityIssues(getValue('inAppQualityIssues', true));
      setDigestFrequency(getValue('digestFrequency', 'daily'));
      
      // Sicherheit
      setEncryption(getValue('encryption', true));
      setAuditLogging(getValue('auditLogging', true));
      setAccessLevel(getValue('accessLevel', 'team'));
      setDataRetention(getValue('dataRetention', '5-years'));
      
      // Integrationen
      setSharePointEnabled(getValue('sharePointEnabled', true));
      setSlackEnabled(getValue('slackEnabled', false));
      setApiArticle(getValue('apiArticle', true));
      setApiAssistant(getValue('apiAssistant', true));
      setWebhookUrl(getValue('webhookUrl', ''));
    }
  }, [loading, settings, getValue]);

  const handleSave = async () => {
    const allSettings = {
      // Allgemein
      language,
      autoTranslation,
      timezone,
      dateFormat,
      // KI & Suche
      aiSearch,
      aiTraining,
      gapDetection,
      conflictDetection,
      aiModel,
      searchDepth,
      // Workflow
      twoStageApproval,
      autoArchive,
      reviewCycle,
      minQuality,
      // E-Mail
      emailNewArticles,
      emailUpdates,
      emailComments,
      emailReviewReminders,
      emailAiSuggestions,
      // In-App
      inAppNewComments,
      inAppApproved,
      inAppQualityIssues,
      digestFrequency,
      // Sicherheit
      encryption,
      auditLogging,
      accessLevel,
      dataRetention,
      // Integrationen
      sharePointEnabled,
      slackEnabled,
      apiArticle,
      apiAssistant,
      webhookUrl,
    };
    
    const success = await saveSettings(allSettings);
    if (success) {
      toast.success('Einstellungen erfolgreich gespeichert');
    } else {
      toast.error('Fehler beim Speichern der Einstellungen');
    }
  };

  const handleReset = () => {
    // Setze auf Standardwerte zurück
    setLanguage('de');
    setAutoTranslation(true);
    setTimezone('europe-berlin');
    setDateFormat('dd-mm-yyyy');
    setAiSearch(true);
    setAiTraining(false);
    setGapDetection(true);
    setConflictDetection(true);
    setAiModel('gpt4');
    setSearchDepth('deep');
    setTwoStageApproval(false);
    setAutoArchive(true);
    setReviewCycle('quarterly');
    setMinQuality('70');
    setEmailNewArticles(true);
    setEmailUpdates(true);
    setEmailComments(true);
    setEmailReviewReminders(true);
    setEmailAiSuggestions(false);
    setInAppNewComments(true);
    setInAppApproved(true);
    setInAppQualityIssues(true);
    setDigestFrequency('daily');
    setEncryption(true);
    setAuditLogging(true);
    setAccessLevel('team');
    setDataRetention('5-years');
    setSharePointEnabled(true);
    setSlackEnabled(false);
    setApiArticle(true);
    setApiAssistant(true);
    setWebhookUrl('');
    toast.info('Einstellungen zurückgesetzt');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Settings className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Knowledge Hub Einstellungen</h2>
              <p className="text-sm text-muted-foreground">Konfigurieren Sie Ihre Wissensdatenbank und KI-Governance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-Tabs */}
      <Tabs defaultValue="allgemein" className="w-full">
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
          <TabsTrigger 
            value="allgemein" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Allgemein
          </TabsTrigger>
          <TabsTrigger 
            value="ki-suche" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            KI & Suche
          </TabsTrigger>
          <TabsTrigger 
            value="workflow" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
          >
            <GitBranch className="h-4 w-4" />
            Workflow
          </TabsTrigger>
          <TabsTrigger 
            value="benachrichtigungen" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Benachrichtigungen
          </TabsTrigger>
          <TabsTrigger 
            value="sicherheit" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Sicherheit
          </TabsTrigger>
          <TabsTrigger 
            value="integrationen" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
          >
            <Link className="h-4 w-4" />
            Integrationen
          </TabsTrigger>
        </TabsList>

        {/* Allgemein Tab */}
        <TabsContent value="allgemein" className="mt-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Standardsprache */}
              <div className="space-y-2">
                <Label className="font-medium">Standardsprache</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Automatische Übersetzung */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Automatische Übersetzung</Label>
                  <p className="text-sm text-muted-foreground">Artikel automatisch in alle Unternehmenssprachen übersetzen</p>
                </div>
                <Switch checked={autoTranslation} onCheckedChange={setAutoTranslation} />
              </div>

              {/* Zeitzone */}
              <div className="space-y-2">
                <Label className="font-medium">Zeitzone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="europe-berlin">Europe/Berlin (UTC+1)</SelectItem>
                    <SelectItem value="europe-london">Europe/London (UTC+0)</SelectItem>
                    <SelectItem value="us-eastern">US/Eastern (UTC-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Datumsformat */}
              <div className="space-y-2">
                <Label className="font-medium">Datumsformat</Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd-mm-yyyy">DD.MM.YYYY</SelectItem>
                    <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KI & Suche Tab */}
        <TabsContent value="ki-suche" className="mt-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* KI-gestützte Suche */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">KI-gestützte Suche</Label>
                  <p className="text-sm text-muted-foreground">Semantische Suche mit Natural Language Processing</p>
                </div>
                <Switch checked={aiSearch} onCheckedChange={setAiSearch} />
              </div>

              {/* KI-Trainingsmodus */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">KI-Trainingsmodus</Label>
                  <p className="text-sm text-muted-foreground">System lernt aus Nutzerinteraktionen und verbessert Vorschläge</p>
                </div>
                <Switch checked={aiTraining} onCheckedChange={setAiTraining} />
              </div>

              {/* Automatische Lückenerkennung */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Automatische Lückenerkennung</Label>
                  <p className="text-sm text-muted-foreground">KI erkennt fehlende Themen basierend auf Suchanfragen</p>
                </div>
                <Switch checked={gapDetection} onCheckedChange={setGapDetection} />
              </div>

              {/* Richtlinien-Konflikterkennung */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Richtlinien-Konflikterkennung</Label>
                  <p className="text-sm text-muted-foreground">Automatische Erkennung von Widersprüchen zwischen Artikeln</p>
                </div>
                <Switch checked={conflictDetection} onCheckedChange={setConflictDetection} />
              </div>

              {/* KI-Modell */}
              <div className="space-y-2">
                <Label className="font-medium">KI-Modell</Label>
                <Select value={aiModel} onValueChange={setAiModel}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt4">GPT-4 (Empfohlen)</SelectItem>
                    <SelectItem value="gpt35">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gemini">Gemini Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Such-Tiefe */}
              <div className="space-y-2">
                <Label className="font-medium">Such-Tiefe</Label>
                <Select value={searchDepth} onValueChange={setSearchDepth}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shallow">Oberflächlich (nur Titel)</SelectItem>
                    <SelectItem value="medium">Mittel (Titel + Zusammenfassung)</SelectItem>
                    <SelectItem value="deep">Tief (kompletter Inhalt)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="mt-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Zweistufige Freigabe */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Zweistufige Freigabe</Label>
                  <p className="text-sm text-muted-foreground">Artikel benötigen Freigabe von Teamleiter UND HR-Admin</p>
                </div>
                <Switch checked={twoStageApproval} onCheckedChange={setTwoStageApproval} />
              </div>

              {/* Automatische Archivierung */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Automatische Archivierung</Label>
                  <p className="text-sm text-muted-foreground">Artikel älter als 2 Jahre werden automatisch archiviert</p>
                </div>
                <Switch checked={autoArchive} onCheckedChange={setAutoArchive} />
              </div>

              {/* Review-Zyklus */}
              <div className="space-y-2">
                <Label className="font-medium">Review-Zyklus</Label>
                <Select value={reviewCycle} onValueChange={setReviewCycle}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                    <SelectItem value="quarterly">Quartalsweise</SelectItem>
                    <SelectItem value="yearly">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Autoren werden erinnert, ihre Artikel zu überprüfen</p>
              </div>

              {/* Minimale Qualitätsbewertung */}
              <div className="space-y-2">
                <Label className="font-medium">Minimale Qualitätsbewertung</Label>
                <Select value={minQuality} onValueChange={setMinQuality}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50% (Niedrig)</SelectItem>
                    <SelectItem value="70">70% (Standard)</SelectItem>
                    <SelectItem value="85">85% (Hoch)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Artikel unter diesem Wert werden zur Überarbeitung markiert</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benachrichtigungen Tab */}
        <TabsContent value="benachrichtigungen" className="mt-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* E-Mail Benachrichtigungen */}
              <div className="space-y-4">
                <Label className="font-semibold text-base">E-Mail Benachrichtigungen</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Neue Artikel</Label>
                    <Switch checked={emailNewArticles} onCheckedChange={setEmailNewArticles} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Artikel-Updates</Label>
                    <Switch checked={emailUpdates} onCheckedChange={setEmailUpdates} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Kommentare</Label>
                    <Switch checked={emailComments} onCheckedChange={setEmailComments} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Review-Erinnerungen</Label>
                    <Switch checked={emailReviewReminders} onCheckedChange={setEmailReviewReminders} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>KI-Vorschläge</Label>
                    <Switch checked={emailAiSuggestions} onCheckedChange={setEmailAiSuggestions} />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t" />

              {/* In-App Benachrichtigungen */}
              <div className="space-y-4">
                <Label className="font-semibold text-base">In-App Benachrichtigungen</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Neue Kommentare</Label>
                    <Switch checked={inAppNewComments} onCheckedChange={setInAppNewComments} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Artikel genehmigt</Label>
                    <Switch checked={inAppApproved} onCheckedChange={setInAppApproved} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Qualitätsprobleme</Label>
                    <Switch checked={inAppQualityIssues} onCheckedChange={setInAppQualityIssues} />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t" />

              {/* Digest-Frequenz */}
              <div className="space-y-2">
                <Label className="font-medium">Digest-Frequenz</Label>
                <Select value={digestFrequency} onValueChange={setDigestFrequency}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Sofort</SelectItem>
                    <SelectItem value="daily">Täglich</SelectItem>
                    <SelectItem value="weekly">Wöchentlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sicherheit Tab */}
        <TabsContent value="sicherheit" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Ende-zu-Ende Verschlüsselung */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Ende-zu-Ende Verschlüsselung</Label>
                    <p className="text-sm text-muted-foreground">Vertrauliche Artikel werden verschlüsselt gespeichert</p>
                  </div>
                  <Switch checked={encryption} onCheckedChange={setEncryption} />
                </div>

                {/* Audit-Logging */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Audit-Logging</Label>
                    <p className="text-sm text-muted-foreground">Alle Zugriffe und Änderungen werden protokolliert</p>
                  </div>
                  <Switch checked={auditLogging} onCheckedChange={setAuditLogging} />
                </div>

                {/* Standard-Zugriffslevel */}
                <div className="space-y-2">
                  <Label className="font-medium">Standard-Zugriffslevel</Label>
                  <Select value={accessLevel} onValueChange={setAccessLevel}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Öffentlich (alle)</SelectItem>
                      <SelectItem value="team">Team (nur Abteilung)</SelectItem>
                      <SelectItem value="private">Privat (nur Autor)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Standardmäßige Sichtbarkeit neuer Artikel</p>
                </div>

                {/* Datenspeicherung */}
                <div className="space-y-2">
                  <Label className="font-medium">Datenspeicherung</Label>
                  <Select value={dataRetention} onValueChange={setDataRetention}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-year">1 Jahr</SelectItem>
                      <SelectItem value="3-years">3 Jahre</SelectItem>
                      <SelectItem value="5-years">5 Jahre</SelectItem>
                      <SelectItem value="10-years">10 Jahre</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">DSGVO-konform: Archivierte Daten werden nach dieser Zeit gelöscht</p>
                </div>
              </CardContent>
            </Card>

            {/* DSGVO Compliance Banner */}
            <div className="space-y-2">
              <Label className="font-medium">DSGVO-Compliance</Label>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">Alle Einstellungen entsprechen den DSGVO-Anforderungen</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Integrationen Tab */}
        <TabsContent value="integrationen" className="mt-6">
          <div className="space-y-6">
            {/* Microsoft 365 Section */}
            <div className="space-y-3">
              <Label className="font-semibold text-base">Microsoft 365</Label>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <Label className="font-medium">SharePoint Integration</Label>
                        <p className="text-sm text-muted-foreground">Artikel mit SharePoint synchronisieren</p>
                      </div>
                    </div>
                    <Switch checked={sharePointEnabled} onCheckedChange={setSharePointEnabled} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Slack Section */}
            <div className="space-y-3">
              <Label className="font-semibold text-base">Slack Integration</Label>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <Label className="font-medium">Slack Benachrichtigungen</Label>
                        <p className="text-sm text-muted-foreground">Updates in Slack-Kanäle posten</p>
                      </div>
                    </div>
                    <Switch checked={slackEnabled} onCheckedChange={setSlackEnabled} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* API-Schlüssel */}
            <div className="space-y-2">
              <Label className="font-semibold text-base">API-Schlüssel</Label>
              <Input 
                type="password" 
                value="••••••••••••••••••••••••" 
                readOnly
                className="font-mono w-full"
              />
              <p className="text-sm text-muted-foreground">Für externe Systeme, die auf die Knowledge Base zugreifen</p>
            </div>

            {/* API-Endpunkte */}
            <div className="space-y-3">
              <Label className="font-semibold text-base">API-Endpunkte</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <code className="text-sm font-mono">/api/knowledge/article</code>
                  <Switch checked={apiArticle} onCheckedChange={setApiArticle} />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <code className="text-sm font-mono">/api/knowledge/ai-assistant</code>
                  <Switch checked={apiAssistant} onCheckedChange={setApiAssistant} />
                </div>
              </div>
            </div>

            {/* Webhooks */}
            <div className="space-y-2">
              <Label className="font-semibold text-base">Webhooks</Label>
              <Textarea 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-system.com/webhook/knowledge"
                className="font-mono text-sm w-full"
              />
              <p className="text-sm text-muted-foreground">Webhook-URL für neue Artikel, Updates und Freigaben</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="ghost" onClick={handleReset}>
          Zurücksetzen
        </Button>
        <Button onClick={handleSave} className="bg-gray-900 text-white hover:bg-gray-800" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};
