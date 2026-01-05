
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text, voice_id } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    if (!voice_id) {
      throw new Error('Voice ID is required')
    }

    const elevenlabsKey = Deno.env.get('ELEVEN_LABS_API_KEY')
    if (!elevenlabsKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    try {
      console.log('Calling ElevenLabs API...')
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenlabsKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ElevenLabs API error:', errorText)
        throw new Error(`Failed to generate speech: ${errorText}`)
      }

      console.log('Successfully generated audio, processing response...')
      const audioBuffer = await response.arrayBuffer()
      
      // Convert ArrayBuffer to Base64 string in chunks to prevent stack overflow
      const chunks = [];
      const uint8Array = new Uint8Array(audioBuffer);
      const chunkSize = 32768; // Process in 32KB chunks
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
      }
      
      const audioBase64 = btoa(chunks.join(''));

      // Generate a unique filename
      const timestamp = new Date().getTime()
      const randomString = Math.random().toString(36).substring(7)
      const filename = `${timestamp}-${randomString}.mp3`

      console.log('Uploading to Supabase Storage...')
      const { data: storageData, error: storageError } = await supabaseClient.storage
        .from('voicemail-audio')
        .upload(filename, audioBuffer, {
          contentType: 'audio/mpeg',
          cacheControl: '3600'
        })

      if (storageError) {
        console.error('Storage error:', storageError)
        throw new Error(`Failed to store audio: ${storageError.message}`)
      }

      console.log('Getting public URL...')
      const { data: { publicUrl } } = supabaseClient.storage
        .from('voicemail-audio')
        .getPublicUrl(filename)

      console.log('Successfully completed text-to-speech process')
      return new Response(
        JSON.stringify({ 
          audioContent: audioBase64,
          audioUrl: publicUrl 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )

    } catch (error) {
      console.error('Error in text-to-speech generation:', error)
      throw error
    }

  } catch (error) {
    console.error('Error in text-to-speech function:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
