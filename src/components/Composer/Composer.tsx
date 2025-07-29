import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  FileText, 
  Folder, 
  Code2, 
  MessageSquare, 
  Settings, 
  X,
  Plus,
  Search,
  GitBranch,
  History,
  Sparkles,
  Bot,
  User,
  Check,
  XCircle,
  Eye,
  Copy,
  Download,
  Upload,
  Brain,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { FileSystemItem } from '@/types/fileSystem';
import { sampleFileSystem } from '@/data/sampleFileSystem';
import ContextBuilder from './ContextBuilder';
import DiffViewer from './DiffViewer';
import ConversationHistory from './ConversationHistory';
import { useComposer } from '@/hooks/useComposer';
import { useToast } from '@/hooks/use-toast';

interface ComposerProps {
  className?: string;
  initialFiles?: FileSystemItem[];
  onFileSelect?: (file: FileSystemItem) => void;
  onApplyChanges?: (changes: any[]) => void;
  width?: string;
  height?: string;
}

const Composer: React.FC<ComposerProps> = ({
  className,
  initialFiles = sampleFileSystem,
  onFileSelect,
  onApplyChanges,
  width = "400px",
  height = "100%"
}) => {
  const {
    messages,
    selectedContext,
    pendingChanges,
    isLoading,
    error,
    sendMessage,
    addContext,
    removeContext,
    applyChanges,
    rejectChanges,
    clearConversation,
    loadConversation,
    selectedPromptType,
    prompts,
    selectedPrompt,
    selectPrompt
  } = useComposer();

  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [showContextBuilder, setShowContextBuilder] = useState(false);
  const [showTokenWarning, setShowTokenWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if context might exceed token limits
  useEffect(() => {
    const totalContextSize = selectedContext.reduce((total, file) => {
      return total + (file.content?.length || 0);
    }, 0);
    
    // Rough estimate: if context is larger than 50KB, show warning
    if (totalContextSize > 50000) {
      setShowTokenWarning(true);
    } else {
      setShowTokenWarning(false);
    }
  }, [selectedContext]);

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

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    
    await sendMessage(message, selectedContext);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleApplyChanges = async () => {
    if (pendingChanges.length > 0) {
      await applyChanges();
      onApplyChanges?.(pendingChanges);
    }
  };

  const containerStyle = {
    width,
    height
  };

  return (
    <div 
      className={`flex flex-col bg-gradient-card border border-border rounded-lg ${className}`}
      style={containerStyle}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Composer</h3>
              <p className="text-xs text-muted-foreground">AI Code Assistant</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={clearConversation}>
              <History className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Token Limit Warning */}
        {showTokenWarning && (
          <Alert className="mb-3 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 text-xs">
              Large context detected. Some content may be truncated to stay within AI model limits.
            </AlertDescription>
          </Alert>
        )}

        {/* Context Badges */}
        {selectedContext.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {selectedContext.map((item) => (
              <Badge 
                key={item.id} 
                variant="secondary" 
                className="text-xs flex items-center gap-1"
              >
                {item.type === 'folder' ? (
                  <Folder className="h-3 w-3" />
                ) : (
                  <FileText className="h-3 w-3" />
                )}
                {item.name}
                <button
                  onClick={() => removeContext(item.id)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowContextBuilder(true)}
              className="h-6 px-2 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Context
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
            <TabsTrigger value="changes" className="text-xs">
              Changes
              {pendingChanges.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                  {pendingChanges.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col m-0">
          {/* Prompt Selector */}
          <div className="p-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Mode:</span>
              </div>
              <Select 
                value={selectedPromptType} 
                onValueChange={(value: 'agent' | 'chat' | 'memory') => {
                  const availablePrompts = prompts.filter(p => p.type === value);
                  const bestPrompt = availablePrompts.find(p => p.version === '1.2') || 
                                    availablePrompts.find(p => p.version === '1.0') || 
                                    availablePrompts[0];
                  if (bestPrompt) {
                    selectPrompt(bestPrompt.id);
                  }
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="memory">Memory</SelectItem>
                </SelectContent>
              </Select>
              {selectedPrompt && (
                <Badge variant="outline" className="text-xs">
                  {selectedPrompt.name}
                </Badge>
              )}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-2">Welcome to Composer!</p>
                  <p className="text-sm mb-4">
                    I can help you refactor code, create new features, and answer questions about your codebase.
                  </p>
                  <div className="space-y-2 text-xs">
                    <p>💡 Try asking:</p>
                    <ul className="space-y-1 text-left max-w-xs mx-auto">
                      <li>• "Refactor the payment module to use Stripe v4 API"</li>
                      <li>• "Add error handling to the user authentication"</li>
                      <li>• "Create a new React component for data visualization"</li>
                    </ul>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className="animate-fade-in">
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
                            {formatMessage(message.content).map((part, partIndex) => (
                              <div key={partIndex}>
                                {part.type === 'code' ? (
                                  <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                      <Badge variant="outline" className="text-xs">
                                        <Code2 className="h-3 w-3 mr-1" />
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
                              {message.timestamp && (
                                <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                              )}
                              {message.promptUsed && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Zap className="h-3 w-3" />
                                    {message.promptUsed}
                                  </span>
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
                ))
              )}
              {isLoading && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="p-2 bg-gradient-primary rounded-lg flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <Card className="p-4 bg-card border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowContextBuilder(true)}
                className="flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe what you want to do with your code..."
                  className="min-h-[60px] max-h-[120px] resize-none pr-12"
                  disabled={isLoading}
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 bottom-2 h-8 w-8 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="changes" className="flex-1 m-0">
          <DiffViewer
            changes={pendingChanges}
            onApply={handleApplyChanges}
            onReject={rejectChanges}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="history" className="flex-1 m-0">
          <ConversationHistory
            onLoadConversation={loadConversation}
            onClearHistory={clearConversation}
          />
        </TabsContent>
      </Tabs>

      {/* Context Builder Modal */}
      {showContextBuilder && (
        <ContextBuilder
          files={initialFiles}
          selectedContext={selectedContext}
          onAddContext={addContext}
          onRemoveContext={removeContext}
          onClose={() => setShowContextBuilder(false)}
        />
      )}
    </div>
  );
};

export default Composer; 