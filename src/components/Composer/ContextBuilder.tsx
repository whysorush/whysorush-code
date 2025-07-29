import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Folder, 
  FileText, 
  FileCode, 
  Image, 
  Search,
  X,
  Check,
  Plus,
  File
} from 'lucide-react';
import { FileSystemItem } from '@/types/fileSystem';

interface ContextBuilderProps {
  files: FileSystemItem[];
  selectedContext: FileSystemItem[];
  onAddContext: (item: FileSystemItem) => void;
  onRemoveContext: (itemId: string) => void;
  onClose: () => void;
}

const ContextBuilder: React.FC<ContextBuilderProps> = ({
  files,
  selectedContext,
  onAddContext,
  onRemoveContext,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

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

  const getFileIcon = (file: FileSystemItem) => {
    if (file.type === 'folder') {
      return expandedFolders.has(file.id) ? Folder : Folder;
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
      case 'svg':
        return Image;
      default:
        return File;
    }
  };

  const isSelected = (item: FileSystemItem) => {
    return selectedContext.some(selected => selected.id === item.id);
  };

  const handleItemClick = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      toggleFolder(item.id);
    } else {
      if (isSelected(item)) {
        onRemoveContext(item.id);
      } else {
        onAddContext(item);
      }
    }
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
            onClick={() => handleItemClick(item)}
            className={`w-full flex items-center gap-2 px-2 py-1 text-sm hover:bg-muted/50 rounded transition-colors ${
              isSelected(item) ? 'bg-primary/10 text-primary' : 'text-foreground'
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
          >
            {React.createElement(getFileIcon(item), { 
              className: "h-4 w-4 flex-shrink-0" 
            })}
            <span className="flex-1 text-left truncate">{item.name}</span>
            {isSelected(item) && (
              <Check className="h-4 w-4 text-primary" />
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

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 overflow-auto">
      <Card className="w-96 max-h-screen flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Add Context</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
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

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedContext.length} item{selectedContext.length !== 1 ? 's' : ''} selected
            </div>
            <Button onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContextBuilder; 