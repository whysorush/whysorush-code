import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Brain, 
  Clock, 
  Star, 
  Trash2, 
  Search, 
  Filter,
  TrendingUp,
  Database,
  Plus,
  Edit,
  Save,
  Zap,
  Sparkles
} from 'lucide-react';
import { usePromptIntegration } from '@/hooks/usePromptIntegration';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Memory {
  id: string;
  type: 'technical' | 'preference' | 'project' | 'pattern';
  title: string;
  content: string;
  relevanceScore: number;
  lastAccessed: Date;
  createdAt: Date;
  accessCount: number;
  tags: string[];
  context?: string;
  promptUsed?: string;
}

interface MemoryPanelProps {
  className?: string;
}

const MemoryPanel: React.FC<MemoryPanelProps> = ({ className }) => {
  const [memories, setMemories] = useState<Memory[]>([
    {
      id: '1',
      type: 'technical',
      title: 'React Component Pattern',
      content: 'User prefers functional components with hooks over class components. Always use TypeScript interfaces for props.',
      relevanceScore: 95,
      lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      accessCount: 12,
      tags: ['react', 'typescript', 'components'],
      context: 'Component development patterns',
      promptUsed: 'Agent Prompt v1.2'
    },
    {
      id: '2',
      type: 'preference',
      title: 'Code Style Preferences',
      content: 'Prefers 2-space indentation, single quotes, and trailing commas. Uses Prettier with specific config.',
      relevanceScore: 88,
      lastAccessed: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      accessCount: 25,
      tags: ['formatting', 'style', 'prettier'],
      context: 'Code formatting standards',
      promptUsed: 'Chat Prompt'
    },
    {
      id: '3',
      type: 'project',
      title: 'API Integration Strategy',
      content: 'Project uses React Query for data fetching. Error handling follows specific patterns with toast notifications.',
      relevanceScore: 92,
      lastAccessed: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      accessCount: 8,
      tags: ['api', 'react-query', 'error-handling'],
      context: 'Data fetching architecture',
      promptUsed: 'Agent Prompt v1.0'
    },
    {
      id: '4',
      type: 'pattern',
      title: 'State Management Pattern',
      content: 'Uses context for global state, local state for component-specific data. Avoids prop drilling.',
      relevanceScore: 85,
      lastAccessed: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      accessCount: 15,
      tags: ['state', 'context', 'react'],
      context: 'State management architecture',
      promptUsed: 'Memory Prompt'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [newMemory, setNewMemory] = useState({
    title: '',
    content: '',
    type: 'technical' as Memory['type'],
    tags: '',
    context: ''
  });

  // Integrate with prompt system
  const { prompts, getPromptsByType } = usePromptIntegration();
  const memoryPrompts = getPromptsByType('memory');

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memory.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || memory.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return 'bg-blue-500';
      case 'preference': return 'bg-green-500';
      case 'project': return 'bg-purple-500';
      case 'pattern': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleAddMemory = () => {
    const memory: Memory = {
      id: Date.now().toString(),
      title: newMemory.title,
      content: newMemory.content,
      type: newMemory.type,
      relevanceScore: 75, // Default score
      lastAccessed: new Date(),
      createdAt: new Date(),
      accessCount: 0,
      tags: newMemory.tags.split(',').map(t => t.trim()).filter(t => t),
      context: newMemory.context,
      promptUsed: memoryPrompts[0]?.name || 'Memory Prompt'
    };

    setMemories(prev => [memory, ...prev]);
    setShowAddMemory(false);
    setNewMemory({ title: '', content: '', type: 'technical', tags: '', context: '' });
  };

  const handleEditMemory = (memory: Memory) => {
    setEditingMemory(memory);
  };

  const handleSaveEdit = () => {
    if (editingMemory) {
      setMemories(prev => prev.map(m => 
        m.id === editingMemory.id ? editingMemory : m
      ));
      setEditingMemory(null);
    }
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const totalMemories = memories.length;
  const averageScore = memories.reduce((sum, m) => sum + m.relevanceScore, 0) / totalMemories;
  const totalAccesses = memories.reduce((sum, m) => sum + m.accessCount, 0);

  return (
    <div className={`h-full flex flex-col bg-gradient-card border border-border rounded-lg ${className}`}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Memory Panel</h2>
              <p className="text-sm text-muted-foreground">
                AI memory management and learning
              </p>
            </div>
          </div>
          <Button onClick={() => setShowAddMemory(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Memory
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Memories</span>
            </div>
            <p className="text-2xl font-bold">{totalMemories}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Avg Score</span>
            </div>
            <p className="text-2xl font-bold">{averageScore.toFixed(1)}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Accesses</span>
            </div>
            <p className="text-2xl font-bold">{totalAccesses}</p>
          </Card>
        </div>
      </div>

      <div className="flex-1 p-6">
        <Tabs defaultValue="all" className="h-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="preference">Preferences</TabsTrigger>
            <TabsTrigger value="project">Project</TabsTrigger>
            <TabsTrigger value="pattern">Patterns</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 h-full">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search memories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="preference">Preferences</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="pattern">Patterns</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-full">
              <div className="space-y-4">
                {filteredMemories.map((memory) => (
                  <Card key={memory.id} className="p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getTypeColor(memory.type)} text-white text-xs`}>
                            {memory.type}
                          </Badge>
                          <h3 className="font-medium">{memory.title}</h3>
                          <div className={`flex items-center gap-1 ${getScoreColor(memory.relevanceScore)}`}>
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-xs font-medium">{memory.relevanceScore}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{memory.content}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Created {formatTimeAgo(memory.createdAt)}</span>
                          <span>Accessed {formatTimeAgo(memory.lastAccessed)}</span>
                          <span>{memory.accessCount} accesses</span>
                          {memory.promptUsed && (
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {memory.promptUsed}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {memory.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditMemory(memory)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMemory(memory.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Type-specific tabs */}
          {['technical', 'preference', 'project', 'pattern'].map((type) => (
            <TabsContent key={type} value={type} className="mt-6 h-full">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {filteredMemories
                    .filter(memory => memory.type === type)
                    .map((memory) => (
                      <Card key={memory.id} className="p-4 hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`${getTypeColor(memory.type)} text-white text-xs`}>
                                {memory.type}
                              </Badge>
                              <h3 className="font-medium">{memory.title}</h3>
                              <div className={`flex items-center gap-1 ${getScoreColor(memory.relevanceScore)}`}>
                                <Star className="h-3 w-3 fill-current" />
                                <span className="text-xs font-medium">{memory.relevanceScore}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{memory.content}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Created {formatTimeAgo(memory.createdAt)}</span>
                              <span>Accessed {formatTimeAgo(memory.lastAccessed)}</span>
                              <span>{memory.accessCount} accesses</span>
                              {memory.promptUsed && (
                                <span className="flex items-center gap-1">
                                  <Zap className="h-3 w-3" />
                                  {memory.promptUsed}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {memory.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMemory(memory)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMemory(memory.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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

      {/* Add Memory Dialog */}
      <Dialog open={showAddMemory} onOpenChange={setShowAddMemory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Memory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newMemory.title}
                onChange={(e) => setNewMemory(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Memory title..."
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newMemory.content}
                onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Memory content..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={newMemory.type}
                onValueChange={(value: Memory['type']) => setNewMemory(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="preference">Preference</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="pattern">Pattern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={newMemory.tags}
                onChange={(e) => setNewMemory(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="react, typescript, components"
              />
            </div>
            <div>
              <Label htmlFor="context">Context</Label>
              <Input
                id="context"
                value={newMemory.context}
                onChange={(e) => setNewMemory(prev => ({ ...prev, context: e.target.value }))}
                placeholder="When this memory is relevant..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddMemory(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMemory}>
                <Save className="h-4 w-4 mr-2" />
                Add Memory
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Memory Dialog */}
      <Dialog open={!!editingMemory} onOpenChange={() => setEditingMemory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Memory</DialogTitle>
          </DialogHeader>
          {editingMemory && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingMemory.title}
                  onChange={(e) => setEditingMemory(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editingMemory.content}
                  onChange={(e) => setEditingMemory(prev => prev ? { ...prev, content: e.target.value } : null)}
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={editingMemory.type}
                  onValueChange={(value: Memory['type']) => setEditingMemory(prev => prev ? { ...prev, type: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="preference">Preference</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="pattern">Pattern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-score">Relevance Score</Label>
                <Input
                  id="edit-score"
                  type="number"
                  min="1"
                  max="100"
                  value={editingMemory.relevanceScore}
                  onChange={(e) => setEditingMemory(prev => prev ? { ...prev, relevanceScore: parseInt(e.target.value) } : null)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingMemory(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemoryPanel;