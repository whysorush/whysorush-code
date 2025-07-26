import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Wrench, 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Zap,
  Settings,
  Activity
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'analysis' | 'quality' | 'security' | 'performance' | 'visualization';
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  lastRun?: Date;
  results?: any;
}

interface ToolOrchestrationProps {
  className?: string;
}

const ToolOrchestration: React.FC<ToolOrchestrationProps> = ({ className }) => {
  const [tools, setTools] = useState<Tool[]>([
    {
      id: 'code_analyzer',
      name: 'Code Analyzer',
      description: 'Analyzes code structure, patterns, and quality metrics',
      category: 'analysis',
      status: 'completed',
      progress: 100,
      lastRun: new Date(Date.now() - 30 * 60 * 1000),
      results: { files: 45, issues: 3, score: 8.5 }
    },
    {
      id: 'linter',
      name: 'Code Linter',
      description: 'Performs linting checks for style and potential issues',
      category: 'quality',
      status: 'idle',
      progress: 0
    },
    {
      id: 'security_scanner',
      name: 'Security Scanner',
      description: 'Scans code for security vulnerabilities and issues',
      category: 'security',
      status: 'running',
      progress: 65
    },
    {
      id: 'performance_profiler',
      name: 'Performance Profiler',
      description: 'Analyzes code performance and identifies bottlenecks',
      category: 'performance',
      status: 'idle',
      progress: 0
    },
    {
      id: 'diff_generator',
      name: 'Diff Generator',
      description: 'Generates precise diffs showing proposed changes',
      category: 'visualization',
      status: 'completed',
      progress: 100,
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
      results: { changes: 12, additions: 45, deletions: 23 }
    },
    {
      id: 'test_runner',
      name: 'Test Runner',
      description: 'Executes tests and reports results',
      category: 'quality',
      status: 'error',
      progress: 100,
      lastRun: new Date(Date.now() - 5 * 60 * 1000),
      results: { passed: 23, failed: 2, total: 25 }
    }
  ]);

  const [isRunningPipeline, setIsRunningPipeline] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'analysis': return 'bg-primary';
      case 'quality': return 'bg-success';
      case 'security': return 'bg-destructive';
      case 'performance': return 'bg-warning';
      case 'visualization': return 'bg-accent';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-warning animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const runTool = (toolId: string) => {
    setTools(tools => 
      tools.map(tool => 
        tool.id === toolId 
          ? { ...tool, status: 'running', progress: 0 }
          : tool
      )
    );

    // Simulate tool execution
    const progressInterval = setInterval(() => {
      setTools(tools => 
        tools.map(tool => {
          if (tool.id === toolId && tool.status === 'running') {
            const newProgress = Math.min(tool.progress + 10, 100);
            return {
              ...tool,
              progress: newProgress,
              ...(newProgress === 100 && {
                status: 'completed',
                lastRun: new Date(),
                results: { completed: true }
              })
            };
          }
          return tool;
        })
      );
    }, 500);

    setTimeout(() => {
      clearInterval(progressInterval);
    }, 5000);
  };

  const runPipeline = () => {
    setIsRunningPipeline(true);
    // Reset all tools and run them sequentially
    setTools(tools => 
      tools.map(tool => ({ ...tool, status: 'idle', progress: 0 }))
    );

    // Simulate pipeline execution
    setTimeout(() => {
      setIsRunningPipeline(false);
      setTools(tools => 
        tools.map(tool => ({
          ...tool,
          status: 'completed',
          progress: 100,
          lastRun: new Date()
        }))
      );
    }, 8000);
  };

  const groupedTools = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  const overallStats = {
    total: tools.length,
    running: tools.filter(t => t.status === 'running').length,
    completed: tools.filter(t => t.status === 'completed').length,
    errors: tools.filter(t => t.status === 'error').length
  };

  return (
    <div className={`h-full flex flex-col bg-gradient-card border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Tool Orchestration</h2>
              <p className="text-sm text-muted-foreground">
                Coordinate and execute development tools
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={runPipeline}
              disabled={isRunningPipeline}
            >
              <Play className="h-4 w-4 mr-2" />
              Run Pipeline
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="p-4 border-b border-border bg-muted/20">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{overallStats.total}</div>
            <div className="text-xs text-muted-foreground">Total Tools</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{overallStats.running}</div>
            <div className="text-xs text-muted-foreground">Running</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{overallStats.completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{overallStats.errors}</div>
            <div className="text-xs text-muted-foreground">Errors</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <Tabs defaultValue="all" className="h-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {Object.entries(groupedTools).map(([category, categoryTools]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-foreground mb-3 capitalize">
                      {category} Tools
                    </h3>
                    <div className="grid gap-3">
                      {categoryTools.map((tool) => (
                        <Card key={tool.id} className="p-4 bg-gradient-card border-border">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge className={`${getCategoryColor(tool.category)} text-xs`}>
                                  {tool.category}
                                </Badge>
                                <div>
                                  <h4 className="font-medium text-foreground">{tool.name}</h4>
                                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(tool.status)}
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => runTool(tool.id)}
                                  disabled={tool.status === 'running'}
                                >
                                  {tool.status === 'running' ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            {tool.status === 'running' && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Progress</span>
                                  <span>{tool.progress}%</span>
                                </div>
                                <Progress value={tool.progress} className="h-2" />
                              </div>
                            )}

                            {tool.results && (
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                {Object.entries(tool.results).map(([key, value]) => (
                                  <span key={key}>
                                    {key}: <span className="text-foreground">{String(value)}</span>
                                  </span>
                                ))}
                                {tool.lastRun && (
                                  <span>
                                    Last run: {tool.lastRun.toLocaleTimeString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {['analysis', 'quality', 'security', 'performance'].map((category) => (
            <TabsContent key={category} value={category} className="mt-4">
              <ScrollArea className="h-full">
                <div className="grid gap-3">
                  {groupedTools[category]?.map((tool) => (
                    <Card key={tool.id} className="p-4 bg-gradient-card border-border">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">{tool.name}</h4>
                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(tool.status)}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => runTool(tool.id)}
                              disabled={tool.status === 'running'}
                            >
                              {tool.status === 'running' ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        {tool.status === 'running' && (
                          <Progress value={tool.progress} className="h-2" />
                        )}
                      </div>
                    </Card>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No {category} tools available
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}

          <TabsContent value="results" className="mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {tools.filter(t => t.results).map((tool) => (
                  <Card key={tool.id} className="p-4 bg-gradient-card border-border">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">{tool.name}</h4>
                        <Badge className={`${getCategoryColor(tool.category)} text-xs`}>
                          {tool.category}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(tool.results || {}).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="text-lg font-bold text-foreground">
                              {String(value)}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {key}
                            </div>
                          </div>
                        ))}
                      </div>
                      {tool.lastRun && (
                        <div className="text-xs text-muted-foreground">
                          Last run: {tool.lastRun.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ToolOrchestration;