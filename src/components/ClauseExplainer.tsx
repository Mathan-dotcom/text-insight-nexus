import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  AlertTriangle, Info, ChevronDown, ChevronRight, 
  BookOpen, Lightbulb, AlertCircle
} from 'lucide-react';

interface ClauseExplainerProps {
  clauses: any[];
  riskFactors: any[];
}

export const ClauseExplainer: React.FC<ClauseExplainerProps> = ({ 
  clauses = [], 
  riskFactors = [] 
}) => {
  const [openClauses, setOpenClauses] = useState<Set<number>>(new Set());

  const toggleClause = (index: number) => {
    const newOpen = new Set(openClauses);
    if (newOpen.has(index)) {
      newOpen.delete(index);
    } else {
      newOpen.add(index);
    }
    setOpenClauses(newOpen);
  };

  const getRiskIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">High Risk</Badge>;
      case 'medium':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Medium Risk</Badge>;
      default:
        return <Badge className="bg-primary/10 text-primary border-primary/20">Low Risk</Badge>;
    }
  };

  // Sample scenarios for common clause types
  const getScenarioExample = (clauseType: string) => {
    const scenarios = {
      termination: "📚 Real Example: Sarah signed a gym membership with a 90-day notice requirement. When she lost her job and needed to move cities, she still had to pay for 3 months even though she couldn't use the gym. A 30-day notice would have saved her $180.",
      penalty: "📚 Real Example: Mike broke his phone contract early and was charged a $300 penalty fee. He didn't realize this fee was in the contract until he tried to switch carriers for a better deal.",
      renewal: "📚 Real Example: Lisa's software subscription auto-renewed for a full year at $500 without warning. By the time she noticed, the company's policy didn't allow refunds for auto-renewals.",
      liability: "📚 Real Example: When Tom's cloud storage service lost his important business files, the liability clause limited his compensation to just $50, even though he lost clients worth thousands.",
      arbitration: "📚 Real Example: When Jane had a dispute with her contractor, the arbitration clause forced her to pay $2,000 in arbitration fees upfront, making it too expensive to pursue her claim."
    };
    return scenarios[clauseType as keyof typeof scenarios] || scenarios.termination;
  };

  return (
    <div className="space-y-6">
      {/* Risk Factors Overview */}
      {riskFactors.length > 0 && (
        <Card className="card-professional border-warning/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              <span>Risk Factors Detected</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {riskFactors.slice(0, 3).map((risk, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-warning/5 rounded-lg border border-warning/20">
                  {getRiskIcon(risk.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{risk.description}</h4>
                      {getRiskBadge(risk.severity)}
                    </div>
                    {risk.impact && (
                      <p className="text-sm text-muted-foreground">{risk.impact}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clause Explanations */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Important Clauses Explained</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clauses.length > 0 ? (
            <div className="space-y-4">
              {clauses.map((clause, index) => (
                <Collapsible key={index} open={openClauses.has(index)}>
                  <Card className="border border-border/50">
                    <CollapsibleTrigger asChild>
                      <CardHeader 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleClause(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {openClauses.has(index) ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />
                            }
                            <div>
                              <CardTitle className="text-lg">{clause.type || 'Important Clause'}</CardTitle>
                              {clause.risk_level && (
                                <div className="mt-1">
                                  {getRiskBadge(clause.risk_level)}
                                </div>
                              )}
                            </div>
                          </div>
                          {getRiskIcon(clause.risk_level)}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Clause Text */}
                          {clause.text && (
                            <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
                              <p className="font-mono text-sm text-foreground">{clause.text}</p>
                            </div>
                          )}
                          
                          {/* Plain English Explanation */}
                          <div className="space-y-2">
                            <h4 className="font-semibold flex items-center space-x-2">
                              <Lightbulb className="h-4 w-4 text-accent" />
                              <span>What This Means</span>
                            </h4>
                            <p className="text-muted-foreground">
                              {clause.explanation || "This clause contains important terms that could affect your rights and obligations under this agreement."}
                            </p>
                          </div>
                          
                          {/* Real-World Scenario */}
                          <div className="space-y-2">
                            <h4 className="font-semibold flex items-center space-x-2">
                              <BookOpen className="h-4 w-4 text-success" />
                              <span>Real-World Impact</span>
                            </h4>
                            <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                              <p className="text-sm text-foreground">
                                {getScenarioExample(clause.type)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Action Items */}
                          <div className="space-y-2">
                            <h4 className="font-semibold">What You Can Do</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Consider negotiating more favorable terms</li>
                              <li>• Ask for clarification if anything is unclear</li>
                              <li>• Compare with industry standards in the Community tab</li>
                              <li>• Use the Simulator to see impact of changes</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Specific Clauses Identified</h3>
              <p className="text-muted-foreground">
                The analysis didn't identify specific problematic clauses, but you can still explore 
                the overall scoring and use other features.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};