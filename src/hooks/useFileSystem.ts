import { useState, useEffect, useCallback } from 'react';
import { FileSystemItem, FileSystemService } from '@/types/fileSystem';

export interface UseFileSystemOptions {
  initialFiles?: FileSystemItem[];
  service?: FileSystemService;
  autoLoad?: boolean;
}

export const useFileSystem = (options: UseFileSystemOptions = {}) => {
  const {
    initialFiles = [],
    service,
    autoLoad = true
  } = options;

  const [files, setFiles] = useState<FileSystemItem[]>(initialFiles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Load files from service or use initial files
  const loadFiles = useCallback(async () => {
    if (!service) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const loadedFiles = await service.loadFiles();
      setFiles(loadedFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Auto-load files on mount if service is provided
  useEffect(() => {
    if (autoLoad && service) {
      loadFiles();
    }
  }, [autoLoad, service, loadFiles]);

  // File operations
  const createFile = useCallback(async (name: string, path: string, content = '') => {
    if (!service) {
      // Create file locally
      const newFile: FileSystemItem = {
        id: `${path}/${name}`,
        name,
        type: 'file',
        path: `${path}/${name}`,
        content,
        lastModified: new Date(),
        size: content.length
      };
      
      setFiles(prev => {
        const newFiles = [...prev];
        const parentFolder = findFolderByPath(newFiles, path);
        if (parentFolder) {
          parentFolder.children = parentFolder.children || [];
          parentFolder.children.push(newFile);
        }
        return newFiles;
      });
      
      return newFile;
    }

    try {
      const newFile = await service.createFile(name, path, content);
      setFiles(prev => [...prev, newFile]);
      return newFile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create file');
      throw err;
    }
  }, [service]);

  const createFolder = useCallback(async (name: string, path: string) => {
    if (!service) {
      // Create folder locally
      const newFolder: FileSystemItem = {
        id: `${path}/${name}`,
        name,
        type: 'folder',
        path: `${path}/${name}`,
        lastModified: new Date(),
        children: []
      };
      
      setFiles(prev => {
        const newFiles = [...prev];
        const parentFolder = findFolderByPath(newFiles, path);
        if (parentFolder) {
          parentFolder.children = parentFolder.children || [];
          parentFolder.children.push(newFolder);
        }
        return newFiles;
      });
      
      return newFolder;
    }

    try {
      const newFolder = await service.createFolder(name, path);
      setFiles(prev => [...prev, newFolder]);
      return newFolder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder');
      throw err;
    }
  }, [service]);

  const deleteFile = useCallback(async (fileId: string) => {
    if (!service) {
      // Delete file locally
      setFiles(prev => removeFileById(prev, fileId));
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
      return;
    }

    try {
      await service.deleteFile(fileId);
      setFiles(prev => removeFileById(prev, fileId));
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
      throw err;
    }
  }, [service]);

  const renameFile = useCallback(async (fileId: string, newName: string) => {
    if (!service) {
      // Rename file locally
      setFiles(prev => renameFileById(prev, fileId, newName));
      return;
    }

    try {
      await service.renameFile(fileId, newName);
      setFiles(prev => renameFileById(prev, fileId, newName));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename file');
      throw err;
    }
  }, [service]);

  const saveFile = useCallback(async (file: FileSystemItem) => {
    if (!service) {
      // Save file locally
      setFiles(prev => updateFileById(prev, file));
      return;
    }

    try {
      await service.saveFile(file);
      setFiles(prev => updateFileById(prev, file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save file');
      throw err;
    }
  }, [service]);

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  const selectFile = useCallback((fileId: string, multiple = false) => {
    setSelectedFiles(prev => {
      const newSet = multiple ? new Set<string>(prev) : new Set<string>();
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  // Helper functions
  const findFileById = useCallback((fileId: string): FileSystemItem | null => {
    const findInTree = (items: FileSystemItem[]): FileSystemItem | null => {
      for (const item of items) {
        if (item.id === fileId) return item;
        if (item.children) {
          const found = findInTree(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findInTree(files);
  }, [files]);

  const findFolderByPath = useCallback((items: FileSystemItem[], path: string): FileSystemItem | null => {
    const findInTree = (items: FileSystemItem[]): FileSystemItem | null => {
      for (const item of items) {
        if (item.path === path && item.type === 'folder') return item;
        if (item.children) {
          const found = findInTree(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findInTree(items);
  }, []);

  return {
    // State
    files,
    loading,
    error,
    expandedFolders,
    selectedFiles,
    
    // Actions
    loadFiles,
    createFile,
    createFolder,
    deleteFile,
    renameFile,
    saveFile,
    toggleFolder,
    selectFile,
    clearSelection,
    findFileById,
    
    // Utilities
    setFiles,
    setExpandedFolders,
    setSelectedFiles
  };
};

// Helper functions for file tree manipulation
const removeFileById = (items: FileSystemItem[], fileId: string): FileSystemItem[] => {
  return items.filter(item => {
    if (item.id === fileId) return false;
    if (item.children) {
      item.children = removeFileById(item.children, fileId);
    }
    return true;
  });
};

const renameFileById = (items: FileSystemItem[], fileId: string, newName: string): FileSystemItem[] => {
  return items.map(item => {
    if (item.id === fileId) {
      return { ...item, name: newName };
    }
    if (item.children) {
      return { ...item, children: renameFileById(item.children, fileId, newName) };
    }
    return item;
  });
};

const updateFileById = (items: FileSystemItem[], updatedFile: FileSystemItem): FileSystemItem[] => {
  return items.map(item => {
    if (item.id === updatedFile.id) {
      return updatedFile;
    }
    if (item.children) {
      return { ...item, children: updateFileById(item.children, updatedFile) };
    }
    return item;
  });
}; 