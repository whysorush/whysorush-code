import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Code2, Wrench, MessageSquare, Settings, Zap } from 'lucide-react';
import { DeepSeekProvider, DeepSeekConfigDialog } from '@/components/DeepSeekProvider';
import PromptRegistry from '@/components/PromptRegistry';
import ChatInterface from '@/components/ChatInterface';
import CodeEditor from '@/components/CodeEditor';
import MemoryPanel from '@/components/MemoryPanel';
import ToolOrchestration from '@/components/ToolOrchestration';

const Index = () => {
  const [activePanel, setActivePanel] = useState<'chat' | 'code' | 'memory' | 'tools' | 'prompts'>('chat');

  const panels = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, description: 'Interactive AI coding sessions' },
    { id: 'code', label: 'Code', icon: Code2, description: 'Code editor with syntax highlighting' },
    { id: 'memory', label: 'Memory', icon: Brain, description: 'AI learning and context retention' },
    { id: 'tools', label: 'Tools', icon: Wrench, description: 'Tool orchestration and automation' },
    { id: 'prompts', label: 'Prompts', icon: Settings, description: 'Prompt registry and management' }
  ];

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'chat':
        return <ChatInterface className="h-full" />;
      case 'code':
        return <CodeEditor className="h-full" />;
      case 'memory':
        return <MemoryPanel className="h-full" />;
      case 'tools':
        return <ToolOrchestration className="h-full" />;
      case 'prompts':
        return <PromptRegistry />;
      default:
        return <ChatInterface className="h-full" />;
    }
  };

  return (
    <DeepSeekProvider>
      <div className="min-h-screen bg-gradient-bg flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">AI Coding Agent</h1>
                  <p className="text-sm text-muted-foreground">
                    Context-aware code editing with multi-turn reasoning
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="animate-pulse-glow">
                  v1.0 Beta
                </Badge>
                <DeepSeekConfigDialog />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Sidebar Navigation */}
          <nav className="w-64 border-r border-border bg-card/30 backdrop-blur-sm">
            <div className="p-4">
              <div className="space-y-2">
                {panels.map((panel) => {
                  const Icon = panel.icon;
                  const isActive = activePanel === panel.id;
                  return (
                    <Button
                      key={panel.id}
                      variant={isActive ? 'default' : 'ghost'}
                      className={`w-full justify-start gap-3 ${
                        isActive ? 'bg-gradient-primary shadow-glow' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setActivePanel(panel.id as any)}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">{panel.label}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {panel.description}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Main Panel */}
          <main className="flex-1 p-6">
            <div className="h-full animate-fade-in">
              {renderActivePanel()}
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="border-t border-border bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Powered by DeepSeek AI</span>
                <span>•</span>
                <span>Cursor-inspired interface</span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-xs">
                  Ready for Development
                </Badge>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </DeepSeekProvider>
  );
};

export default Index;
