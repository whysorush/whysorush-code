import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Folder, 
  File, 
  Upload, 
  Download, 
  Plus, 
  Search,
  FolderOpen,
  FileText,
  FileCode,
  Image,
  Settings
} from 'lucide-react';

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

interface FileBrowserProps {
  className?: string;
  onFileSelect?: (file: FileSystemItem) => void;
  onFileUpload?: (file: File) => void;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ 
  className, 
  onFileSelect, 
  onFileUpload 
}) => {
  const [files, setFiles] = useState<FileSystemItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'src/components', 'src/prompts']));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    loadFileSystem();
  }, []);

  const loadFileSystem = async () => {
    // Simulate file system structure
    const fileStructure: FileSystemItem[] = [
      {
        id: 'src',
        name: 'src',
        type: 'folder',
        path: 'src',
        lastModified: new Date(),
        children: [
          {
            id: 'src/components',
            name: 'components',
            type: 'folder',
            path: 'src/components',
            lastModified: new Date(),
            children: [
              {
                id: 'src/components/App.tsx',
                name: 'App.tsx',
                type: 'file',
                path: 'src/components/App.tsx',
                size: 1024,
                lastModified: new Date(),
                content: 'import React from "react";\n\nconst App = () => {\n  return <div>Hello World</div>;\n};\n\nexport default App;'
              },
              {
                id: 'src/components/ChatInterface.tsx',
                name: 'ChatInterface.tsx',
                type: 'file',
                path: 'src/components/ChatInterface.tsx',
                size: 2048,
                lastModified: new Date()
              }
            ]
          },
          {
            id: 'src/prompts',
            name: 'prompts',
            type: 'folder',
            path: 'src/prompts',
            lastModified: new Date(),
            children: [
              {
                id: 'src/prompts/agent-v1.0.txt',
                name: 'Agent Prompt v1.0.txt',
                type: 'file',
                path: 'src/prompts/Agent Prompt v1.0.txt',
                size: 4096,
                lastModified: new Date()
              },
              {
                id: 'src/prompts/agent-v1.2.txt',
                name: 'Agent Prompt v1.2.txt',
                type: 'file',
                path: 'src/prompts/Agent Prompt v1.2.txt',
                size: 5120,
                lastModified: new Date()
              },
              {
                id: 'src/prompts/tools.json',
                name: 'Agent Tools v1.0.json',
                type: 'file',
                path: 'src/prompts/Agent Tools v1.0.json',
                size: 3072,
                lastModified: new Date()
              }
            ]
          }
        ]
      },
      {
        id: 'public',
        name: 'public',
        type: 'folder',
        path: 'public',
        lastModified: new Date(),
        children: [
          {
            id: 'public/index.html',
            name: 'index.html',
            type: 'file',
            path: 'public/index.html',
            size: 512,
            lastModified: new Date()
          }
        ]
      }
    ];

    setFiles(fileStructure);
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleFileClick = (file: FileSystemItem) => {
    if (file.type === 'folder') {
      toggleFolder(file.id);
    } else {
      setSelectedFile(file.id);
      onFileSelect?.(file);
    }
  };

  const getFileIcon = (file: FileSystemItem) => {
    if (file.type === 'folder') {
      return expandedFolders.has(file.id) ? FolderOpen : Folder;
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'tsx':
      case 'ts':
      case 'js':
      case 'jsx':
        return FileCode;
      case 'txt':
      case 'md':
        return FileText;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return Image;
      default:
        return File;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const renderFileTree = (items: FileSystemItem[], level = 0) => {
    return items
      .filter(item => 
        searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(item => (
        <div key={item.id}>
          <button
            onClick={() => handleFileClick(item)}
            className={`w-full flex items-center gap-2 px-2 py-1 text-sm hover:bg-muted/50 rounded transition-colors ${
              selectedFile === item.id ? 'bg-primary/10 text-primary' : 'text-foreground'
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
          >
            {React.createElement(getFileIcon(item), { 
              className: "h-4 w-4 flex-shrink-0" 
            })}
            <span className="flex-1 text-left truncate">{item.name}</span>
            {item.type === 'file' && item.size && (
              <span className="text-xs text-muted-foreground">
                {formatFileSize(item.size)}
              </span>
            )}
          </button>
          {item.type === 'folder' && 
           expandedFolders.has(item.id) && 
           item.children && (
            <div>
              {renderFileTree(item.children, level + 1)}
            </div>
          )}
        </div>
      ));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  return (
    <div className={`h-full flex flex-col bg-gradient-card border border-border rounded-lg ${className}`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">File Explorer</h3>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 p-2">
        <ScrollArea className="h-full">
          {renderFileTree(files)}
        </ScrollArea>
      </div>

      <Separator />
      
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" size="sm" asChild>
              <span className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                New
              </span>
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FileBrowser;