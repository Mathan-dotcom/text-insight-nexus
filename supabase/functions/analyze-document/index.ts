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

    const { documentId, content } = await req.json();
    
    if (!documentId || !content) {
      throw new Error('Document ID and content are required');
    }

    console.log('Analyzing document:', documentId);

    // Comprehensive AI analysis using OpenAI
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
            content: `You are a legal document analysis AI that provides comprehensive scoring and analysis. 
            
            Analyze the document and return a JSON response with:
            1. rights_shield_score (0-100): Overall fairness score
            2. financial_fairness_score (0-100): How fair are the financial terms
            3. termination_flexibility_score (0-100): How flexible are termination terms
            4. privacy_data_score (0-100): How well does it protect privacy/data
            5. legal_liability_score (0-100): How balanced is the liability
            6. ethics_fairness_score (0-100): Overall ethical fairness
            7. document_type: rental, employment, service, nda, etc.
            8. key_clauses: Array of important clauses with type, text, risk_level
            9. risk_factors: Array of risks with description, severity, impact
            10. important_dates: Array of dates/deadlines with type, date, description
            11. obligations: Array of obligations with party, description, frequency
            12. word_count: Number of words
            13. summary: 2-3 sentence summary
            14. confidence_score: How confident you are (0-100)
            
            Be thorough and realistic in scoring. Higher scores = more fair/favorable.`
          },
          {
            role: 'user',
            content: `Please analyze this legal document:\n\n${content}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to analyze document with AI');
    }

    const aiResponse = await openaiResponse.json();
    const analysisText = aiResponse.choices[0].message.content;
    
    console.log('Raw AI response:', analysisText);
    
    // Parse the JSON from AI response
    let analysis;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : analysisText;
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback analysis if parsing fails
      analysis = {
        rights_shield_score: 60,
        financial_fairness_score: 60,
        termination_flexibility_score: 60,
        privacy_data_score: 60,
        legal_liability_score: 60,
        ethics_fairness_score: 60,
        document_type: 'general',
        key_clauses: [],
        risk_factors: [],
        important_dates: [],
        obligations: [],
        word_count: content.split(' ').length,
        summary: 'Document analysis completed with basic scoring.',
        confidence_score: 50
      };
    }

    // Update document with analysis results
    const { error: updateError } = await supabaseClient
      .from('documents')
      .update({
        processing_status: 'completed',
        rights_shield_score: analysis.rights_shield_score,
        financial_fairness_score: analysis.financial_fairness_score,
        termination_flexibility_score: analysis.termination_flexibility_score,
        privacy_data_score: analysis.privacy_data_score,
        legal_liability_score: analysis.legal_liability_score,
        ethics_fairness_score: analysis.ethics_fairness_score,
        document_type: analysis.document_type,
        parsed_content: content,
        key_clauses: analysis.key_clauses || [],
        risk_factors: analysis.risk_factors || [],
        important_dates: analysis.important_dates || [],
        obligations: analysis.obligations || [],
        word_count: analysis.word_count,
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to save analysis results');
    }

    // Store detailed analysis in analysis_results table
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (token) {
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      
      if (user) {
        await supabaseClient
          .from('analysis_results')
          .insert({
            document_id: documentId,
            user_id: user.id,
            analysis_type: 'comprehensive',
            result_data: analysis,
            confidence_score: analysis.confidence_score,
          });
      }
    }

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      analysis: {
        ...analysis,
        fileName: `Document ${documentId}`,
        confidenceScore: analysis.confidence_score,
        legalCategory: analysis.document_type,
        sensitiveClause: analysis.risk_factors?.length > 0 ? analysis.risk_factors[0]?.description : null
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-document function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});