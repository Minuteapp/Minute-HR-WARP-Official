
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { PersonalDataForm } from "./PersonalDataForm";
import { MobileDataForm } from "./MobileDataForm";
import { ContactDataForm } from "./ContactDataForm";

type Salutation = "Herr" | "Frau" | "Divers";

interface PersonalData {
  anrede: Salutation | '';
  akademischerTitel: string;
  vorname: string;
  nachname: string;
  gesprochenWie: string;
  provider: string;
  mobileRufnummer: string;
  email: string;
  sprache: 'Deutsch' | 'English';
}

const VoicemailPersonal = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<PersonalData>({
    anrede: '',
    akademischerTitel: '',
    vorname: '',
    nachname: '',
    gesprochenWie: '',
    provider: '',
    mobileRufnummer: '',
    email: '',
    sprache: 'Deutsch'
  });

  useEffect(() => {
    loadPersonalData();
  }, []);

  const loadPersonalData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('voicemail_personal_data')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading personal data:', error);
        toast({
          title: "Fehler beim Laden",
          description: "Ihre persönlichen Daten konnten nicht geladen werden.",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setFormData({
          anrede: (data.salutation as Salutation) || '',
          akademischerTitel: data.academic_title || '',
          vorname: data.first_name || '',
          nachname: data.last_name || '',
          gesprochenWie: data.spoken_as || '',
          provider: data.mobile_provider || '',
          mobileRufnummer: data.mobile_number || '',
          email: data.email || '',
          sprache: data.language === 'de' ? 'Deutsch' : 'English'
        });
      }
    } catch (error) {
      console.error('Error loading personal data:', error);
      toast({
        title: "Fehler beim Laden",
        description: "Ihre persönlichen Daten konnten nicht geladen werden.",
        variant: "destructive"
      });
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht eingeloggt');

      const { data: existingData } = await supabase
        .from('voicemail_personal_data')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const personalData = {
        user_id: user.id,
        salutation: formData.anrede || null,
        academic_title: formData.akademischerTitel,
        first_name: formData.vorname,
        last_name: formData.nachname,
        spoken_as: formData.gesprochenWie,
        mobile_provider: formData.provider,
        mobile_number: formData.mobileRufnummer,
        email: formData.email,
        language: formData.sprache === 'Deutsch' ? 'de' : 'en'
      };

      let error;
      if (existingData) {
        ({ error } = await supabase
          .from('voicemail_personal_data')
          .update(personalData)
          .eq('user_id', user.id));
      } else {
        ({ error } = await supabase
          .from('voicemail_personal_data')
          .insert([personalData]));
      }

      if (error) throw error;

      toast({
        title: "Erfolgreich gespeichert",
        description: "Ihre persönlichen Daten wurden aktualisiert.",
      });
      setIsEditing(false);
      loadPersonalData();
    } catch (error) {
      console.error('Error saving personal data:', error);
      toast({
        title: "Fehler",
        description: "Ihre Daten konnten nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadPersonalData();
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg border border-[#FF6B00] p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Persönliche Daten</h2>
          {!isEditing && (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90"
            >
              Bearbeiten
            </Button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <PersonalDataForm 
            anrede={formData.anrede}
            akademischerTitel={formData.akademischerTitel}
            vorname={formData.vorname}
            nachname={formData.nachname}
            gesprochenWie={formData.gesprochenWie}
            isEditing={isEditing}
            onFieldChange={handleFieldChange}
          />

          <MobileDataForm 
            provider={formData.provider}
            mobileRufnummer={formData.mobileRufnummer}
            isEditing={isEditing}
            onFieldChange={handleFieldChange}
          />

          <ContactDataForm 
            email={formData.email}
            sprache={formData.sprache}
            isEditing={isEditing}
            onFieldChange={handleFieldChange}
          />

          {isEditing && (
            <div className="flex justify-start gap-4 mt-6">
              <Button 
                type="submit" 
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90"
              >
                Speichern
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={handleCancel}
              >
                Abbrechen
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default VoicemailPersonal;
