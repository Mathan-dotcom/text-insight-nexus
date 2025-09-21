import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, Send, User, Bot, GraduationCap, 
  Handshake, AlertTriangle, Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  personality?: string;
}

interface AILawyerChatProps {
  documentContent?: string;
  analysis?: any;
}

export const AILawyerChat: React.FC<AILawyerChatProps> = ({ documentContent, analysis }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [personality, setPersonality] = useState<'teacher' | 'negotiator' | 'risk_detector'>('teacher');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const personalities = {
    teacher: {
      icon: GraduationCap,
      name: 'Teacher',
      description: 'Explains legal concepts simply and clearly',
      color: 'bg-primary/10 text-primary border-primary/20',
      greeting: "👋 Hi! I'm your AI legal teacher. I'll help you understand this document in simple terms. What would you like to know?"
    },
    negotiator: {
      icon: Handshake,
      name: 'Negotiator',
      description: 'Helps you negotiate better terms',
      color: 'bg-success/10 text-success border-success/20',
      greeting: "💼 Ready to negotiate better terms? I'll help you craft persuasive arguments and suggest specific language for improvements."
    },
    risk_detector: {
      icon: AlertTriangle,
      name: 'Risk Detector',
      description: 'Focuses on identifying potential dangers',
      color: 'bg-warning/10 text-warning border-warning/20',
      greeting: "🔍 I'm here to help you spot potential risks and red flags in this document. Let me know what concerns you most."
    }
  };

  useEffect(() => {
    // Initialize chat session
    initializeSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add greeting message when personality changes
    if (sessionId) {
      const greeting = personalities[personality].greeting;
      const greetingMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
        personality
      };
      setMessages([greetingMessage]);
    }
  }, [personality, sessionId]);

  const initializeSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          personality_mode: personality,
          session_data: { 
            document_analyzed: !!analysis,
            document_type: analysis?.document_type 
          }
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions
        .invoke('ai-chat', {
          body: {
            message: inputMessage,
            sessionId,
            personality,
            documentContent: documentContent?.slice(0, 3000) // Limit context size
          }
        });

      if (error) throw error;

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          personality
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentPersonality = personalities[personality];
  const PersonalityIcon = currentPersonality.icon;

  return (
    <div className="space-y-6">
      {/* Personality Selection */}
      <Card className="card-professional border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>AI Lawyer Buddy</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Choose your AI assistant's personality and start chatting about your document
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={personality} onValueChange={(value) => setPersonality(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              {Object.entries(personalities).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{config.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {Object.entries(personalities).map(([key, config]) => (
              <TabsContent key={key} value={key} className="mt-4">
                <Badge className={config.color}>
                  {config.description}
                </Badge>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="card-professional">
        <CardHeader className="border-b">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${currentPersonality.color}`}>
              <PersonalityIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{currentPersonality.name} Mode</CardTitle>
              <p className="text-sm text-muted-foreground">{currentPersonality.description}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground border border-border'
                  }`}
                >
                  <div className="flex items-start space-x-2 mb-2">
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 mt-0.5" />
                    ) : (
                      <Bot className="h-4 w-4 mt-0.5" />
                    )}
                    <span className="text-xs opacity-75">
                      {message.role === 'user' ? 'You' : currentPersonality.name}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-75 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground border border-border rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask your AI ${currentPersonality.name.toLowerCase()} anything about this document...`}
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {!documentContent && (
              <p className="text-xs text-muted-foreground mt-2">
                💡 Upload and analyze a document first for more specific help
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Questions */}
      {documentContent && (
        <Card className="card-professional">
          <CardHeader>
            <CardTitle className="text-lg">Quick Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "What are the biggest risks in this contract?",
                "How can I negotiate better terms?",
                "What does this clause mean in simple terms?",
                "What should I watch out for?",
                "Are these terms fair compared to industry standards?",
                "Can you explain the termination process?"
              ].map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage(question)}
                  className="text-left justify-start h-auto p-3 whitespace-normal"
                >
                  {question}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};