import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileSearch, Shield, Zap, CheckCircle, ArrowRight, Scale, LogIn, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Legal AI</span>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
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
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <Scale className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                AI-Powered{" "}
                <span className="text-gradient">Legal Document</span>{" "}
                Analysis
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Upload any legal document and get instant AI insights, risk assessments, and clause analysis. 
                Powered by advanced machine learning to help legal professionals work smarter.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="professional" 
                size="lg"
                className="px-8 py-4 text-lg"
                asChild
              >
                <Link to="/upload">
                  <FileSearch className="mr-2 h-5 w-5" />
                  Analyze Document
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg border-primary/20 hover:border-primary"
                asChild
              >
                <Link to="/upload">
                  View Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose Our AI Legal Analyzer?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced AI technology meets legal expertise to deliver comprehensive document analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="card-professional text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Instant Analysis</h3>
                <p className="text-muted-foreground">
                  Get comprehensive document analysis in seconds. Our AI processes complex legal language instantly.
                </p>
              </CardContent>
            </Card>

            <Card className="card-professional text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Risk Detection</h3>
                <p className="text-muted-foreground">
                  Automatically identify potential risks, sensitive clauses, and important legal considerations.
                </p>
              </CardContent>
            </Card>

            <Card className="card-professional text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Accurate Insights</h3>
                <p className="text-muted-foreground">
                  Trained on thousands of legal documents for precise categorization and analysis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <Card className="card-professional border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Analyze Your Legal Documents?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of legal professionals who trust our AI-powered analysis for faster, 
                more accurate document review.
              </p>
              <Button 
                variant="professional"
                size="lg"
                className="px-8 py-4 text-lg"
                asChild
              >
                <Link to="/upload">
                  <FileSearch className="mr-2 h-5 w-5" />
                  Start Analysis Now
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Legal Document Analyzer. Powered by advanced AI technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
