
import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads the MINUTE logo to public bucket for use in emails if it doesn't exist yet
 */
export const uploadLogo = async (): Promise<void> => {
  try {
    console.log("Checking if logo exists in storage...");
    
    // Prüfen, ob der public Bucket existiert
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error("Error checking storage buckets:", bucketsError);
      return;
    }
    
    const publicBucketExists = buckets?.some(bucket => bucket.name === 'public');
    
    if (!publicBucketExists) {
      console.log("Public bucket doesn't exist, creating it...");
      // Versuche den Bucket als Administrator zu erstellen
      const { error: createBucketError } = await supabase.rpc(
        'create_public_storage_bucket',
        { bucket_name: 'public' }
      );
      
      if (createBucketError) {
        console.error("Error creating public bucket via RPC:", createBucketError);
        // Fallback-Versuch, den Bucket direkt zu erstellen
        const { error: directCreateError } = await supabase
          .storage
          .createBucket('public', { public: true });
        
        if (directCreateError) {
          console.error("Error creating public bucket directly:", directCreateError);
          return;
        }
      }
      console.log("Public bucket created successfully");
    }
    
    // Prüfen, ob das Logo bereits existiert
    const { data: existingFile, error: checkError } = await supabase
      .storage
      .from('public')
      .list('', {
        search: 'minute-logo.png'
      });
    
    if (checkError) {
      console.error("Error checking for logo:", checkError);
      return;
    }
    
    // Wenn das Logo bereits existiert, nicht erneut hochladen
    if (existingFile && existingFile.length > 0) {
      console.log("Logo already exists in storage");
      return;
    }
    
    // Logo aus dem Bild hochladen
    const logoResponse = await fetch('/lovable-uploads/bef503cb-bb90-4755-b33e-e6aa8f556d00.png');
    
    if (!logoResponse.ok) {
      // Versuche als Fallback das Logo aus dem public Ordner zu laden
      const fallbackLogoResponse = await fetch('/lovable-uploads/e94b8f7b-0299-4cad-9b4a-a8e92def4bd3.png');
      
      if (!fallbackLogoResponse.ok) {
        throw new Error(`Failed to fetch logo: ${logoResponse.statusText}`);
      }
      
      const logoBlob = await fallbackLogoResponse.blob();
      
      // In Public-Bucket hochladen
      const { error: uploadError } = await supabase
        .storage
        .from('public')
        .upload('minute-logo.png', logoBlob, {
          contentType: 'image/png',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
    } else {
      const logoBlob = await logoResponse.blob();
      
      // In Public-Bucket hochladen
      const { error: uploadError } = await supabase
        .storage
        .from('public')
        .upload('minute-logo.png', logoBlob, {
          contentType: 'image/png',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
    }
    
    console.log("Logo uploaded successfully");
  } catch (error) {
    console.error("Error uploading logo:", error);
  }
};
