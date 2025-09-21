import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Upload, FileText, Shield, AlertTriangle, TrendingUp, 
  MessageSquare, Calendar, Scale, Users, Eye, Volume2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ScoreDisplay } from './ScoreDisplay';
import { ClauseExplainer } from './ClauseExplainer';
import { SimulationPanel } from './SimulationPanel';
import { CommunityBenchmarks } from './CommunityBenchmarks';
import { AILawyerChat } from './AILawyerChat';
import { TimelineVisualizer } from './TimelineVisualizer';
import { ContractTemplates } from './ContractTemplates';
import { VoiceInterface } from './VoiceInterface';

interface AnalysisResult {
  rights_shield_score: number;
  financial_fairness_score: number;
  termination_flexibility_score: number;
  privacy_data_score: number;
  legal_liability_score: number;
  ethics_fairness_score: number;
  document_type: string;
  key_clauses: any[];
  risk_factors: any[];
  important_dates: any[];
  obligations: any[];
  word_count: number;
  summary: string;
  confidence_score: number;
  fileName?: string;
}

export const DocumentAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState('upload');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) return;

    const validTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.txt')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a TXT, PDF, or DOCX file.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 20MB.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setActiveTab('analysis');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const analyzeDocument = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      // Read file content
      let content = '';
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        content = await file.text();
      } else {
        // For PDF/DOCX, we'll simulate parsing or use actual parsing
        content = `Document content from ${file.name} - ${file.size} bytes`;
        toast({
          title: "Note",
          description: "PDF/DOCX parsing simulation. In production, full document parsing would be implemented.",
        });
      }

      setDocumentContent(content);

      // Upload to Supabase storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save document metadata
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          file_name: file.name,
          path: uploadData.path,
          size: file.size,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          processing_status: 'processing'
        })
        .select()
        .single();

      if (documentError) throw documentError;

      // Call analysis function
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-document', {
          body: {
            documentId: documentData.id,
            content: content
          }
        });

      if (analysisError) throw analysisError;

      if (analysisData.success) {
        setAnalysis(analysisData.analysis);
        toast({
          title: "Analysis Complete",
          description: "Your document has been analyzed successfully!",
        });
      } else {
        throw new Error(analysisData.error);
      }

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed", 
        description: error instanceof Error ? error.message : "Failed to analyze document",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-success text-success-foreground">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-warning text-warning-foreground">Fair</Badge>;
    return <Badge className="bg-destructive text-destructive-foreground">Risky</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Scale className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Legal AI Analyzer</h1>
            </div>
            <div className="flex items-center space-x-2">
              {analysis && (
                <div className="flex items-center space-x-2">
                  <Shield className={`h-5 w-5 ${getScoreColor(analysis.rights_shield_score)}`} />
                  <span className="text-lg font-semibold">{analysis.rights_shield_score}/100</span>
                  {getScoreBadge(analysis.rights_shield_score)}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="simulator" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Simulator</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Community</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>AI Buddy</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Templates</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center space-x-2">
              <Volume2 className="h-4 w-4" />
              <span>Voice</span>
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload Legal Document</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="upload-area border-2 border-dashed border-border rounded-lg p-12 text-center transition-all hover:border-primary"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {file ? file.name : 'Drop your document here'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {file 
                      ? `${(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze`
                      : 'Supports TXT, PDF, and DOCX files up to 20MB'
                    }
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.docx"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <Button variant="outline" className="mr-4">
                    Browse Files
                  </Button>
                  {file && (
                    <Button onClick={analyzeDocument} disabled={isAnalyzing}>
                      {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {analysis ? (
              <>
                <ScoreDisplay analysis={analysis} />
                <ClauseExplainer 
                  clauses={analysis.key_clauses}
                  riskFactors={analysis.risk_factors}
                />
              </>
            ) : (
              <Card className="card-professional">
                <CardContent className="p-12 text-center">
                  <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Analysis Available</h3>
                  <p className="text-muted-foreground">
                    Upload and analyze a document first to see results here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* What-If Simulator Tab */}
          <TabsContent value="simulator" className="space-y-6">
            {analysis ? (
              <SimulationPanel originalAnalysis={analysis} />
            ) : (
              <Card className="card-professional">
                <CardContent className="p-12 text-center">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Simulation Tool</h3>
                  <p className="text-muted-foreground">
                    Analyze a document first to simulate contract term changes.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Community Benchmarks Tab */}
          <TabsContent value="community" className="space-y-6">
            <CommunityBenchmarks documentType={analysis?.document_type} />
          </TabsContent>

          {/* AI Lawyer Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <AILawyerChat documentContent={documentContent} analysis={analysis} />
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            {analysis ? (
              <TimelineVisualizer 
                dates={analysis.important_dates}
                obligations={analysis.obligations}
              />
            ) : (
              <Card className="card-professional">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Legal Timeline</h3>
                  <p className="text-muted-foreground">
                    Analyze a document first to see important dates and obligations.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <ContractTemplates documentType={analysis?.document_type} />
          </TabsContent>

          {/* Voice Interface Tab */}
          <TabsContent value="voice" className="space-y-6">
            <VoiceInterface 
              onSpeakingChange={setIsSpeaking}
              documentContent={documentContent}
              analysis={analysis}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};