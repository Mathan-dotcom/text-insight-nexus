import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SimulationPanelProps {
  originalAnalysis: {
    rights_shield_score: number;
    financial_fairness_score: number;
    termination_flexibility_score: number;
    privacy_data_score: number;
    legal_liability_score: number;
    ethics_fairness_score: number;
  };
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({ originalAnalysis }) => {
  const [changes, setChanges] = useState<any[]>([]);
  const [simulatedScores, setSimulatedScores] = useState(originalAnalysis);
  const [isSimulating, setIsSimulating] = useState(false);
  const { toast } = useToast();

  const [terminationDays, setTerminationDays] = useState([90]);
  const [penaltyAmount, setPenaltyAmount] = useState([500]);
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [liabilityCap, setLiabilityCap] = useState([1000]);

  const simulateChanges = async () => {
    setIsSimulating(true);
    try {
      const newChanges = [
        {
          type: 'notice_period',
          category: 'termination',
          oldValue: 90,
          newValue: terminationDays[0],
          description: `Notice period: ${terminationDays[0]} days`
        },
        {
          type: 'penalty_amount',
          category: 'financial',
          oldValue: 500,
          newValue: penaltyAmount[0],
          description: `Penalty amount: $${penaltyAmount[0]}`
        },
        {
          type: 'auto_renewal',
          category: 'termination',
          oldValue: true,
          newValue: autoRenewal,
          description: `Auto-renewal: ${autoRenewal ? 'enabled' : 'disabled'}`
        },
        {
          type: 'liability_cap',
          category: 'liability',
          oldValue: 1000,
          newValue: liabilityCap[0],
          description: `Liability cap: $${liabilityCap[0]}`
        }
      ];

      const { data, error } = await supabase.functions
        .invoke('simulate-changes', {
          body: {
            originalScores: originalAnalysis,
            changes: newChanges
          }
        });

      if (error) throw error;

      if (data.success) {
        setSimulatedScores(data.simulatedScores);
        setChanges(newChanges);
        
        toast({
          title: "Simulation Complete",
          description: `Total impact: ${data.totalImpact > 0 ? '+' : ''}${data.totalImpact} points`,
        });
      }
    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        title: "Simulation Failed",
        description: "Could not simulate changes",
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const resetSimulation = () => {
    setSimulatedScores(originalAnalysis);
    setChanges([]);
    setTerminationDays([90]);
    setPenaltyAmount([500]);
    setAutoRenewal(true);
    setLiabilityCap([1000]);
  };

  const getScoreDiff = (original: number, simulated: number) => {
    const diff = simulated - original;
    return {
      value: diff,
      color: diff > 0 ? 'text-success' : diff < 0 ? 'text-destructive' : 'text-muted-foreground',
      icon: diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : null
    };
  };

  return (
    <div className="space-y-6">
      <Card className="card-professional border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>What-If Simulator</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Adjust contract terms below to see how they would impact your Rights Shield Score
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Termination Notice */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Termination Notice Period</label>
                <Badge variant="outline">{terminationDays[0]} days</Badge>
              </div>
              <Slider
                value={terminationDays}
                onValueChange={setTerminationDays}
                max={120}
                min={7}
                step={7}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>7 days</span>
                <span>120 days</span>
              </div>
            </div>

            {/* Penalty Amount */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Early Termination Penalty</label>
                <Badge variant="outline">${penaltyAmount[0]}</Badge>
              </div>
              <Slider
                value={penaltyAmount}
                onValueChange={setPenaltyAmount}
                max={2000}
                min={0}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span>$2,000</span>
              </div>
            </div>

            {/* Auto Renewal */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <label className="text-sm font-medium">Automatic Renewal</label>
                <p className="text-xs text-muted-foreground">Contract renews automatically</p>
              </div>
              <Switch checked={autoRenewal} onCheckedChange={setAutoRenewal} />
            </div>

            {/* Liability Cap */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Liability Cap</label>
                <Badge variant="outline">${liabilityCap[0]}</Badge>
              </div>
              <Slider
                value={liabilityCap}
                onValueChange={setLiabilityCap}
                max={10000}
                min={100}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$100</span>
                <span>$10,000</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button onClick={simulateChanges} disabled={isSimulating}>
              {isSimulating ? 'Simulating...' : 'Run Simulation'}
            </Button>
            <Button variant="outline" onClick={resetSimulation}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle>Simulation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Overall Score */}
            <div className="col-span-full">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Rights Shield Score</span>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{simulatedScores.rights_shield_score}</span>
                  {(() => {
                    const diff = getScoreDiff(originalAnalysis.rights_shield_score, simulatedScores.rights_shield_score);
                    const Icon = diff.icon;
                    return (
                      <div className={`flex items-center space-x-1 ${diff.color}`}>
                        {Icon && <Icon className="h-4 w-4" />}
                        <span className="font-medium">
                          {diff.value > 0 ? '+' : ''}{diff.value}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
              <Progress value={simulatedScores.rights_shield_score} className="h-3" />
            </div>

            {/* Individual Categories */}
            {[
              { key: 'financial_fairness_score', label: 'Financial Fairness' },
              { key: 'termination_flexibility_score', label: 'Termination Flexibility' },
              { key: 'privacy_data_score', label: 'Privacy & Data' },
              { key: 'legal_liability_score', label: 'Legal Liability' },
              { key: 'ethics_fairness_score', label: 'Ethics & Fairness' }
            ].map((category) => {
              const original = originalAnalysis[category.key as keyof typeof originalAnalysis];
              const simulated = simulatedScores[category.key as keyof typeof simulatedScores];
              const diff = getScoreDiff(original, simulated);
              const Icon = diff.icon;

              return (
                <div key={category.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.label}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{simulated}</span>
                      {Icon && (
                        <div className={`flex items-center space-x-1 ${diff.color}`}>
                          <Icon className="h-3 w-3" />
                          <span className="text-xs">{diff.value > 0 ? '+' : ''}{diff.value}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Progress value={simulated} className="h-2" />
                </div>
              );
            })}
          </div>

          {/* Changes Summary */}
          {changes.length > 0 && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold mb-2">Applied Changes:</h4>
              <ul className="text-sm space-y-1">
                {changes.map((change, index) => (
                  <li key={index} className="text-muted-foreground">• {change.description}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};