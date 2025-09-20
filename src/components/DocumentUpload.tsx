import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  onAnalysis: (result: any) => void;
  isAnalyzing: boolean;
}

export const DocumentUpload = ({ onAnalysis, isAnalyzing }: DocumentUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = ['.txt', '.pdf', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      setUploadStatus('error');
      return;
    }

    setSelectedFile(file);
    setUploadStatus('success');
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    
    // Mock AI analysis - in real implementation, this would call your backend
    setTimeout(() => {
      const mockAnalysis = {
        summary: "This legal document appears to be a service agreement outlining terms between a service provider and client. It includes standard clauses for payment terms, liability limitations, and termination conditions.",
        wordCount: 1247,
        legalCategory: "Service Agreement",
        sensitiveClause: [
          "Liability limitation clause in Section 8.2",
          "Automatic renewal clause in Section 12.1",
          "Intellectual property rights in Section 6.3"
        ],
        confidenceScore: 94,
        fileName: selectedFile.name
      };
      
      onAnalysis(mockAnalysis);
      setUploadStatus('idle');
    }, 2000);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <FileText className="h-8 w-8 text-muted-foreground" />;
    }
  };

  return (
    <Card className="card-professional border-2">
      <CardContent className="p-8">
        <div
          className={cn(
            "upload-area border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300",
            dragActive ? "dragover border-primary bg-primary/5 scale-102" : "border-muted-foreground/25",
            selectedFile ? "border-success/50 bg-success/5" : ""
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.docx"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>

            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-medium text-foreground">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="h-6 w-6 p-0 hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  File size: {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Upload Legal Document
                </h3>
                <p className="text-muted-foreground">
                  Drag and drop your document here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports: TXT, PDF, DOCX (Max 10MB)
                </p>
              </div>
            )}

            <div className="flex justify-center gap-3">
              {!selectedFile && (
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-primary/20 hover:border-primary hover:bg-primary/5"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Browse Files
                </Button>
              )}

              {selectedFile && (
                <Button
                  onClick={handleUpload}
                  disabled={isAnalyzing || uploadStatus === 'uploading'}
                  className="bg-gradient-primary hover:shadow-elegant"
                >
                  {isAnalyzing || uploadStatus === 'uploading' ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Analyze Document
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {uploadStatus === 'error' && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-medium">
              Please upload a valid document file (TXT, PDF, or DOCX)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};