
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.formData()
    const file = formData.get('file')
    const category = formData.get('category')
    const metadata = formData.get('metadata')

    if (!file) {
      throw new Error('No file uploaded')
    }

    const fileName = file.name
    const fileExt = fileName.split('.').pop()
    const filePath = `${category}/${crypto.randomUUID()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: user } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('No authenticated user')
    }

    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
        title: fileName,
        category: category,
        file_path: filePath,
        file_name: fileName,
        file_size: file.size,
        mime_type: file.type,
        created_by: user.id,
        metadata: metadata ? JSON.parse(metadata) : {}
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify({ success: true, document }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
