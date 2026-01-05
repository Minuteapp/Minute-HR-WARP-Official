import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  Mail, 
  Globe, 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2,
  ExternalLink,
  Users,
  AlertTriangle,
  Clock,
  Save,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CommunicationChannel {
  id: string;
  type: 'email' | 'phone' | 'website' | 'social' | 'emergency';
  label: string;
  value: string;
  isPrimary: boolean;
  isPublic: boolean;
  department?: string;
}

interface ContactPerson {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone?: string;
  areas: string[];
}

export const CompanyCommunication = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const [channels, setChannels] = useState<CommunicationChannel[]>([
    {
      id: '1',
      type: 'email',
      label: 'Haupt-E-Mail',
      value: 'info@minute.de',
      isPrimary: true,
      isPublic: true
    },
    {
      id: '2',
      type: 'phone',
      label: 'Zentrale',
      value: '+49 30 12345678',
      isPrimary: true,
      isPublic: true
    },
    {
      id: '3',
      type: 'website',
      label: 'Unternehmenswebsite',
      value: 'https://www.minute.de',
      isPrimary: true,
      isPublic: true
    },
    {
      id: '4',
      type: 'emergency',
      label: 'Notfall-Hotline',
      value: '+49 30 99999999',
      isPrimary: false,
      isPublic: false
    },
    {
      id: '5',
      type: 'email',
      label: 'HR E-Mail',
      value: 'hr@minute.de',
      isPrimary: false,
      isPublic: true,
      department: 'HR'
    }
  ]);

  const [contacts] = useState<ContactPerson[]>([
    {
      id: '1',
      name: 'Sarah Weber',
      role: 'HR Leiterin',
      department: 'Personal',
      email: 'sarah.weber@minute.de',
      phone: '+49 30 12345679',
      areas: ['Bewerbungen', 'Mitarbeiterbetreuung', 'Onboarding']
    },
    {
      id: '2',
      name: 'Michael Tech',
      role: 'IT Leiter',
      department: 'IT',
      email: 'michael.tech@minute.de',
      phone: '+49 30 12345680',
      areas: ['Technischer Support', 'Systemadministration', 'Sicherheit']
    },
    {
      id: '3',
      name: 'Anna Legal',
      role: 'Rechtsabteilung',
      department: 'Legal',
      email: 'anna.legal@minute.de',
      areas: ['Rechtliche Fragen', 'Compliance', 'Verträge']
    }
  ]);

  const [socialMedia, setSocialMedia] = useState([
    { platform: 'LinkedIn', url: 'https://linkedin.com/company/minute', isActive: true },
    { platform: 'Twitter', url: 'https://twitter.com/minute_de', isActive: true },
    { platform: 'Facebook', url: 'https://facebook.com/minute.de', isActive: false },
    { platform: 'Instagram', url: 'https://instagram.com/minute_official', isActive: true }
  ]);

  const getChannelIcon = (type: CommunicationChannel['type']) => {
    const icons = {
      email: Mail,
      phone: Phone,
      website: Globe,
      social: MessageSquare,
      emergency: AlertTriangle
    };
    const Icon = icons[type];
    return <Icon className="h-4 w-4" />;
  };

  const getChannelColor = (type: CommunicationChannel['type']) => {
    const colors = {
      email: 'bg-blue-500',
      phone: 'bg-green-500',
      website: 'bg-purple-500',
      social: 'bg-pink-500',
      emergency: 'bg-red-500'
    };
    return colors[type];
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Kommunikationsdaten gespeichert",
      description: "Die Kommunikationskanäle wurden erfolgreich aktualisiert.",
    });
  };

  const handleAddChannel = () => {
    toast({
      title: "Kanal hinzugefügt",
      description: "Der neue Kommunikationskanal wurde erstellt.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Kommunikationskanäle</h3>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie offizielle Kommunikationswege und Ansprechpartner.
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                <X className="h-4 w-4 mr-2" />
                Abbrechen
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
              <Button onClick={handleAddChannel} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Kanal hinzufügen
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kommunikationskanäle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Offizielle Kanäle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {channels.map((channel) => (
              <div key={channel.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${getChannelColor(channel.type)} flex items-center justify-center text-white`}>
                      {getChannelIcon(channel.type)}
                    </div>
                    <div>
                      <p className="font-medium">{channel.label}</p>
                      {channel.department && (
                        <p className="text-xs text-muted-foreground">{channel.department}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {channel.isPrimary && (
                      <Badge variant="default" className="text-xs">Primär</Badge>
                    )}
                    {channel.isPublic && (
                      <Badge variant="secondary" className="text-xs">Öffentlich</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  {isEditing ? (
                    <Input 
                      value={channel.value} 
                      className="text-sm"
                      onChange={(e) => {
                        setChannels(channels.map(c => 
                          c.id === channel.id ? { ...c, value: e.target.value } : c
                        ));
                      }}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground font-mono">{channel.value}</p>
                  )}
                  
                  <div className="flex gap-1">
                    {channel.type === 'website' && (
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    {isEditing && (
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Social Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {socialMedia.map((social, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{social.platform}</p>
                    {isEditing ? (
                      <Input 
                        value={social.url} 
                        className="text-xs mt-1"
                        onChange={(e) => {
                          setSocialMedia(socialMedia.map((s, i) => 
                            i === index ? { ...s, url: e.target.value } : s
                          ));
                        }}
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground">{social.url}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={social.isActive ? "default" : "secondary"} className="text-xs">
                    {social.isActive ? "Aktiv" : "Inaktiv"}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {isEditing && (
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Social Media hinzufügen
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ansprechpartner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Interne Ansprechpartner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contacts.map((contact) => (
              <div key={contact.id} className="p-4 border rounded-lg space-y-3">
                <div>
                  <h4 className="font-medium">{contact.name}</h4>
                  <p className="text-sm text-muted-foreground">{contact.role}</p>
                  <Badge variant="outline" className="text-xs mt-1">{contact.department}</Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <span className="font-mono">{contact.email}</span>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <span className="font-mono">{contact.phone}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-medium mb-2">Zuständigkeitsbereiche:</p>
                  <div className="flex flex-wrap gap-1">
                    {contact.areas.map((area, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};