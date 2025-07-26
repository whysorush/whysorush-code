import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Play, 
  Save, 
  Undo, 
  Redo, 
  Search, 
  Settings,
  Code2,
  GitBranch
} from 'lucide-react';

interface CodeFile {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  isModified: boolean;
  lastModified: Date;
}

interface CodeEditorProps {
  className?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ className }) => {
  const [activeFiles, setActiveFiles] = useState<CodeFile[]>([
    {
      id: '1',
      name: 'App.tsx',
      path: 'src/App.tsx',
      language: 'typescript',
      content: `import React from 'react';\nimport { BrowserRouter, Routes, Route } from 'react-router-dom';\nimport Index from './pages/Index';\n\nconst App = () => (\n  <BrowserRouter>\n    <Routes>\n      <Route path="/" element={<Index />} />\n    </Routes>\n  </BrowserRouter>\n);\n\nexport default App;`,
      isModified: false,
      lastModified: new Date()
    },
    {
      id: '2',
      name: 'index.css',
      path: 'src/index.css',
      language: 'css',
      content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n/* Custom styles */\n.gradient-bg {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n}`,
      isModified: true,
      lastModified: new Date()
    }
  ]);
  const [activeFileId, setActiveFileId] = useState('1');

  const activeFile = activeFiles.find(f => f.id === activeFileId);

  const handleFileChange = (fileId: string, newContent: string) => {
    setActiveFiles(files => 
      files.map(file => 
        file.id === fileId 
          ? { ...file, content: newContent, isModified: true }
          : file
      )
    );
  };

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'typescript': return 'bg-blue-500';
      case 'javascript': return 'bg-yellow-500';
      case 'css': return 'bg-purple-500';
      case 'html': return 'bg-orange-500';
      case 'json': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const renderSyntaxHighlighting = (content: string, language: string) => {
    // Simple syntax highlighting - in a real implementation, use a proper library like Prism.js
    const lines = content.split('\n');
    
    return lines.map((line, index) => (
      <div key={index} className="flex">
        <span className="text-code-comment w-12 text-right pr-4 select-none">
          {index + 1}
        </span>
        <span className="flex-1">
          {language === 'typescript' || language === 'javascript' ? (
            <span className="text-code-string">{line}</span>
          ) : language === 'css' ? (
            <span className="text-code-keyword">{line}</span>
          ) : (
            <span className="text-foreground">{line}</span>
          )}
        </span>
      </div>
    ));
  };

  return (
    <div className={`h-full flex flex-col bg-gradient-card border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Code Editor</h2>
              <p className="text-sm text-muted-foreground">
                Edit and manage your project files
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Find
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* File Tabs */}
      <div className="border-b border-border">
        <div className="flex items-center overflow-x-auto">
          {activeFiles.map((file) => (
            <button
              key={file.id}
              onClick={() => setActiveFileId(file.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm border-r border-border whitespace-nowrap transition-colors ${
                activeFileId === file.id
                  ? 'bg-background text-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${getLanguageColor(file.language)}`} />
              <span>{file.name}</span>
              {file.isModified && (
                <div className="w-2 h-2 bg-warning rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="ghost" size="sm">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Redo className="h-4 w-4" />
          </Button>
          <div className="h-4 w-px bg-border mx-2" />
          <Button variant="ghost" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
          <div className="ml-auto flex items-center gap-2">
            {activeFile && (
              <>
                <Badge variant="outline" className="text-xs">
                  <GitBranch className="h-3 w-3 mr-1" />
                  {activeFile.language}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {activeFile.content.split('\n').length} lines
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex">
        {/* Line Numbers & Code */}
        <ScrollArea className="flex-1">
          {activeFile ? (
            <div className="p-4">
              <pre className="bg-code-bg p-4 rounded border text-sm font-mono overflow-x-auto">
                <code>
                  {renderSyntaxHighlighting(activeFile.content, activeFile.language)}
                </code>
              </pre>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No file selected</p>
                <p className="text-sm">Select a file from the tabs above to start editing</p>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Minimap (placeholder) */}
        <div className="w-24 bg-muted/20 border-l border-border">
          <div className="p-2">
            <div className="text-xs text-muted-foreground mb-2">Minimap</div>
            <div className="space-y-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="h-1 bg-muted/50 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t border-border bg-muted/50 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-muted-foreground">
            {activeFile && (
              <>
                <span>Line 1, Column 1</span>
                <span>UTF-8</span>
                <span>LF</span>
                <span>{activeFile.language.toUpperCase()}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>Spaces: 2</span>
            <span>Tab Size: 2</span>
            {activeFile?.isModified && (
              <Badge variant="outline" className="text-xs">
                Modified
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;