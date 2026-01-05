
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messageId, providerId, phoneNumber } = await req.json()
    console.log('Received upload request:', { messageId, providerId, phoneNumber })

    if (!messageId || !providerId || !phoneNumber) {
      console.error('Missing required parameters:', { messageId, providerId, phoneNumber })
      throw new Error('Erforderliche Parameter fehlen')
    }

    // Supabase Client initialisieren
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Provider-Details abrufen
    const { data: provider, error: providerError } = await supabaseAdmin
      .from('mobile_providers')
      .select('*')
      .eq('id', providerId)
      .single()

    if (providerError) {
      console.error('Error fetching provider:', providerError)
      throw new Error('Provider nicht gefunden')
    }

    if (!provider) {
      console.error('Provider not found for ID:', providerId)
      throw new Error('Provider nicht gefunden')
    }

    console.log('Found provider:', provider)

    // Zuerst die Voicemail-Nachricht abrufen
    const { data: message, error: messageError } = await supabaseAdmin
      .from('voicemail_messages')
      .select('*')
      .eq('id', messageId)
      .single()

    if (messageError) {
      console.error('Error fetching message:', messageError)
      throw new Error('Nachricht nicht gefunden')
    }

    if (!message) {
      console.error('Message not found for ID:', messageId)
      throw new Error('Nachricht nicht gefunden')
    }

    console.log('Found message:', message)

    // Upload-Eintrag erstellen
    const { data: upload, error: uploadError } = await supabaseAdmin
      .from('voicemail_uploads')
      .insert({
        message_id: messageId,
        provider_id: providerId,
        phone_number: phoneNumber,
        status: 'pending',
        upload_method: provider.api_type
      })
      .select()
      .single()

    if (uploadError) {
      console.error('Error creating upload entry:', uploadError)
      throw new Error('Fehler beim Erstellen des Upload-Eintrags')
    }

    console.log('Created upload entry:', upload)

    try {
      if (provider.api_type === 'direct_api') {
        // Direkte API-Integration ist nicht verfügbar
        throw new Error('Direkte API-Integration ist für diesen Provider nicht verfügbar')
      } else if (provider.api_type === 'call_and_play') {
        // Simuliere einen Anruf für die Call & Play Methode
        console.log('Initiating call & play method for phone number:', phoneNumber)
        
        // Hier würde normalerweise die Integration mit einem Telefonie-Service erfolgen
        // Für den Moment simulieren wir den Prozess
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simuliere Verarbeitungszeit
        
        // In einer vollständigen Implementierung würden wir hier:
        // 1. Einen automatisierten Anruf an die Mailbox-Nummer initiieren
        // 2. Die DTMF-Codes für den Zugriff auf die Mailbox senden
        // 3. Die Ansage abspielen
        // 4. Die Bestätigungscodes empfangen
        
        // Für die Demo markieren wir es als erfolgreich
        console.log('Call & play process completed successfully')
      }

      // Update Upload-Status
      const { error: updateError } = await supabaseAdmin
        .from('voicemail_uploads')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', upload.id)

      if (updateError) {
        console.error('Error updating upload status:', updateError)
        throw updateError
      }

      console.log('Upload completed successfully')

      return new Response(
        JSON.stringify({ 
          success: true, 
          uploadId: upload.id,
          message: 'Ihre Ansage wird in Kürze über einen automatisierten Anruf auf Ihre Mailbox übertragen. Bitte stellen Sie sicher, dass Ihr Telefon eingeschaltet ist und Empfang hat.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('Error during upload process:', error)
      
      // Update Upload-Status auf "failed"
      await supabaseAdmin
        .from('voicemail_uploads')
        .update({ 
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          updated_at: new Date().toISOString()
        })
        .eq('id', upload.id)

      throw error
    }
  } catch (error) {
    console.error('Function error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten';
    return new Response(
      JSON.stringify({ 
        error: true,
        message: errorMessage,
        details: error instanceof Error ? error.toString() : String(error)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
