import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Code, Loader2, Copy, Download } from 'lucide-react';
import { useDeepSeek } from './DeepSeekProvider';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    tokens?: number;
    model?: string;
    reasoning?: string[];
  };
}

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI coding assistant. I can help you with code analysis, refactoring, debugging, and implementing new features. What would you like to work on today?',
      timestamp: new Date(),
      metadata: {
        model: 'deepseek-coder'
      }
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { makeRequest, isConfigured } = useDeepSeek();
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!isConfigured) {
      toast({
        title: "API Not Configured",
        description: "Please configure your DeepSeek API key first.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare context from recent messages
      const context = messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await makeRequest(input.trim(), { conversationHistory: context });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: {
          model: 'deepseek-coder',
          tokens: response.length // Rough estimate
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Failed to get response from AI",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content copied successfully."
    });
  };

  const formatMessage = (content: string) => {
    // Simple code block detection and formatting
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        });
      }

      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2]
      });

      lastIndex = codeBlockRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content }];
  };

  return (
    <div className={`h-full flex flex-col bg-gradient-card border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">AI Coding Assistant</h2>
            <p className="text-sm text-muted-foreground">
              Context-aware code editing and development support
            </p>
          </div>
          <div className="ml-auto">
            <Badge variant={isConfigured ? 'default' : 'secondary'}>
              {isConfigured ? 'Connected' : 'Not Configured'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="animate-fade-in">
              <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-gradient-accent' 
                      : 'bg-gradient-primary'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-accent-foreground" />
                    ) : (
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    )}
                  </div>

                  {/* Message Content */}
                  <Card className={`p-4 ${
                    message.role === 'user'
                      ? 'bg-accent/10 border-accent/20'
                      : 'bg-card border-border'
                  }`}>
                    <div className="space-y-2">
                      {formatMessage(message.content).map((part, index) => (
                        <div key={index}>
                          {part.type === 'code' ? (
                            <div className="relative">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-xs">
                                  <Code className="h-3 w-3 mr-1" />
                                  {part.language}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(part.content)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <pre className="bg-code-bg p-3 rounded border text-sm font-mono overflow-x-auto">
                                <code className="text-code-string">{part.content}</code>
                              </pre>
                            </div>
                          ) : (
                            <p className="text-foreground whitespace-pre-wrap">{part.content}</p>
                          )}
                        </div>
                      ))}

                      {/* Message Metadata */}
                      <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.metadata?.model && (
                          <>
                            <span>•</span>
                            <span>{message.metadata.model}</span>
                          </>
                        )}
                        {message.metadata?.tokens && (
                          <>
                            <span>•</span>
                            <span>{message.metadata.tokens} tokens</span>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(message.content)}
                          className="h-4 w-4 p-0 ml-auto"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="p-2 bg-gradient-primary rounded-lg flex-shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your code, request changes, or get help with development..."
            className="flex-1"
            disabled={isLoading || !isConfigured}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading || !isConfigured}
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isConfigured && (
          <p className="text-xs text-muted-foreground mt-2">
            Configure your DeepSeek API key to start chatting
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;