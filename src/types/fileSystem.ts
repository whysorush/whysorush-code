export interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  lastModified: Date;
  children?: FileSystemItem[];
  content?: string;
  metadata?: Record<string, any>;
}

export interface FileBrowserConfig {
  showSearch?: boolean;
  showUpload?: boolean;
  showNewFile?: boolean;
  showSettings?: boolean;
  showFileSize?: boolean;
  allowMultipleSelection?: boolean;
  defaultExpandedFolders?: string[];
  fileTypes?: {
    [key: string]: {
      icon: string;
      color?: string;
      extensions: string[];
    };
  };
}

export interface FileBrowserProps {
  className?: string;
  config?: FileBrowserConfig;
  initialFiles?: FileSystemItem[];
  onFileSelect?: (file: FileSystemItem) => void;
  onFileUpload?: (file: File) => void;
  onFileCreate?: (name: string, type: 'file' | 'folder') => void;
  onFileDelete?: (fileId: string) => void;
  onFileRename?: (fileId: string, newName: string) => void;
  onFolderToggle?: (folderId: string, isExpanded: boolean) => void;
  title?: string;
  height?: string;
  width?: string;
}

export interface FileSystemService {
  loadFiles: () => Promise<FileSystemItem[]>;
  saveFile: (file: FileSystemItem) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  createFile: (name: string, path: string, content?: string) => Promise<FileSystemItem>;
  createFolder: (name: string, path: string) => Promise<FileSystemItem>;
  renameFile: (fileId: string, newName: string) => Promise<void>;
  getFileContent: (fileId: string) => Promise<string>;
} 