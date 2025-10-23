import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

Deno.serve(async (req) => {
  console.log('Generate slug function called', req.method)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { title } = await req.json()

    if (!title) {
      throw new Error('Title is required')
    }

    console.log('Generating slug for title:', title)

    // Generate base slug
    let baseSlug = slugify(title)
    
    // Ensure minimum length
    if (baseSlug.length < 3) {
      baseSlug = `article-${Date.now()}`
    }

    // Check if slug exists and find unique variant
    let slug = baseSlug
    let counter = 1

    while (true) {
      const { data, error } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', slug)
        .single()

      if (error && error.code === 'PGRST116') {
        // No matching record found, slug is unique
        break
      }

      if (error) {
        console.error('Error checking slug uniqueness:', error)
        throw error
      }

      // Slug exists, try with counter
      slug = `${baseSlug}-${counter}`
      counter++
    }

    console.log('Generated unique slug:', slug)

    return new Response(
      JSON.stringify({ 
        success: true, 
        slug 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Generate slug function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})