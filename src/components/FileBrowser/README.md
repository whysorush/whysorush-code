# Dynamic FileBrowser Component

A highly configurable and reusable file browser component for React applications. This component provides a complete file system interface with search, file operations, and customizable features.

## Features

- 📁 **Tree View**: Hierarchical file and folder display
- 🔍 **Search**: Real-time file search functionality
- 📤 **File Upload**: Drag and drop or click to upload files
- ➕ **Create Files/Folders**: Create new files and folders inline
- ✏️ **Inline Editing**: Rename files and folders directly
- 🗑️ **Delete Files**: Remove files with confirmation
- ⚙️ **Configurable**: Customize which features to show/hide
- 🎨 **Customizable**: Support for custom file types and icons
- 📱 **Responsive**: Works on different screen sizes
- ♿ **Accessible**: Keyboard navigation and screen reader support

## Installation

The FileBrowser component is part of the intellicode-flow project. Make sure you have the required dependencies:

```bash
npm install lucide-react
```

## Basic Usage

```tsx
import FileBrowser from '@/components/FileBrowser';
import { sampleFileSystem } from '@/data/sampleFileSystem';

function MyComponent() {
  const handleFileSelect = (file) => {
    console.log('Selected file:', file);
  };

  return (
    <FileBrowser
      initialFiles={sampleFileSystem}
      onFileSelect={handleFileSelect}
    />
  );
}
```

## Props

### FileBrowserProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `config` | `FileBrowserConfig` | `{}` | Configuration object |
| `initialFiles` | `FileSystemItem[]` | `[]` | Initial file system structure |
| `onFileSelect` | `(file: FileSystemItem) => void` | - | Called when a file is selected |
| `onFileUpload` | `(file: File) => void` | - | Called when a file is uploaded |
| `onFileCreate` | `(name: string, type: 'file' \| 'folder') => void` | - | Called when a file/folder is created |
| `onFileDelete` | `(fileId: string) => void` | - | Called when a file is deleted |
| `onFileRename` | `(fileId: string, newName: string) => void` | - | Called when a file is renamed |
| `onFolderToggle` | `(folderId: string, isExpanded: boolean) => void` | - | Called when a folder is expanded/collapsed |
| `title` | `string` | `"File Explorer"` | Title displayed in the header |
| `height` | `string` | `"100%"` | Height of the component |
| `width` | `string` | `"auto"` | Width of the component |

### FileBrowserConfig

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showSearch` | `boolean` | `true` | Show search input |
| `showUpload` | `boolean` | `true` | Show upload button |
| `showNewFile` | `boolean` | `true` | Show create new file/folder button |
| `showSettings` | `boolean` | `true` | Show settings button |
| `showFileSize` | `boolean` | `true` | Show file sizes |
| `allowMultipleSelection` | `boolean` | `false` | Allow selecting multiple files |
| `defaultExpandedFolders` | `string[]` | `[]` | IDs of folders to expand by default |
| `fileTypes` | `object` | `{}` | Custom file type configurations |

## File System Structure

The component expects a tree structure of `FileSystemItem` objects:

```tsx
interface FileSystemItem {
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
```

## Examples

### Basic FileBrowser

```tsx
<FileBrowser
  initialFiles={sampleFileSystem}
  onFileSelect={(file) => console.log('Selected:', file)}
/>
```

### Minimal Configuration

```tsx
<FileBrowser
  initialFiles={sampleFileSystem}
  config={{
    showSearch: false,
    showUpload: false,
    showNewFile: false,
    showSettings: false,
    showFileSize: false
  }}
  title="Read-only Explorer"
  onFileSelect={handleFileSelect}
/>
```

### Advanced Configuration

```tsx
<FileBrowser
  initialFiles={sampleFileSystem}
  config={{
    showSearch: true,
    showUpload: true,
    showNewFile: true,
    showSettings: true,
    showFileSize: true,
    allowMultipleSelection: true,
    defaultExpandedFolders: ['src', 'src/components'],
    fileTypes: {
      typescript: {
        icon: 'FileCode',
        color: 'text-blue-500',
        extensions: ['ts', 'tsx']
      },
      javascript: {
        icon: 'FileCode',
        color: 'text-yellow-500',
        extensions: ['js', 'jsx']
      }
    }
  }}
  title="Advanced Explorer"
  onFileSelect={handleFileSelect}
  onFileUpload={handleFileUpload}
  onFileCreate={handleFileCreate}
  onFileDelete={handleFileDelete}
  onFileRename={handleFileRename}
  onFolderToggle={handleFolderToggle}
/>
```

### Custom File Types

```tsx
const customFileTypes = {
  typescript: {
    icon: 'FileCode',
    color: 'text-blue-500',
    extensions: ['ts', 'tsx']
  },
  python: {
    icon: 'FileCode',
    color: 'text-green-500',
    extensions: ['py', 'pyc']
  },
  markdown: {
    icon: 'FileText',
    color: 'text-purple-500',
    extensions: ['md', 'markdown']
  }
};

<FileBrowser
  initialFiles={sampleFileSystem}
  config={{ fileTypes: customFileTypes }}
/>
```

## Integration with CodeEditor

The FileBrowser is designed to work seamlessly with the CodeEditor component:

```tsx
import CodeEditor from '@/components/CodeEditor';
import { sampleFileSystem } from '@/data/sampleFileSystem';

<CodeEditor
  initialFiles={sampleFileSystem}
  showFileBrowser={true}
  fileBrowserConfig={{
    showSearch: true,
    showUpload: true,
    showNewFile: true,
    allowMultipleSelection: false,
    defaultExpandedFolders: ['src']
  }}
/>
```

## Custom File System Service

You can integrate with a custom file system service by implementing the `FileSystemService` interface:

```tsx
interface FileSystemService {
  loadFiles: () => Promise<FileSystemItem[]>;
  saveFile: (file: FileSystemItem) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  createFile: (name: string, path: string, content?: string) => Promise<FileSystemItem>;
  createFolder: (name: string, path: string) => Promise<FileSystemItem>;
  renameFile: (fileId: string, newName: string) => Promise<void>;
  getFileContent: (fileId: string) => Promise<string>;
}
```

## Styling

The component uses Tailwind CSS classes and can be customized with:

- Custom CSS classes via the `className` prop
- Tailwind CSS utility classes
- CSS custom properties for theming

## Accessibility

The component includes:

- Keyboard navigation (Arrow keys, Enter, Escape)
- Screen reader support
- Focus management
- ARIA labels and roles
- High contrast support

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## License

MIT License - see LICENSE file for details. 