import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, BarChart3, Tag, Shield } from "lucide-react";

interface AnalysisResultsProps {
  analysis: {
    summary: string;
    wordCount: number;
    legalCategory: string;
    sensitiveClause: string[];
    confidenceScore: number;
    fileName: string;
  };
}

export const AnalysisResults = ({ analysis }: AnalysisResultsProps) => {
  const getConfidenceColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 90) return "success";
    if (score >= 70) return "warning";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="card-professional border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Analysis Complete
              </CardTitle>
              <p className="text-sm text-muted-foreground">{analysis.fileName}</p>
            </div>
            <Badge 
              variant={getConfidenceBadge(analysis.confidenceScore) as any}
              className="font-semibold"
            >
              {analysis.confidenceScore}% Confidence
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Word Count</p>
                <p className="text-2xl font-bold text-foreground">{analysis.wordCount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Tag className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p className="text-lg font-semibold text-foreground">{analysis.legalCategory}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Shield className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Factors</p>
                <p className="text-2xl font-bold text-foreground">{analysis.sensitiveClause.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Summary */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Document Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{analysis.summary}</p>
        </CardContent>
      </Card>

      {/* Sensitive Clauses */}
      <Card className="card-professional border-warning/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Important Clauses Identified
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.sensitiveClause.map((clause, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                <div className="w-6 h-6 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-warning">{index + 1}</span>
                </div>
                <p className="text-sm text-foreground font-medium">{clause}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Confidence */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Analysis Confidence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Overall Accuracy</span>
              <span className={`text-sm font-bold ${getConfidenceColor(analysis.confidenceScore)}`}>
                {analysis.confidenceScore}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${analysis.confidenceScore}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This analysis was performed using advanced AI language models trained on legal documents.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};