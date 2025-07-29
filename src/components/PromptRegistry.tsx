import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Upload, RefreshCw, Eye, Edit, Save, Brain, Zap, Settings } from 'lucide-react';
import { usePromptIntegration } from '@/hooks/usePromptIntegration';
import { Prompt } from '@/lib/promptManager';

const PromptRegistry = () => {
  const {
    prompts,
    selectedPrompt,
    isLoading,
    error,
    loadPrompts,
    selectPrompt,
    updatePrompt,
    getPromptsByType,
    stats
  } = usePromptIntegration();

  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Load prompt files
  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'agent': return 'bg-primary';
      case 'tools': return 'bg-accent';
      case 'chat': return 'bg-success';
      case 'memory': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'agent': return <Brain className="h-4 w-4" />;
      case 'tools': return <Settings className="h-4 w-4" />;
      case 'chat': return <FileText className="h-4 w-4" />;
      case 'memory': return <Zap className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setEditContent(prompt.content);
    setShowEditDialog(true);
  };

  const handleSavePrompt = async () => {
    if (editingPrompt) {
      await updatePrompt(editingPrompt.id, editContent);
      setShowEditDialog(false);
      setEditingPrompt(null);
      setEditContent('');
    }
  };

  const groupedPrompts = prompts.reduce((acc, prompt) => {
    if (!acc[prompt.type]) acc[prompt.type] = [];
    acc[prompt.type].push(prompt);
    return acc;
  }, {} as Record<string, Prompt[]>);

  return (
    <div className="h-full flex flex-col bg-gradient-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Brain className="h-5 w-5 text-primary-foreground" />
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
              onClick={loadPrompts}
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

        {/* Stats */}
        <div className="mt-4 flex gap-4">
          {Object.entries(stats).map(([type, count]) => (
            <div key={type} className="flex items-center gap-2">
              <Badge className={`${getTypeColor(type)} text-xs`}>
                {getTypeIcon(type)}
                {type}
              </Badge>
              <span className="text-sm text-muted-foreground">{count}</span>
            </div>
          ))}
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
                  <Card key={index} className="p-4 bg-gradient-card border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getTypeColor(prompt.type)} text-xs`}>
                          {getTypeIcon(prompt.type)}
                          {prompt.type}
                        </Badge>
                        <div>
                          <h3 className="font-medium text-foreground">{prompt.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {prompt.path} • Modified {prompt.lastModified.toLocaleDateString()}
                          </p>
                          {prompt.metadata?.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {prompt.metadata.description}
                            </p>
                          )}
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditPrompt(prompt)}
                        >
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
                            a.download = `${prompt.name}.txt`;
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
                    <Card key={index} className="p-4 bg-gradient-card border-border hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={`${getTypeColor(prompt.type)} text-xs`}>
                            {getTypeIcon(prompt.type)}
                            {prompt.type}
                          </Badge>
                          <div>
                            <h3 className="font-medium text-foreground">{prompt.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {prompt.path} • Modified {prompt.lastModified.toLocaleDateString()}
                            </p>
                            {prompt.metadata?.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {prompt.metadata.description}
                              </p>
                            )}
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
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditPrompt(prompt)}
                          >
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
                              a.download = `${prompt.name}.txt`;
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

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Edit Prompt: {editingPrompt?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt-content">Prompt Content</Label>
              <Textarea
                id="prompt-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="h-[50vh] font-mono text-sm"
                placeholder="Enter prompt content..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePrompt}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptRegistry;