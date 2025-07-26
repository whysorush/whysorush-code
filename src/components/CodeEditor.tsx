import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import FileBrowser from './FileBrowser';
import { 
  FileText, 
  Play, 
  Save, 
  Undo, 
  Redo, 
  Search, 
  Settings,
  Code2,
  GitBranch,
  FolderTree,
  X,
  Upload
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

interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  lastModified: Date;
  children?: FileSystemItem[];
  content?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ className }) => {
  const [activeFiles, setActiveFiles] = useState<CodeFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [showFileBrowser, setShowFileBrowser] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (file: FileSystemItem) => {
    if (file.type === 'file') {
      // Check if file is already open
      const existingFile = activeFiles.find(f => f.path === file.path);
      
      if (existingFile) {
        setActiveFileId(existingFile.id);
      } else {
        // Create new CodeFile from FileSystemItem
        const language = getLanguageFromExtension(file.name);
        const newFile: CodeFile = {
          id: file.id,
          name: file.name,
          path: file.path,
          language,
          content: file.content || `// Loading ${file.name}...`,
          isModified: false,
          lastModified: file.lastModified
        };
        
        setActiveFiles(prev => [...prev, newFile]);
        setActiveFileId(file.id);
      }
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const language = getLanguageFromExtension(file.name);
      const newFile: CodeFile = {
        id: Date.now().toString(),
        name: file.name,
        path: `uploaded/${file.name}`,
        language,
        content,
        isModified: false,
        lastModified: new Date(file.lastModified)
      };
      
      setActiveFiles(prev => [...prev, newFile]);
      setActiveFileId(newFile.id);
    };
    reader.readAsText(file);
  };

  const closeFile = (fileId: string) => {
    setActiveFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFileId === fileId) {
      const remainingFiles = activeFiles.filter(f => f.id !== fileId);
      setActiveFileId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }
  };

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'txt': return 'text';
      default: return 'text';
    }
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFileBrowser(!showFileBrowser)}
            >
              <FolderTree className="h-4 w-4 mr-2" />
              {showFileBrowser ? 'Hide' : 'Show'} Files
            </Button>
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
      {activeFiles.length > 0 && (
        <div className="border-b border-border">
          <div className="flex items-center overflow-x-auto">
            {activeFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center gap-2 px-4 py-2 text-sm border-r border-border whitespace-nowrap transition-colors group ${
                  activeFileId === file.id
                    ? 'bg-background text-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                <button
                  onClick={() => setActiveFileId(file.id)}
                  className="flex items-center gap-2"
                >
                  <div className={`w-2 h-2 rounded-full ${getLanguageColor(file.language)}`} />
                  <span>{file.name}</span>
                  {file.isModified && (
                    <div className="w-2 h-2 bg-warning rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => closeFile(file.id)}
                  className="ml-2 opacity-0 group-hover:opacity-100 hover:bg-muted rounded p-1 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
        {/* File Browser */}
        {showFileBrowser && (
          <div className="w-80 border-r border-border">
            <FileBrowser 
              onFileSelect={handleFileSelect}
              onFileUpload={handleFileUpload}
            />
          </div>
        )}

        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          {activeFile ? (
            <div className="flex-1 p-4">
              <Textarea
                value={activeFile.content}
                onChange={(e) => handleFileChange(activeFile.id, e.target.value)}
                className="h-full font-mono text-sm resize-none bg-code-bg border-code-border"
                placeholder="Start typing..."
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No file selected</p>
                <p className="text-sm">Select a file from the explorer to start editing</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                  accept=".txt,.md,.js,.ts,.tsx,.jsx,.css,.html,.json"
                />
              </div>
            </div>
          )}

          {/* Minimap (placeholder) */}
          {activeFile && (
            <div className="w-24 bg-muted/20 border-l border-border">
              <div className="p-2">
                <div className="text-xs text-muted-foreground mb-2">Minimap</div>
                <div className="space-y-1">
                  {Array.from({ length: Math.min(20, activeFile.content.split('\n').length) }).map((_, i) => (
                    <div key={i} className="h-1 bg-muted/50 rounded" />
                  ))}
                </div>
              </div>
            </div>
          )}
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