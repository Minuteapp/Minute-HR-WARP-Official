import { supabase } from "@/integrations/supabase/client";

export interface DocumentSignature {
  id: string;
  document_id: string;
  signer_id: string;
  signature_data: any;
  signature_type: 'digital' | 'electronic' | 'biometric';
  signature_timestamp: string;
  ip_address?: string;
  user_agent?: string;
  certificate_data?: any;
  is_valid: boolean;
  created_at: string;
}

export const documentSignatureService = {
  async createSignature(
    documentId: string, 
    signatureData: any, 
    signatureType: 'digital' | 'electronic' | 'biometric' = 'digital'
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated to sign documents');

    const { data, error } = await supabase
      .from('document_signatures')
      .insert({
        document_id: documentId,
        signer_id: user.id,
        signature_data: signatureData,
        signature_type: signatureType,
        ip_address: null, // Browser doesn't have direct access to IP
        user_agent: navigator.userAgent
      })
      .select()
      .single();

    if (error) throw error;

    // Update document signature status
    await supabase
      .from('documents')
      .update({
        signature_status: 'signed',
        signed_by: user.id,
        signed_at: new Date().toISOString()
      })
      .eq('id', documentId);

    return data as DocumentSignature;
  },

  async getDocumentSignatures(documentId: string) {
    const { data, error } = await supabase
      .from('document_signatures')
      .select(`
        *,
        signer:signer_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .eq('document_id', documentId)
      .order('signature_timestamp', { ascending: false });

    if (error) throw error;
    return data;
  },

  async verifySignature(signatureId: string) {
    const { data, error } = await supabase
      .from('document_signatures')
      .select('*')
      .eq('id', signatureId)
      .single();

    if (error) throw error;
    return data as DocumentSignature;
  }
};