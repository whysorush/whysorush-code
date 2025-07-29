import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import FileBrowser from './FileBrowser';
import { FileSystemItem } from '@/types/fileSystem';
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
  Upload,
  FolderOpen,
  HardDrive,
  Plus,
  Trash2,
  AlertTriangle
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

interface SavedProject {
  id: string;
  name: string;
  files: FileSystemItem[];
  lastOpened: Date;
  createdAt: Date;
  totalSize: number;
}

interface CodeEditorProps {
  className?: string;
  initialFiles?: FileSystemItem[];
  showFileBrowser?: boolean;
  fileBrowserConfig?: {
    showSearch?: boolean;
    showUpload?: boolean;
    showNewFile?: boolean;
    showSettings?: boolean;
    showFileSize?: boolean;
    allowMultipleSelection?: boolean;
    defaultExpandedFolders?: string[];
  };
}

// Common ignore patterns (similar to .gitignore)
const IGNORE_PATTERNS = [
  // Dependencies
  'node_modules',
  'bower_components',
  'vendor',
  
  // Build outputs
  'dist',
  'build',
  'out',
  'target',
  '.next',
  '.nuxt',
  '.output',
  
  // Logs
  '*.log',
  'logs',
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
  'pnpm-debug.log*',
  'lerna-debug.log*',
  
  // OS files
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini',
  
  // Editor files
  '.vscode',
  '.idea',
  '*.swp',
  '*.swo',
  '*~',
  
  // Cache and temp files
  '.cache',
  '.tmp',
  'temp',
  'tmp',
  
  // Package files
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  
  // Large binary files
  '*.zip',
  '*.tar.gz',
  '*.rar',
  '*.7z',
  '*.exe',
  '*.dll',
  '*.so',
  '*.dylib',
  '*.bin',
  '*.dat',
  '*.db',
  '*.sqlite',
  '*.sqlite3',
  
  // Media files
  '*.jpg',
  '*.jpeg',
  '*.png',
  '*.gif',
  '*.bmp',
  '*.svg',
  '*.ico',
  '*.mp3',
  '*.mp4',
  '*.avi',
  '*.mov',
  '*.wmv',
  '*.flv',
  '*.webm',
  '*.pdf',
  '*.doc',
  '*.docx',
  '*.xls',
  '*.xlsx',
  '*.ppt',
  '*.pptx',
  
  // Large data files
  '*.csv',
  '*.json',
  '*.xml',
  '*.yaml',
  '*.yml',
  '*.toml',
  '*.ini',
  '*.cfg',
  '*.conf',
  
  // Git
  '.git',
  '.gitignore',
  '.gitattributes',
  
  // Environment files
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  '.env.test'
];

