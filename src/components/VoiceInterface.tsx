import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, Mic, MicOff } from 'lucide-react';

interface VoiceInterfaceProps {
  onSpeakingChange: (speaking: boolean) => void;
  documentContent?: string;
  analysis?: any;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onSpeakingChange }) => {
  return (
    <Card className="card-professional">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Volume2 className="h-5 w-5" />
          <span>Voice Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-12">
        <Volume2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Voice Interface Coming Soon</h3>
        <p className="text-muted-foreground mb-6">
          Ask questions about your document using voice commands and get spoken responses.
        </p>
        <div className="space-x-4">
          <Button disabled>
            <Mic className="h-4 w-4 mr-2" />
            Start Voice Chat
          </Button>
          <Button variant="outline" disabled>
            <MicOff className="h-4 w-4 mr-2" />
            Stop Listening
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};