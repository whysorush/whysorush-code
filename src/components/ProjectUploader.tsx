import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  Folder, 
  FileText, 
  Code2, 
  CheckCircle, 
  AlertCircle,
  X,
  Download,
  FolderOpen,
  File,
  Loader2
} from 'lucide-react';
import { FileSystemItem } from '@/types/fileSystem';

interface ProjectUploaderProps {
  onProjectUpload: (files: FileSystemItem[]) => void;
  onClose: () => void;
}

interface UploadedFile {
  file: File;
  path: string;
  content?: string;
  error?: string;
}

const ProjectUploader: React.FC<ProjectUploaderProps> = ({
  onProjectUpload,
  onClose
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directoryInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    
    const fileArray = Array.from(files);
    const processedFiles: UploadedFile[] = [];
    
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      
      try {
        // Create a relative path for the file
        const path = file.webkitRelativePath || file.name;

        // Exclude any file under a node_modules directory or any file/folder starting with '.'
        const pathParts = path.split('/');
        if (
          pathParts.some(part => part === 'node_modules' || part.startsWith('.'))
        ) {
          // Skip this file
          continue;
        }
        
        // Read file content for text files
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
            file.name.endsWith('.html')) {
          content = await file.text();
        }
        
        processedFiles.push({
          file,
          path,
          content
        });
      } catch (err) {
        processedFiles.push({
          file,
          path: file.name,
          error: err instanceof Error ? err.message : 'Failed to process file'
        });
      }
      
      setProgress((i + 1) / fileArray.length * 100);
    }
    
    setUploadedFiles(processedFiles);
    setIsProcessing(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleDirectoryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const convertToFileSystem = (): FileSystemItem[] => {
    const fileSystem: FileSystemItem[] = [];
    const fileMap = new Map<string, FileSystemItem>();
    
    uploadedFiles.forEach((uploadedFile) => {
      const pathParts = uploadedFile.path.split('/');
      let currentPath = '';
      
      // Create folder structure
      for (let i = 0; i < pathParts.length - 1; i++) {
        const folderName = pathParts[i];
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
        
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
          
          if (parentPath) {
            const parent = fileMap.get(parentPath);
            if (parent && parent.children) {
              parent.children.push(folder);
            }
          } else {
            fileSystem.push(folder);
          }
        }
      }
      
      // Add file
      const fileName = pathParts[pathParts.length - 1];
      const file: FileSystemItem = {
        id: uploadedFile.path,
        name: fileName,
        type: 'file',
        path: uploadedFile.path,
        size: uploadedFile.file.size,
        lastModified: new Date(uploadedFile.file.lastModified),
        content: uploadedFile.content
      };
      
      fileMap.set(uploadedFile.path, file);
      
      if (pathParts.length === 1) {
        fileSystem.push(file);
      } else {
        const parentPath = pathParts.slice(0, -1).join('/');
        const parent = fileMap.get(parentPath);
        if (parent && parent.children) {
          parent.children.push(file);
        }
      }
    });
    
    return fileSystem;
  };

  const handleImportProject = () => {
    const fileSystem = convertToFileSystem();
    onProjectUpload(fileSystem);
    onClose();
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'tsx':
      case 'ts':
      case 'js':
      case 'jsx':
        return <Code2 className="h-4 w-4" />;
      case 'json':
      case 'md':
      case 'txt':
        return <FileText className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension) {
      return extension.toUpperCase();
    }
    return 'FILE';
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-[800px] max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Upload className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Upload Project</h2>
                <p className="text-sm text-muted-foreground">
                  Upload your entire project directory to work with it in the code space
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Individual Files</label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <FileText className="h-4 w-4 mr-2" />
                Select Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".js,.ts,.tsx,.jsx,.json,.md,.txt,.css,.html,.py,.java,.cpp,.c,.go,.rs,.php,.rb,.swift,.kt"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Directory</label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => directoryInputRef.current?.click()}
                disabled={isProcessing}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Select Directory
              </Button>
              <input
                ref={directoryInputRef}
                type="file"
                {...({ webkitdirectory: "" } as any)}
                multiple
                onChange={handleDirectoryUpload}
                className="hidden"
              />
            </div>
          </div>

          {isProcessing && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing files...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>

        {uploadedFiles.length > 0 && (
          <>
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Uploaded Files ({uploadedFiles.length})</h3>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {uploadedFiles.filter(f => f.content).length} text files
                  </Badge>
                  <Badge variant="outline">
                    {uploadedFiles.filter(f => !f.content).length} binary files
                  </Badge>
                </div>
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {uploadedFiles.map((uploadedFile, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {uploadedFile.error ? (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        ) : uploadedFile.content ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          getFileIcon(uploadedFile.file.name)
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{uploadedFile.file.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {getFileType(uploadedFile.file.name)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {uploadedFile.path}
                          </div>
                          {uploadedFile.error && (
                            <div className="text-sm text-destructive">
                              {uploadedFile.error}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {(uploadedFile.file.size / 1024).toFixed(1)} KB
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="p-6 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Ready to import {uploadedFiles.length} files into your code space
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleImportProject}>
                    <Download className="h-4 w-4 mr-2" />
                    Import Project
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ProjectUploader; 