import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Clock, 
  Star, 
  Trash2, 
  Search, 
  Filter,
  TrendingUp,
  Database
} from 'lucide-react';

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
      context: 'Component development patterns'
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
      context: 'Code formatting standards'
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
      context: 'Data fetching architecture'
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
      context: 'State management architecture'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memory.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || memory.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return 'bg-primary';
      case 'preference': return 'bg-accent';
      case 'project': return 'bg-success';
      case 'pattern': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-muted-foreground';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const memoryStats = {
    total: memories.length,
    highRelevance: memories.filter(m => m.relevanceScore >= 90).length,
    recentlyAccessed: memories.filter(m => {
      const hoursSinceAccess = (Date.now() - m.lastAccessed.getTime()) / (1000 * 60 * 60);
      return hoursSinceAccess < 24;
    }).length,
    averageScore: Math.round(memories.reduce((sum, m) => sum + m.relevanceScore, 0) / memories.length)
  };

  return (
    <div className={`h-full flex flex-col bg-gradient-card border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Memory System</h2>
              <p className="text-sm text-muted-foreground">
                AI learning and context retention
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-4 border-b border-border bg-muted/20">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{memoryStats.total}</div>
            <div className="text-xs text-muted-foreground">Total Memories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{memoryStats.highRelevance}</div>
            <div className="text-xs text-muted-foreground">High Relevance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{memoryStats.recentlyAccessed}</div>
            <div className="text-xs text-muted-foreground">Recent Access</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{memoryStats.averageScore}</div>
            <div className="text-xs text-muted-foreground">Avg Score</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <Tabs defaultValue="active" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4 h-full">
            {/* Search and Filter */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search memories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="technical">Technical</option>
                <option value="preference">Preference</option>
                <option value="project">Project</option>
                <option value="pattern">Pattern</option>
              </select>
            </div>

            {/* Memories List */}
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {filteredMemories.map((memory) => (
                  <Card key={memory.id} className="p-4 bg-gradient-card border-border hover:border-primary/50 transition-colors">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getTypeColor(memory.type)} text-xs`}>
                            {memory.type}
                          </Badge>
                          <h3 className="font-medium text-foreground">{memory.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-mono ${getScoreColor(memory.relevanceScore)}`}>
                            {memory.relevanceScore}%
                          </span>
                          <Star className="h-4 w-4 text-warning" />
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {memory.content}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {memory.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(memory.lastAccessed)}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {memory.accessCount} uses
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Star className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="patterns" className="mt-4">
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">Pattern Analysis</h3>
              <p className="text-muted-foreground">
                Discovered patterns and recurring solutions will appear here
              </p>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="mt-4">
            <div className="text-center py-8">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">User Preferences</h3>
              <p className="text-muted-foreground">
                Learned preferences and customizations will be displayed here
              </p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <div className="space-y-6">
              {/* Memory Distribution */}
              <Card className="p-4 bg-gradient-card">
                <h3 className="font-medium text-foreground mb-4">Memory Distribution</h3>
                <div className="space-y-3">
                  {['technical', 'preference', 'project', 'pattern'].map((type) => {
                    const count = memories.filter(m => m.type === type).length;
                    const percentage = (count / memories.length) * 100;
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{type}</span>
                          <span>{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-4 bg-gradient-card">
                <h3 className="font-medium text-foreground mb-4">Recent Activity</h3>
                <div className="space-y-2">
                  {memories
                    .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
                    .slice(0, 5)
                    .map((memory) => (
                      <div key={memory.id} className="flex justify-between items-center py-2">
                        <span className="text-sm text-foreground">{memory.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(memory.lastAccessed)}
                        </span>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MemoryPanel;