import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, DollarSign, Clock, Lock, Scale, Heart,
  TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react';

interface ScoreDisplayProps {
  analysis: {
    rights_shield_score: number;
    financial_fairness_score: number;
    termination_flexibility_score: number;
    privacy_data_score: number;
    legal_liability_score: number;
    ethics_fairness_score: number;
    document_type: string;
    word_count: number;
    summary: string;
    confidence_score: number;
    fileName?: string;
  };
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ analysis }) => {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-success/10 text-success border-success/20">Fair</Badge>;
    if (score >= 60) return <Badge className="bg-warning/10 text-warning border-warning/20">Caution</Badge>;
    return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Risky</Badge>;
  };

  const getProgressColor = (score: number): string => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  const scoreCategories = [
    {
      icon: DollarSign,
      title: 'Financial Fairness',
      score: analysis.financial_fairness_score,
      description: 'How balanced are the financial terms'
    },
    {
      icon: Clock,
      title: 'Termination Flexibility',
      score: analysis.termination_flexibility_score,
      description: 'How flexible are exit conditions'
    },
    {
      icon: Lock,
      title: 'Privacy & Data Use',
      score: analysis.privacy_data_score,
      description: 'How well protected is your data'
    },
    {
      icon: Scale,
      title: 'Legal Liability',
      score: analysis.legal_liability_score,
      description: 'How balanced is liability distribution'
    },
    {
      icon: Heart,
      title: 'Ethics & Fairness',
      score: analysis.ethics_fairness_score,
      description: 'Overall ethical considerations'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Rights Shield Score */}
      <Card className="card-professional border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(analysis.rights_shield_score)}`}>
                    {analysis.rights_shield_score}
                  </div>
                  <div className="text-sm text-muted-foreground">/ 100</div>
                </div>
              </div>
              <Shield className="absolute -top-2 -right-2 h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="flex items-center justify-center space-x-2">
            <span>Rights Shield Score</span>
            {getScoreBadge(analysis.rights_shield_score)}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">{analysis.summary}</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold text-foreground">{analysis.word_count.toLocaleString()}</div>
              <div className="text-muted-foreground">Words</div>
            </div>
            <div>
              <div className="font-semibold text-foreground capitalize">{analysis.document_type}</div>
              <div className="text-muted-foreground">Category</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">{analysis.confidence_score}%</div>
              <div className="text-muted-foreground">Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scoreCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <Card key={index} className="card-professional">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(category.score)}`}>
                      {category.score}
                    </div>
                    <div className="text-xs text-muted-foreground">/ 100</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Progress 
                    value={category.score} 
                    className="h-2"
                  />
                  <div className="flex justify-between items-center">
                    {getScoreBadge(category.score)}
                    {category.score >= 80 ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : category.score >= 60 ? (
                      <TrendingUp className="h-4 w-4 text-warning" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};