// Maximum file size to include in localStorage (now 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Maximum total project size for localStorage (now 100MB)
const MAX_PROJECT_SIZE = 100 * 1024 * 1024;

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  className,
  initialFiles = [],
  showFileBrowser: defaultShowFileBrowser = true,
  fileBrowserConfig = {}
}) => {
  const [activeFiles, setActiveFiles] = useState<CodeFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [showFileBrowser, setShowFileBrowser] = useState(defaultShowFileBrowser);
  const [currentProject, setCurrentProject] = useState<FileSystemItem[]>([]);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directoryInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const activeFile = activeFiles.find(f => f.id === activeFileId);

  // Check if a file should be ignored
  const shouldIgnoreFile = (filePath: string, fileName: string, fileSize: number): boolean => {
    // Check file size
    if (fileSize > MAX_FILE_SIZE) {
      return true;
    }

    // Check ignore patterns
    const path = filePath.toLowerCase();
    const name = fileName.toLowerCase();
    
    for (const pattern of IGNORE_PATTERNS) {
      if (pattern.includes('*')) {
        // Handle wildcard patterns
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        if (regex.test(name) || regex.test(path)) {
          return true;
        }
      } else {
        // Exact match
        if (path.includes(pattern.toLowerCase()) || name === pattern.toLowerCase()) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Compress data for localStorage
  const compressData = (data: any): string => {
    try {
      const jsonString = JSON.stringify(data);
      // Simple compression: remove unnecessary whitespace and use shorter property names
      return jsonString.replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.error('Compression failed:', error);
      return JSON.stringify(data);
    }
  };

  // Safe localStorage operations with error handling
  const safeSetItem = (key: string, value: any): boolean => {
    try {
      const compressed = compressData(value);
      const size = new Blob([compressed]).size;
      
      if (size > MAX_PROJECT_SIZE) {
        toast({
          title: "Project too large",
          description: `Project size (${(size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size (${MAX_PROJECT_SIZE / 1024 / 1024}MB). Some files may be excluded.`,
          variant: "destructive"
        });
        return false;
      }
      
      localStorage.setItem(key, compressed);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        toast({
          title: "Storage full",
          description: "Local storage is full. Please delete some saved projects to free up space.",
          variant: "destructive"
        });
        
        // Try to free up space by removing oldest projects
        try {
          const saved = localStorage.getItem('intellicode-saved-projects');
          if (saved) {
            const projects = JSON.parse(saved);
            if (projects.length > 1) {
              // Remove the oldest project
              projects.sort((a: SavedProject, b: SavedProject) => 
                new Date(a.lastOpened).getTime() - new Date(b.lastOpened).getTime()
              );
              projects.shift(); // Remove oldest
              localStorage.setItem('intellicode-saved-projects', compressData(projects));
              toast({
                title: "Space freed",
                description: "Removed oldest project to free up storage space.",
              });
            }
          }
        } catch (cleanupError) {
          console.error('Failed to cleanup storage:', cleanupError);
        }
      } else {
        toast({
          title: "Storage error",
          description: "Failed to save project to local storage.",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const safeGetItem = (key: string): any => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  };

  // Load saved projects from localStorage on component mount
  useEffect(() => {
    const saved = safeGetItem('intellicode-saved-projects');
    if (saved) {
      // Convert date strings back to Date objects
      const projectsWithDates = saved.map((project: any) => ({
        ...project,
        lastOpened: new Date(project.lastOpened),
        createdAt: new Date(project.createdAt),
        files: project.files.map((file: any) => ({
          ...file,
          lastModified: new Date(file.lastModified)
        }))
      }));
      setSavedProjects(projectsWithDates);
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (savedProjects.length > 0) {
      safeSetItem('intellicode-saved-projects', savedProjects);
    }
  }, [savedProjects]);

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
        path: file.name,
        language,
        content,
        isModified: false,
        lastModified: new Date()
      };
      
      setActiveFiles(prev => [...prev, newFile]);
      setActiveFileId(newFile.id);
    };
    reader.readAsText(file);
  };

  const handleDirectoryUpload = async (files: FileList) => {
    setIsLoading(true);
    const fileArray = Array.from(files);
    const projectFiles: FileSystemItem[] = [];
    const fileMap = new Map<string, FileSystemItem>();
    let totalSize = 0;
    let ignoredFiles = 0;
    let processedFiles = 0;
    let nodeModulesIgnored = 0;
    
    try {
      for (const file of fileArray) {
        try {
          const path = file.webkitRelativePath || file.name;
          const pathParts = path.split('/');

          // Stronger check: skip any file whose path includes node_modules as a folder
          if (pathParts.some(part => part === 'node_modules')) {
            nodeModulesIgnored++;
            ignoredFiles++;
            continue;
          }
          
          // Check if file should be ignored (other patterns)
          if (shouldIgnoreFile(path, file.name, file.size)) {
            ignoredFiles++;
            continue;
          }
          
          // Create folder structure
          for (let i = 0; i < pathParts.length - 1; i++) {
            const folderName = pathParts[i];
            const currentPath = pathParts.slice(0, i + 1).join('/');
            
            // Skip creating folder structure for node_modules
            if (folderName === 'node_modules') {
              continue;
            }
            
            if (!fileMap.has(currentPath)) {
              const folder: FileSystemItem = {
                id: currentPath,
                name: folderName,
                type: 'folder',
                path: currentPath,
                lastModified: new Date(),
                children: []
              };
              
              fileMap.set(currentPath, folder);
              
              if (i === 0) {
                projectFiles.push(folder);
              } else {
                const parentPath = pathParts.slice(0, i).join('/');
                const parent = fileMap.get(parentPath);
                if (parent && parent.children) {
                  parent.children.push(folder);
                }
              }
            }
          }
          
          // Add file
          const fileName = pathParts[pathParts.length - 1];
          let content: string | undefined;
          
          if (file.type.startsWith('text/') || 
              file.name.endsWith('.js') || 
              file.name.endsWith('.ts') || 
              file.name.endsWith('.tsx') || 
              file.name.endsWith('.jsx') || 
              file.name.endsWith('.json') || 
              file.name.endsWith('.md') || 
              file.name.endsWith('.txt') || 
              file.name.endsWith('.css') || 
              file.name.endsWith('.html') ||
              file.name.endsWith('.py') ||
              file.name.endsWith('.java') ||
              file.name.endsWith('.cpp') ||
              file.name.endsWith('.c') ||
              file.name.endsWith('.go') ||
              file.name.endsWith('.rs') ||
              file.name.endsWith('.php') ||
              file.name.endsWith('.rb') ||
              file.name.endsWith('.swift') ||
              file.name.endsWith('.kt')) {
            content = await file.text();
            totalSize += content.length;
          }
          
          const fileItem: FileSystemItem = {
            id: path,
            name: fileName,
            type: 'file',
            path: path,
            size: file.size,
            lastModified: new Date(file.lastModified),
            content
          };
          
          fileMap.set(path, fileItem);
          processedFiles++;
          
          if (pathParts.length === 1) {
            projectFiles.push(fileItem);
          } else {
            const parentPath = pathParts.slice(0, -1).join('/');
            const parent = fileMap.get(parentPath);
            if (parent && parent.children) {
              parent.children.push(fileItem);
            }
          }
        } catch (error) {
          console.error('Error processing file:', file.name, error);
          ignoredFiles++;
        }
      }
      
      setCurrentProject(projectFiles);
      
      // Save project to localStorage
      const projectName = fileArray[0]?.webkitRelativePath?.split('/')[0] || 'Uploaded Project';
      const savedProject: SavedProject = {
        id: Date.now().toString(),
        name: projectName,
        files: projectFiles,
        lastOpened: new Date(),
        createdAt: new Date(),
        totalSize
      };
      
      setSavedProjects(prev => [savedProject, ...prev]);
      
      // Show summary toast with node_modules info
      let description = `Processed ${processedFiles} files, ignored ${ignoredFiles} files. Total size: ${(totalSize / 1024).toFixed(2)}KB`;
      if (nodeModulesIgnored > 0) {
        description += ` (${nodeModulesIgnored} node_modules files excluded)`;
      }
      
      toast({
        title: "Project loaded successfully",
        description: description,
      });
      
    } catch (error) {
      console.error('Error loading directory:', error);
      toast({
        title: "Error loading project",
        description: "Failed to load the project directory. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadProject = (project: SavedProject) => {
    setCurrentProject(project.files);
    setSavedProjects(prev => 
      prev.map(p => 
        p.id === project.id 
          ? { ...p, lastOpened: new Date() }
          : p
      )
    );
    setShowLoadDialog(false);
    
    toast({
      title: "Project loaded",
      description: `Loaded ${project.name} with ${project.files.length} files`,
    });
  };

  const deleteProject = (projectId: string) => {
    setSavedProjects(prev => prev.filter(p => p.id !== projectId));
    toast({
      title: "Project deleted",
      description: "Project has been removed from saved projects",
    });
  };

  const saveCurrentProject = () => {
    if (currentProject.length === 0) {
      toast({
        title: "No project to save",
        description: "Please load a project first before saving",
        variant: "destructive"
      });
      return;
    }
    
    const projectName = prompt('Enter project name:');
    if (!projectName) return;
    
    const totalSize = JSON.stringify(currentProject).length;
    const savedProject: SavedProject = {
      id: Date.now().toString(),
      name: projectName,
      files: currentProject,
      lastOpened: new Date(),
      createdAt: new Date(),
      totalSize
    };
    
    setSavedProjects(prev => [savedProject, ...prev]);
    
    toast({
      title: "Project saved",
      description: `Project "${projectName}" has been saved successfully`,
    });
  };

  const closeFile = (fileId: string) => {
    setActiveFiles(files => files.filter(f => f.id !== fileId));
    if (activeFileId === fileId) {
      const remainingFiles = activeFiles.filter(f => f.id !== fileId);
      setActiveFileId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }
  };

  const getLanguageFromExtension = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'jsx': return 'javascript';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'txt': return 'text';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      case 'c': return 'c';
      case 'go': return 'go';
      case 'rs': return 'rust';
      case 'php': return 'php';
      case 'rb': return 'ruby';
      case 'swift': return 'swift';
      case 'kt': return 'kotlin';
      default: return 'text';
    }
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: '#f7df1e',
      typescript: '#3178c6',
      html: '#e34f26',
      css: '#1572b6',
      json: '#000000',
      markdown: '#000000',
      text: '#666666',
      python: '#3776ab',
      java: '#ed8b00',
      cpp: '#00599c',
      c: '#a8b9cc',
      go: '#00add8',
      rust: '#ce422b',
      php: '#777bb4',
      ruby: '#cc342d',
      swift: '#ffac45',
      kotlin: '#7f52ff'
    };
    return colors[language] || '#666666';
  };

  const renderSyntaxHighlighting = (content: string, language: string) => {
    // Simple syntax highlighting - in a real app, you'd use a library like Prism.js
    return content;
  };

  return (
    <div className={`flex flex-col h-full bg-background border border-border rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFileBrowser(!showFileBrowser)}
          >
            <FolderTree className="h-4 w-4 mr-2" />
            {showFileBrowser ? 'Hide' : 'Show'} Explorer
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLoadDialog(true)}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Load Project
          </Button>
          
          {currentProject.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={saveCurrentProject}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Project
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* File Explorer */}
        {showFileBrowser && (
          <div className="w-64 border-r border-border bg-muted/20">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">EXPLORER</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => directoryInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {isLoading && (
                <div className="text-center py-4 text-muted-foreground">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm">Loading project...</p>
                </div>
              )}
              
              {!isLoading && currentProject.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm mb-2">No project loaded</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => directoryInputRef.current?.click()}
                  >
                    Open Folder
                  </Button>
                </div>
              )}
              
              {!isLoading && currentProject.length > 0 && (
                <FileBrowser
                  initialFiles={currentProject}
                  config={fileBrowserConfig}
                  onFileSelect={handleFileSelect}
                  onFileUpload={handleFileUpload}
                  onFileCreate={(name, type) => {
                    console.log(`Creating ${type}: ${name}`);
                  }}
                  onFileDelete={(fileId) => {
                    console.log(`Deleting file: ${fileId}`);
                  }}
                  onFileRename={(fileId, newName) => {
                    console.log(`Renaming file ${fileId} to ${newName}`);
                  }}
                  onFolderToggle={(folderId, isExpanded) => {
                    console.log(`Folder ${folderId} ${isExpanded ? 'expanded' : 'collapsed'}`);
                  }}
                />
              )}
              
              <input
                ref={directoryInputRef}
                type="file"
                {...({ webkitdirectory: "" } as any)}
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    handleDirectoryUpload(files);
                  }
                }}
                className="hidden"
              />
            </div>
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
                <div className="flex gap-2 mt-4 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => directoryInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Open Folder
                  </Button>
                </div>
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

      {/* Load Project Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Project</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => directoryInputRef.current?.click()}
                className="flex-1"
                disabled={isLoading}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Open Folder from Disk
              </Button>
            </div>
            
            {savedProjects.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recently Opened Projects</h4>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {savedProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {project.files.length} files • {(project.totalSize / 1024).toFixed(2)}KB • Last opened: {project.lastOpened instanceof Date ? project.lastOpened.toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => loadProject(project)}
                          >
                            Load
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Storage Limits</span>
              </div>
              <ul className="space-y-1">
                <li>• Maximum file size: {(MAX_FILE_SIZE / 1024).toFixed(0)}KB</li>
                <li>• Maximum project size: {(MAX_PROJECT_SIZE / 1024 / 1024).toFixed(1)}MB</li>
                <li>• Large files and common ignore patterns are automatically excluded</li>
                <li>• Oldest projects are automatically removed when storage is full</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CodeEditor;