import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { message, sessionId, personality = 'teacher', documentContent } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    console.log('AI Chat request:', { sessionId, personality, messageLength: message.length });

    // Get personality-specific system prompt
    const personalityPrompts = {
      teacher: `You are a friendly AI legal teacher. Explain legal concepts simply and clearly. Use analogies and examples. Always be encouraging and supportive.`,
      negotiator: `You are an expert negotiation coach. Help users understand how to negotiate better terms. Provide specific language they can use and negotiation strategies.`,
      risk_detector: `You are a risk analysis expert. Focus on identifying potential dangers and risks in legal documents. Be thorough but not alarmist. Provide actionable advice.`
    };

    const systemPrompt = personalityPrompts[personality as keyof typeof personalityPrompts] || personalityPrompts.teacher;

    // Build context from document if provided
    let contextMessage = '';
    if (documentContent) {
      contextMessage = `\n\nDocument context:\n${documentContent.slice(0, 2000)}...`;
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt + contextMessage
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI response');
    }

    const aiResponse = await openaiResponse.json();
    const response = aiResponse.choices[0].message.content;

    // Save chat message to database if sessionId provided
    if (sessionId) {
      const authHeader = req.headers.get('Authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (token) {
        const { data: { user } } = await supabaseClient.auth.getUser(token);
        
        if (user) {
          // Save user message
          await supabaseClient
            .from('chat_messages')
            .insert({
              session_id: sessionId,
              role: 'user',
              content: message,
              message_type: 'text'
            });

          // Save assistant response
          await supabaseClient
            .from('chat_messages')
            .insert({
              session_id: sessionId,
              role: 'assistant',
              content: response,
              message_type: 'text',
              metadata: { personality }
            });
        }
      }
    }

    console.log('AI chat response generated successfully');

    return new Response(JSON.stringify({
      success: true,
      response,
      personality
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});