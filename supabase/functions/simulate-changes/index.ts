import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { originalScores, changes } = await req.json();
    
    if (!originalScores || !changes) {
      throw new Error('Original scores and changes are required');
    }

    console.log('Simulating changes:', { originalScores, changes });

    // Calculate impact of changes on scores
    const simulatedScores = { ...originalScores };
    let totalImpact = 0;

    // Apply change impacts
    for (const change of changes) {
      const impact = calculateChangeImpact(change);
      
      // Apply impact to relevant score categories
      if (change.category === 'termination') {
        simulatedScores.termination_flexibility_score = Math.max(0, Math.min(100, 
          simulatedScores.termination_flexibility_score + impact));
      } else if (change.category === 'financial') {
        simulatedScores.financial_fairness_score = Math.max(0, Math.min(100, 
          simulatedScores.financial_fairness_score + impact));
      } else if (change.category === 'privacy') {
        simulatedScores.privacy_data_score = Math.max(0, Math.min(100, 
          simulatedScores.privacy_data_score + impact));
      } else if (change.category === 'liability') {
        simulatedScores.legal_liability_score = Math.max(0, Math.min(100, 
          simulatedScores.legal_liability_score + impact));
      }
      
      totalImpact += Math.abs(impact);
    }

    // Recalculate overall rights shield score
    const avgScore = Math.round((
      simulatedScores.financial_fairness_score +
      simulatedScores.termination_flexibility_score +
      simulatedScores.privacy_data_score +
      simulatedScores.legal_liability_score +
      simulatedScores.ethics_fairness_score
    ) / 5);

    simulatedScores.rights_shield_score = avgScore;

    // Generate explanation
    const explanation = generateChangeExplanation(changes, totalImpact);

    console.log('Simulation completed:', simulatedScores);

    return new Response(JSON.stringify({
      success: true,
      simulatedScores,
      explanation,
      totalImpact: Math.round(totalImpact)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in simulate-changes function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateChangeImpact(change: any): number {
  const { type, oldValue, newValue } = change;
  
  switch (type) {
    case 'notice_period':
      // Reducing notice period improves flexibility
      const daysDiff = (oldValue - newValue);
      return Math.max(-20, Math.min(20, daysDiff * 0.5));
      
    case 'penalty_amount':
      // Reducing penalties improves financial fairness
      const penaltyDiff = (oldValue - newValue) / oldValue;
      return Math.max(-25, Math.min(25, penaltyDiff * 30));
      
    case 'auto_renewal':
      // Removing auto-renewal improves flexibility
      return oldValue && !newValue ? 15 : (newValue && !oldValue ? -15 : 0);
      
    case 'liability_cap':
      // Adding liability cap improves protection
      return newValue > oldValue ? 10 : -10;
      
    default:
      return 0;
  }
}

function generateChangeExplanation(changes: any[], totalImpact: number): string {
  if (totalImpact === 0) {
    return "No significant impact on overall fairness.";
  }
  
  const positiveChanges = changes.filter(c => calculateChangeImpact(c) > 0);
  const negativeChanges = changes.filter(c => calculateChangeImpact(c) < 0);
  
  let explanation = "";
  
  if (positiveChanges.length > 0) {
    explanation += "Improvements: ";
    explanation += positiveChanges.map(c => getChangeDescription(c, true)).join(", ");
  }
  
  if (negativeChanges.length > 0) {
    if (explanation) explanation += ". ";
    explanation += "Concerns: ";
    explanation += negativeChanges.map(c => getChangeDescription(c, false)).join(", ");
  }
  
  return explanation;
}

function getChangeDescription(change: any, isPositive: boolean): string {
  const { type, oldValue, newValue } = change;
  
  switch (type) {
    case 'notice_period':
      return isPositive 
        ? `Reducing notice period to ${newValue} days increases flexibility`
        : `Increasing notice period to ${newValue} days reduces flexibility`;
        
    case 'penalty_amount':
      return isPositive
        ? `Lowering penalty to $${newValue} improves financial protection`
        : `Raising penalty to $${newValue} increases financial risk`;
        
    case 'auto_renewal':
      return isPositive
        ? "Removing auto-renewal gives you more control"
        : "Adding auto-renewal reduces your control";
        
    default:
      return `${type} changed from ${oldValue} to ${newValue}`;
  }
}