import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
  Settings,
  Trash2,
  Edit3,
  MoreHorizontal
} from 'lucide-react';
import { FileSystemItem, FileBrowserProps, FileBrowserConfig } from '@/types/fileSystem';
import { useFileSystem } from '@/hooks/useFileSystem';

const FileBrowser: React.FC<FileBrowserProps> = ({ 
  className,
  config = {},
  initialFiles = [],
  onFileSelect,
  onFileUpload,
  onFileCreate,
  onFileDelete,
  onFileRename,
  onFolderToggle,
  title = "File Explorer",
  height,
  width
}) => {
  const {
    showSearch = true,
    showUpload = true,
    showNewFile = true,
    showSettings = true,
    showFileSize = true,
    allowMultipleSelection = false,
    defaultExpandedFolders = [],
    fileTypes = {}
  }: FileBrowserConfig = config;

  const {
    files,
    loading,
    error,
    expandedFolders,
    selectedFiles,
    toggleFolder,
    selectFile,
    clearSelection,
    createFile,
    createFolder,
    deleteFile,
    renameFile
  } = useFileSystem({
    initialFiles,
    autoLoad: false
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file');
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Set default expanded folders on mount
  React.useEffect(() => {
    if (defaultExpandedFolders.length > 0) {
      defaultExpandedFolders.forEach(folderId => {
        if (!expandedFolders.has(folderId)) {
          toggleFolder(folderId);
        }
      });
    }
  }, [defaultExpandedFolders, expandedFolders, toggleFolder]);

  const handleFileClick = (file: FileSystemItem) => {
    if (file.type === 'folder') {
      toggleFolder(file.id);
      onFolderToggle?.(file.id, !expandedFolders.has(file.id));
    } else {
      selectFile(file.id, allowMultipleSelection);
      onFileSelect?.(file);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  const handleCreateItem = async () => {
    if (!newItemName.trim()) return;
    
    try {
      if (newItemType === 'file') {
        await createFile(newItemName, '', '');
        onFileCreate?.(newItemName, 'file');
      } else {
        await createFolder(newItemName, '');
        onFileCreate?.(newItemName, 'folder');
      }
      setIsCreating(false);
      setNewItemName('');
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      onFileDelete?.(fileId);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const handleRenameFile = async (fileId: string) => {
    if (!editName.trim()) return;
    
    try {
      await renameFile(fileId, editName);
      onFileRename?.(fileId, editName);
      setEditingFile(null);
      setEditName('');
    } catch (error) {
      console.error('Failed to rename file:', error);
    }
  };

  const getFileIcon = (file: FileSystemItem) => {
    if (file.type === 'folder') {
      return expandedFolders.has(file.id) ? FolderOpen : Folder;
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    // Check custom file types first
    for (const [typeName, typeConfig] of Object.entries(fileTypes)) {
      if (typeConfig.extensions.includes(extension || '')) {
        return FileCode; // You could map to specific icons here
      }
    }
    
    // Default file type mapping
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
      case 'svg':
        return Image;
      case 'json':
      case 'xml':
      case 'yaml':
      case 'yml':
        return FileText;
      default:
        return File;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || !showFileSize) return '';
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
          <div
            className={`group flex items-center gap-2 px-2 py-1 text-sm hover:bg-muted/50 rounded transition-colors ${
              selectedFiles.has(item.id) ? 'bg-primary/10 text-primary' : 'text-foreground'
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
          >
            <button
              onClick={() => handleFileClick(item)}
              className="flex items-center gap-2 flex-1 text-left"
            >
              {React.createElement(getFileIcon(item), { 
                className: "h-4 w-4 flex-shrink-0" 
              })}
              <span className="flex-1 truncate">
                {editingFile === item.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameFile(item.id);
                      } else if (e.key === 'Escape') {
                        setEditingFile(null);
                        setEditName('');
                      }
                    }}
                    onBlur={() => {
                      setEditingFile(null);
                      setEditName('');
                    }}
                    className="bg-background border border-border rounded px-1 text-xs"
                    autoFocus
                  />
                ) : (
                  item.name
                )}
              </span>
            </button>
            
            {item.type === 'file' && item.size && (
              <span className="text-xs text-muted-foreground">
                {formatFileSize(item.size)}
              </span>
            )}
            
            {/* Action buttons */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
              {item.type === 'file' && (
                <>
                  <button
                    onClick={() => {
                      setEditingFile(item.id);
                      setEditName(item.name);
                    }}
                    className="p-1 hover:bg-muted rounded"
                    title="Rename"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteFile(item.id)}
                    className="p-1 hover:bg-muted rounded text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </>
              )}
            </div>
          </div>
          
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

  const containerStyle = {
    height: height || '100%',
    width: width || 'auto'
  };

  return (
    <div 
      className={`flex flex-col bg-gradient-card border border-border rounded-lg ${className}`}
      style={containerStyle}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">{title}</h3>
            {loading && <Badge variant="secondary" className="text-xs">Loading...</Badge>}
            {error && <Badge variant="destructive" className="text-xs">Error</Badge>}
          </div>
          <div className="flex gap-1">
            {showNewFile && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsCreating(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            {showSettings && (
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Search */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Create new item */}
        {isCreating && (
          <div className="mt-3 p-2 border border-border rounded bg-muted/20">
            <div className="flex gap-2 mb-2">
              <Button
                variant={newItemType === 'file' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNewItemType('file')}
              >
                File
              </Button>
              <Button
                variant={newItemType === 'folder' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNewItemType('folder')}
              >
                Folder
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={`New ${newItemType} name...`}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateItem();
                  } else if (e.key === 'Escape') {
                    setIsCreating(false);
                    setNewItemName('');
                  }
                }}
                className="flex-1"
                autoFocus
              />
              <Button size="sm" onClick={handleCreateItem}>
                Create
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsCreating(false);
                  setNewItemName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* File Tree */}
      <div className="flex-1 p-2">
        <ScrollArea className="h-full">
          {files.length > 0 ? (
            renderFileTree(files)
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No files found</p>
              {showNewFile && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setIsCreating(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create first file
                </Button>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Footer */}
      {(showUpload || showNewFile) && (
        <>
          <Separator />
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              {showUpload && (
                <>
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
                        <Download className="h-4 w-4" />
                      </span>
                    </Button>
                  </label>
                </>
              )}
              {showNewFile && !isCreating && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsCreating(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FileBrowser;