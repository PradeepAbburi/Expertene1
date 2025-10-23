import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface AnalyticsEvent {
  event_type: string
  article_id?: string
  target_user_id?: string
  metadata?: Record<string, any>
}

Deno.serve(async (req) => {
  console.log('Analytics function called', req.method)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    let userId = null
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
      userId = user?.id
    }

    const { event_type, article_id, target_user_id, metadata = {} }: AnalyticsEvent = await req.json()

    console.log('Recording analytics event:', { event_type, article_id, target_user_id, userId })

    // Get client info
    const userAgent = req.headers.get('User-Agent')
    const forwardedFor = req.headers.get('X-Forwarded-For')
    const realIp = req.headers.get('X-Real-IP')
    const ipAddress = forwardedFor?.split(',')[0] || realIp

    // Record the analytics event
    const { data, error } = await supabase
      .from('user_analytics')
      .insert({
        user_id: userId,
        event_type,
        article_id,
        target_user_id,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          referer: req.headers.get('Referer'),
        }
      })

    if (error) {
      console.error('Analytics insertion error:', error)
      throw error
    }

    // Update article view count if it's a view event
    if (event_type === 'article_view' && article_id) {
      const { error: updateError } = await supabase
        .from('articles')
        .update({ views_count: supabase.raw('views_count + 1') })
        .eq('id', article_id)

      if (updateError) {
        console.error('Article view count update error:', updateError)
      }
    }

    console.log('Analytics event recorded successfully')

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Analytics function error:', error)
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})