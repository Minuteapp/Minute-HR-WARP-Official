
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Gets the URL for the MINUTE logo from storage
 */
export async function getLogoUrl(supabase: SupabaseClient): Promise<string> {
  try {
    console.log("Attempting to get logo URL from storage");
    
    // Try to get the logo from the public bucket
    const { data: publicUrl } = await supabase
      .storage
      .from('public')
      .getPublicUrl('minute-logo.png');
    
    if (publicUrl && publicUrl.publicUrl) {
      console.log("Successfully retrieved logo URL:", publicUrl.publicUrl);
      return publicUrl.publicUrl;
    }
    
    console.log("Logo not found in storage, returning empty URL");
    return '';
  } catch (error) {
    console.error("Error getting logo URL:", error);
    return '';
  }
}
