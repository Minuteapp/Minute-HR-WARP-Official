
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Checks if a user with the given email already exists
 * 
 * This function searches in the auth.users table using RPC to check if the email exists
 */
export async function checkIfUserExists(supabase: SupabaseClient, email: string): Promise<boolean> {
  try {
    console.log("Checking if user exists:", email);
    
    // First try to check in auth.users (which we can only do through RPC)
    // We'll use a simple RPC function that returns a boolean
    const { data, error } = await supabase.rpc(
      'check_email_exists',
      { email_to_check: email }
    );
    
    if (error) {
      console.error("Error checking if user exists via RPC:", error);
      
      // Fallback: Check in admin_invitations to see if the email has been used
      // This is less reliable but better than nothing
      const { data: invitationData, error: invitationError } = await supabase
        .from('admin_invitations')
        .select('id, status')
        .eq('email', email)
        .eq('status', 'accepted')
        .limit(1);
      
      if (invitationError) {
        console.error("Error checking admin_invitations:", invitationError);
        return false; // If we can't check, assume the user doesn't exist
      }
      
      // If we find an accepted invitation, the user likely exists
      return Array.isArray(invitationData) && invitationData.length > 0;
    }
    
    console.log("User existence check result:", data);
    return !!data; // Convert to boolean
  } catch (error) {
    console.error("Error in checkIfUserExists:", error);
    return false; // On error, assume user does not exist to continue the flow
  }
}
