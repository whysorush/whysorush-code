import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileBrowser from './FileBrowser';
import { sampleFileSystem } from '@/data/sampleFileSystem';
import { FileSystemItem } from '@/types/fileSystem';

const FileBrowserExample: React.FC = () => {
  const handleFileSelect = (file: FileSystemItem) => {
    console.log('Selected file:', file);
  };

  const handleFileUpload = (file: File) => {
    console.log('Uploaded file:', file);
  };

  const handleFileCreate = (name: string, type: 'file' | 'folder') => {
    console.log(`Creating ${type}: ${name}`);
  };

  const handleFileDelete = (fileId: string) => {
    console.log(`Deleting file: ${fileId}`);
  };

  const handleFileRename = (fileId: string, newName: string) => {
    console.log(`Renaming file ${fileId} to ${newName}`);
  };

  const handleFolderToggle = (folderId: string, isExpanded: boolean) => {
    console.log(`Folder ${folderId} ${isExpanded ? 'expanded' : 'collapsed'}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">FileBrowser Examples</h1>
        <p className="text-muted-foreground">
          Different configurations of the dynamic FileBrowser component
        </p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="minimal">Minimal</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Basic FileBrowser</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Default configuration with all features enabled
            </p>
            <div className="h-96">
              <FileBrowser
                initialFiles={sampleFileSystem}
                title="Project Files"
                onFileSelect={handleFileSelect}
                onFileUpload={handleFileUpload}
                onFileCreate={handleFileCreate}
                onFileDelete={handleFileDelete}
                onFileRename={handleFileRename}
                onFolderToggle={handleFolderToggle}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="minimal" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Minimal FileBrowser</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Simplified version with only essential features
            </p>
            <div className="h-96">
              <FileBrowser
                initialFiles={sampleFileSystem}
                config={{
                  showSearch: false,
                  showUpload: false,
                  showNewFile: false,
                  showSettings: false,
                  showFileSize: false,
                  allowMultipleSelection: false
                }}
                title="Read-only Explorer"
                onFileSelect={handleFileSelect}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Advanced FileBrowser</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Full-featured with multiple selection and custom file types
            </p>
            <div className="h-96">
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
                    },
                    markdown: {
                      icon: 'FileText',
                      color: 'text-green-500',
                      extensions: ['md', 'txt']
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
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Custom FileBrowser</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Custom configuration for specific use cases
            </p>
            <div className="h-96">
              <FileBrowser
                initialFiles={sampleFileSystem}
                config={{
                  showSearch: true,
                  showUpload: false,
                  showNewFile: true,
                  showSettings: false,
                  showFileSize: true,
                  allowMultipleSelection: false,
                  defaultExpandedFolders: ['src/prompts']
                }}
                title="Prompt Manager"
                height="100%"
                width="100%"
                onFileSelect={handleFileSelect}
                onFileCreate={handleFileCreate}
                onFileRename={handleFileRename}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Usage Examples</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Basic Usage</h4>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`import FileBrowser from './FileBrowser';
import { sampleFileSystem } from '@/data/sampleFileSystem';

<FileBrowser
  initialFiles={sampleFileSystem}
  onFileSelect={(file) => console.log(file)}
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">With Custom Configuration</h4>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<FileBrowser
  initialFiles={sampleFileSystem}
  config={{
    showSearch: true,
    showUpload: false,
    showNewFile: true,
    allowMultipleSelection: true,
    defaultExpandedFolders: ['src']
  }}
  title="My File Explorer"
  onFileSelect={handleFileSelect}
  onFileCreate={handleFileCreate}
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">With All Event Handlers</h4>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<FileBrowser
  initialFiles={sampleFileSystem}
  onFileSelect={(file) => console.log('Selected:', file)}
  onFileUpload={(file) => console.log('Uploaded:', file)}
  onFileCreate={(name, type) => console.log('Created:', name, type)}
  onFileDelete={(fileId) => console.log('Deleted:', fileId)}
  onFileRename={(fileId, newName) => console.log('Renamed:', fileId, newName)}
  onFolderToggle={(folderId, isExpanded) => console.log('Folder:', folderId, isExpanded)}
/>`}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FileBrowserExample; 