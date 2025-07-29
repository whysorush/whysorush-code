import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Code2, Wrench, MessageSquare, Settings, Zap, Sparkles, Upload } from 'lucide-react';
import { DeepSeekProvider, DeepSeekConfigDialog } from '@/components/DeepSeekProvider';
import PromptRegistry from '@/components/PromptRegistry';
import ChatInterface from '@/components/ChatInterface';
import CodeEditor from '@/components/CodeEditor';
import MemoryPanel from '@/components/MemoryPanel';
import ToolOrchestration from '@/components/ToolOrchestration';
import Composer from '@/components/Composer/Composer';
import ProjectUploader from '@/components/ProjectUploader';
import { sampleFileSystem } from '@/data/sampleFileSystem';
import { FileSystemItem } from '@/types/fileSystem';

const Index = () => {
  const [activePanel, setActivePanel] = useState<'chat' | 'code' | 'composer' | 'memory' | 'tools' | 'prompts'>('chat');
  const [projectFiles, setProjectFiles] = useState<FileSystemItem[]>(sampleFileSystem);
  const [selectedFile, setSelectedFile] = useState<FileSystemItem | null>(null);
  const [showProjectUploader, setShowProjectUploader] = useState(false);

  const panels = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, description: 'Interactive AI coding sessions' },
    { id: 'code', label: 'Code', icon: Code2, description: 'Code editor with syntax highlighting' },
    { id: 'composer', label: 'Composer', icon: Sparkles, description: 'AI-powered code assistant' },
    { id: 'memory', label: 'Memory', icon: Brain, description: 'AI learning and context retention' },
    { id: 'tools', label: 'Tools', icon: Wrench, description: 'Tool orchestration and automation' },
    { id: 'prompts', label: 'Prompts', icon: Settings, description: 'Prompt registry and management' }
  ];

  const handleFileSelect = (file: FileSystemItem) => {
    setSelectedFile(file);
    console.log('Selected file:', file);
  };

  const handleApplyChanges = (changes: any[]) => {
    console.log('Applied changes:', changes);
    // Here you would update the actual file system
    // For now, we'll just log the changes
  };

  const handleProjectUpload = (files: FileSystemItem[]) => {
    setProjectFiles(files);
    console.log('Project uploaded:', files);
  };

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'chat':
        return <ChatInterface className="h-full" />;
      case 'code':
        return <CodeEditor className="h-full" initialFiles={[]} />;
      case 'composer':
        return (
          <div className="h-full">
            <Composer
              initialFiles={projectFiles}
              onFileSelect={handleFileSelect}
              onApplyChanges={handleApplyChanges}
              width="100%"
              height="100%"
            />
          </div>
        );
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
                  <h1 className="text-2xl font-bold text-foreground">Whysorush Flow</h1>
                  <p className="text-sm text-muted-foreground">
                    AI-powered code editor with context-aware assistance
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowProjectUploader(true)}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Project
                </Button>
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
                <span>•</span>
                <span>Composer AI Assistant</span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-xs">
                  Ready for Development
                </Badge>
              </div>
            </div>
          </div>
        </footer>

        {/* Project Uploader Modal */}
        {showProjectUploader && (
          <ProjectUploader
            onProjectUpload={handleProjectUpload}
            onClose={() => setShowProjectUploader(false)}
          />
        )}
      </div>
    </DeepSeekProvider>
  );
};

export default Index;
