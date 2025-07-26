import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, Upload, RefreshCw, Eye, Edit } from 'lucide-react';

interface PromptFile {
  name: string;
  path: string;
  version?: string;
  lastModified: Date;
  content: string;
  type: 'agent' | 'tools' | 'chat' | 'memory';
}

const PromptRegistry = () => {
  const [prompts, setPrompts] = useState<PromptFile[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load prompt files
  useEffect(() => {
    loadPromptFiles();
  }, []);

  const loadPromptFiles = async () => {
    setIsLoading(true);
    try {
      // Actually load prompt files from the prompts directory
      const promptFilePaths = [
        { path: 'src/prompts/Agent Prompt v1.0.txt', name: 'Agent Prompt v1.0', version: '1.0', type: 'agent' as const },
        { path: 'src/prompts/Agent Prompt v1.2.txt', name: 'Agent Prompt v1.2', version: '1.2', type: 'agent' as const },
        { path: 'src/prompts/Agent Prompt.txt', name: 'Agent Prompt', version: 'main', type: 'agent' as const },
        { path: 'src/prompts/Agent Tools v1.0.json', name: 'Agent Tools', version: '1.0', type: 'tools' as const },
        { path: 'src/prompts/Chat Prompt.txt', name: 'Chat Prompt', type: 'chat' as const },
        { path: 'src/prompts/Memory Prompt.txt', name: 'Memory Prompt', type: 'memory' as const },
        { path: 'src/prompts/Memory Rating Prompt.txt', name: 'Memory Rating Prompt', type: 'memory' as const }
      ];

      const promptFiles: PromptFile[] = await Promise.all(
        promptFilePaths.map(async ({ path, name, version, type }) => {
          try {
            const response = await fetch(path);
            let content = '';
            let lastModified = new Date();
            
            if (response.ok) {
              content = await response.text();
              const lastModifiedHeader = response.headers.get('last-modified');
              if (lastModifiedHeader) {
                lastModified = new Date(lastModifiedHeader);
              }
            } else {
              // Fallback content for development
              content = `# ${name}\n\nPrompt content will be loaded here...\n\n## Status\nFile not found at ${path}`;
            }

            return {
              name,
              path,
              version,
              lastModified,
              content,
              type
            };
          } catch (error) {
            console.warn(`Failed to load ${path}:`, error);
            return {
              name,
              path,
              version,
              lastModified: new Date(),
              content: `# ${name}\n\nError loading prompt file.\n\n## Error\n${error}`,
              type
            };
          }
        })
      );

      setPrompts(promptFiles);
    } catch (error) {
      console.error('Failed to load prompt files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'agent': return 'bg-primary';
      case 'tools': return 'bg-accent';
      case 'chat': return 'bg-success';
      case 'memory': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  const groupedPrompts = prompts.reduce((acc, prompt) => {
    if (!acc[prompt.type]) acc[prompt.type] = [];
    acc[prompt.type].push(prompt);
    return acc;
  }, {} as Record<string, PromptFile[]>);

  return (
    <div className="h-full flex flex-col bg-gradient-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Prompt Registry</h2>
              <p className="text-sm text-muted-foreground">
                Manage and version AI agent prompts
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadPromptFiles}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Reload
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <Tabs defaultValue="all" className="h-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="agent">Agent</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 h-full">
            <ScrollArea className="h-full">
              <div className="grid gap-4">
                {prompts.map((prompt, index) => (
                  <Card key={index} className="p-4 bg-gradient-card border-border hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getTypeColor(prompt.type)} text-xs`}>
                          {prompt.type}
                        </Badge>
                        <div>
                          <h3 className="font-medium text-foreground">{prompt.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {prompt.path} • Modified {prompt.lastModified.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {prompt.version && (
                          <Badge variant="outline" className="text-xs">
                            v{prompt.version}
                          </Badge>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>{prompt.name}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-[60vh]">
                              <pre className="whitespace-pre-wrap text-sm bg-code-bg p-4 rounded border">
                                {prompt.content}
                              </pre>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([prompt.content], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = prompt.name + '.txt';
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {Object.entries(groupedPrompts).map(([type, typePrompts]) => (
            <TabsContent key={type} value={type} className="mt-6 h-full">
              <ScrollArea className="h-full">
                <div className="grid gap-4">
                  {typePrompts.map((prompt, index) => (
                    <Card key={index} className="p-4 bg-gradient-card border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">{prompt.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {prompt.path} • Modified {prompt.lastModified.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {prompt.version && (
                            <Badge variant="outline" className="text-xs">
                              v{prompt.version}
                            </Badge>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh]">
                              <DialogHeader>
                                <DialogTitle>{prompt.name}</DialogTitle>
                              </DialogHeader>
                              <ScrollArea className="h-[60vh]">
                                <pre className="whitespace-pre-wrap text-sm bg-code-bg p-4 rounded border">
                                  {prompt.content}
                                </pre>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              const blob = new Blob([prompt.content], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = prompt.name + '.txt';
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default PromptRegistry;