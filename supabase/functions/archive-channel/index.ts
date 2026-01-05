import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { channelId, reason, retentionDays = 365, legalHold = false } = await req.json();

    if (!channelId) {
      return new Response(JSON.stringify({ error: 'Channel ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Archiving channel ${channelId} by user ${user.id}`);

    // Get channel info
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .single();

    if (channelError || !channel) {
      return new Response(JSON.stringify({ error: 'Channel not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all messages from the channel
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        sender_id,
        created_at,
        message_type,
        metadata
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
    }

    // Get channel members
    const { data: members, error: membersError } = await supabase
      .from('channel_members')
      .select('user_id, role, joined_at')
      .eq('channel_id', channelId);

    if (membersError) {
      console.error('Error fetching members:', membersError);
    }

    // Create archive content as JSON
    const archiveContent = JSON.stringify({
      channel: {
        id: channel.id,
        name: channel.name,
        description: channel.description,
        type: channel.type,
        created_at: channel.created_at,
      },
      messages: messages || [],
      members: members || [],
      archiveMetadata: {
        reason,
        retentionDays,
        legalHold,
        archivedAt: new Date().toISOString(),
        archivedBy: user.id,
      },
    }, null, 2);

    // Get project_id from channel metadata or use a default
    const projectId = channel.metadata?.project_id || channel.id;

    // Insert into chat_archives
    const { data: archive, error: archiveError } = await supabase
      .from('chat_archives')
      .insert({
        channel_id: channelId,
        archived_by: user.id,
        archive_date: new Date().toISOString(),
        content: archiveContent,
        message_count: messages?.length || 0,
        participants: members || [],
        project_id: projectId,
      })
      .select()
      .single();

    if (archiveError) {
      console.error('Error creating archive:', archiveError);
      return new Response(JSON.stringify({ error: 'Failed to create archive' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Archive created with ID: ${archive.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      archiveId: archive.id,
      messageCount: messages?.length || 0,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Archive channel error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
