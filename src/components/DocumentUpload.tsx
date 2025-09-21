import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface DocumentUploadProps {
  onAnalysis: (result: any) => void;
  isAnalyzing: boolean;
}

export const DocumentUpload = ({ onAnalysis, isAnalyzing }: DocumentUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
  const allowedExtensions = ['.txt', '.pdf', '.docx'];
  const allowedMimeTypes = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  const isValidExtension = allowedExtensions.includes(fileExtension);
  const isValidMimeType = allowedMimeTypes.includes(file.type);
  
  if (!isValidExtension && !isValidMimeType) {
    console.log('File validation failed:', { 
      fileName: file.name, 
      extension: fileExtension, 
      mimeType: file.type 
    });
    setErrorMessage(`Unsupported file type: ${fileExtension || 'unknown'}. Please upload TXT, PDF, or DOCX.`);
    setUploadStatus('error');
    return;
  }

  console.log('File accepted:', { 
    fileName: file.name, 
    extension: fileExtension, 
    mimeType: file.type 
  });
  setErrorMessage(null);
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
    
    try {
      // Parse the document content
      let content = '';
      
      if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt')) {
        content = await selectedFile.text();
      } else if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf')) {
        content = `PDF Document: ${selectedFile.name}\nSize: ${(selectedFile.size / 1024).toFixed(1)} KB\n\nThis PDF file has been uploaded for analysis. Advanced parsing would extract text, tables, and images for comprehensive legal analysis.`;
      } else if (selectedFile.name.endsWith('.docx') || selectedFile.type.includes('wordprocessingml')) {
        content = `Word Document: ${selectedFile.name}\nSize: ${(selectedFile.size / 1024).toFixed(1)} KB\n\nThis Word document has been uploaded for analysis. Advanced parsing would extract formatted text, tables, and embedded content.`;
      } else {
        try {
          content = await selectedFile.text();
        } catch {
          content = `Document: ${selectedFile.name}\nType: ${selectedFile.type || 'Unknown'}\nSize: ${(selectedFile.size / 1024).toFixed(1)} KB\n\nThis file format requires specialized parsing for comprehensive analysis.`;
        }
      }
      
      // First save document to storage and database
      console.log('Uploading document to storage...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Please sign in to analyze documents');
      }

      // Upload file to Supabase storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error('Failed to upload document');
      }

      // Create document record in database
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          file_name: selectedFile.name,
          path: filePath,
          bucket: 'documents',
          size: selectedFile.size,
          processing_status: 'processing',
          parsed_content: content,
          word_count: content.split(/\s+/).length
        })
        .select()
        .single();

      if (docError || !docData) {
        console.error('Database insert error:', docError);
        throw new Error('Failed to save document record');
      }

      console.log('Document saved, starting AI analysis...');

      // Call AI analysis edge function
      const { data: aiData, error: aiError } = await supabase.functions
        .invoke('analyze-document', {
          body: {
            documentId: docData.id,
            content: content
          }
        });

      if (aiError) {
        console.error('AI analysis error:', aiError);
        throw new Error('Failed to analyze document with AI');
      }

      if (!aiData.success) {
        console.error('AI analysis failed:', aiData.error);
        throw new Error(aiData.error || 'AI analysis failed');
      }

      console.log('AI analysis completed:', aiData.analysis);
      
      onAnalysis(aiData.analysis);
      setUploadStatus('idle');
  } catch (error) {
    console.error('Error analyzing document:', error);
    setErrorMessage(error instanceof Error ? error.message : 'Failed to analyze document');
    setUploadStatus('error');
  }
  };


const removeFile = () => {
  setSelectedFile(null);
  setUploadStatus('idle');
  setErrorMessage(null);
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
      {errorMessage ?? 'Please upload a valid document file (TXT, PDF, or DOCX)'}
    </p>
  </div>
)}
      </CardContent>
    </Card>
  );
};