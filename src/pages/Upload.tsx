import { useState } from "react";
import { DocumentUpload } from "@/components/DocumentUpload";
import { AnalysisResults } from "@/components/AnalysisResults";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileSearch, Sparkles, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Upload = () => {
  const { user, signOut } = useAuth();
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysis = (result: any) => {
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleNewUpload = () => {
    setAnalysis(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <FileSearch className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-foreground">Legal Document Analyzer</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {analysis && (
                <Button
                  onClick={handleNewUpload}
                  variant="outline"
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Analyze New Document
                </Button>
              )}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      {user.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!analysis ? (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gradient">
                Upload Your Legal Document
              </h2>
              <p className="text-lg text-muted-foreground">
                Get instant AI-powered insights and analysis of your legal documents
              </p>
            </div>
            
            <DocumentUpload 
              onAnalysis={handleAnalysis} 
              isAnalyzing={isAnalyzing}
            />
            
            <div className="bg-muted/30 border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">What our AI analyzes:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Document summary and key points
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Legal document classification
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Important clauses identification
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Risk assessment and flagging
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <AnalysisResults analysis={analysis} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Upload;