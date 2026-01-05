
import { supabase } from "@/integrations/supabase/client";

export const loadBackgroundMusicFile = async (musicFileName: string): Promise<string> => {
  if (!musicFileName || musicFileName === 'none') {
    console.log('No music filename provided or music is disabled');
    return '';
  }
  
  console.log('Loading background music:', musicFileName);

  try {
    // Hole die Asset-Informationen aus der Datenbank
    const { data: assets, error: dbError } = await supabase
      .from('voicemail_assets')
      .select('file_path')
      .eq('file_name', musicFileName)
      .eq('asset_type', 'background_music')
      .maybeSingle();

    if (dbError) {
      console.error('Database error:', dbError.message);
      console.error('Details:', dbError.details);
      throw new Error(`Datenbankfehler: ${dbError.message}`);
    }

    // Prüfe, ob ein Asset gefunden wurde
    if (!assets) {
      console.error('No asset found for:', musicFileName);
      throw new Error(`Musikdatei "${musicFileName}" nicht gefunden`);
    }

    console.log('Found asset:', assets);

    // Stelle sicher, dass der Pfad korrekt formatiert ist
    const filePath = assets.file_path;
    console.log('Attempting to download from path:', filePath);

    // Zuerst die Datei direkt herunterladen
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('audio')
      .download(filePath);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error('Fehler beim Laden der Musikdatei');
    }

    // Erstelle eine Blob-URL für die heruntergeladene Datei
    const blob = new Blob([fileData], { type: 'audio/mpeg' });
    const blobUrl = URL.createObjectURL(blob);

    console.log('Created blob URL for audio file:', blobUrl);
    return blobUrl;

  } catch (error) {
    console.error('Error in loadBackgroundMusicFile:', error);
    throw error;
  }
};
