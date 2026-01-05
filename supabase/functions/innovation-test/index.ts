import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('🧪 Starting Innovation Hub Tests...');

    // Test 1: Erstelle eine neue Idee mit Service Role (umgeht RLS)
    const testIdea = {
      title: 'KI-gestützte Personaleinsatzplanung',
      description: 'Entwicklung eines KI-Systems zur optimalen Personalplanung basierend auf historischen Daten, Abwesenheitsmustern und Arbeitslasten. Das System soll automatisch Schichtpläne erstellen und Engpässe vorhersagen.',
      tags: ['Tech', 'Automation', 'HR'],
      impact_score: 8,
      complexity_score: 6,
      status: 'new',
      submitter_id: 'system-test'
    };

    console.log('📝 Creating test idea:', testIdea.title);

    const { data: newIdea, error: ideaError } = await supabaseClient
      .from('innovation_ideas')
      .insert(testIdea)
      .select()
      .single();

    if (ideaError) {
      console.error('❌ Error creating idea:', ideaError);
      throw ideaError;
    }

    console.log('✅ Idea created successfully:', newIdea.id);

    // Test 2: Erstelle ein neues Pilotprojekt mit Service Role
    const testPilotProject = {
      title: 'Pilot: Smart Workforce Analytics',
      description: 'Pilotprojekt zur Erprobung der KI-gestützten Personaleinsatzplanung in der IT-Abteilung. Testen der Algorithmen mit realen Daten über 3 Monate.',
      idea_id: newIdea.id,
      status: 'preparing',
      start_date: '2024-02-01',
      end_date: '2024-04-30',
      budget: 25000,
      responsible_person: 'Dr. Sarah Mueller',
      team_members: ['Max Mustermann', 'Anna Schmidt', 'Tom Wilson'],
      success_metrics: [
        'Reduzierung der Planungszeit um 40%',
        'Verbesserung der Mitarbeiterzufriedenheit um 15%',
        'Reduzierung von Über-/Unterbesetzung um 30%'
      ],
      risk_assessment: 'Mittleres Risiko: Abhängigkeit von Datenqualität, mögliche Akzeptanzprobleme bei Mitarbeitern',
      created_by: 'system-test'
    };

    console.log('🚀 Creating test pilot project:', testPilotProject.title);

    const { data: newPilotProject, error: pilotError } = await supabaseClient
      .from('pilot_projects')
      .insert(testPilotProject)
      .select()
      .single();

    if (pilotError) {
      console.error('❌ Error creating pilot project:', pilotError);
      throw pilotError;
    }

    console.log('✅ Pilot project created successfully:', newPilotProject.id);

    // Test 3: Füge einen Vote zur Idee hinzu (Service Role kann alles)
    const { error: voteError } = await supabaseClient
      .from('innovation_votes')
      .insert({
        idea_id: newIdea.id,
        voter_id: 'system-test',
        score: 5,
        vote_type: 'upvote'
      });

    if (voteError) {
      console.error('❌ Error adding vote:', voteError);
    } else {
      console.log('✅ Vote added successfully');
    }

    // Test 4: Füge einen Kommentar zur Idee hinzu (Service Role kann alles)
    const { error: commentError } = await supabaseClient
      .from('innovation_comments')
      .insert({
        idea_id: newIdea.id,
        commenter_id: 'system-test',
        comment_text: 'Excellent idea! This could revolutionize our workforce management. I suggest we also consider integration with our existing HR systems.'
      });

    if (commentError) {
      console.error('❌ Error adding comment:', commentError);
    } else {
      console.log('✅ Comment added successfully');
    }

    // Test 5: Hole alle Ideen und Pilotprojekte
    const { data: allIdeas, error: fetchIdeasError } = await supabaseClient
      .from('innovation_ideas')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: allPilotProjects, error: fetchPilotError } = await supabaseClient
      .from('pilot_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchIdeasError || fetchPilotError) {
      console.error('❌ Error fetching data:', fetchIdeasError || fetchPilotError);
    } else {
      console.log(`✅ Found ${allIdeas?.length || 0} ideas and ${allPilotProjects?.length || 0} pilot projects`);
    }

    const testResults = {
      success: true,
      message: 'Innovation Hub Tests completed successfully! 🎉',
      results: {
        newIdea: {
          id: newIdea.id,
          title: newIdea.title,
          status: newIdea.status,
          impact_score: newIdea.impact_score,
          complexity_score: newIdea.complexity_score
        },
        newPilotProject: {
          id: newPilotProject.id,
          title: newPilotProject.title,
          status: newPilotProject.status,
          budget: newPilotProject.budget,
          team_size: newPilotProject.team_members?.length || 0
        },
        summary: {
          total_ideas: allIdeas?.length || 0,
          total_pilot_projects: allPilotProjects?.length || 0,
          latest_idea_title: allIdeas?.[0]?.title,
          latest_pilot_title: allPilotProjects?.[0]?.title
        }
      },
      timestamp: new Date().toISOString()
    };

    console.log('🏁 Test Summary:', testResults.results.summary);

    return new Response(
      JSON.stringify(testResults, null, 2),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('💥 Test failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});