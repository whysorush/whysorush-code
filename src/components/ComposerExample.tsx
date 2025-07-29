import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Composer from './Composer/Composer';
import { sampleFileSystem } from '@/data/sampleFileSystem';
import { FileSystemItem } from '@/types/fileSystem';

const ComposerExample: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileSystemItem | null>(null);
  const [appliedChanges, setAppliedChanges] = useState<any[]>([]);

  const handleFileSelect = (file: FileSystemItem) => {
    setSelectedFile(file);
    console.log('Selected file:', file);
  };

  const handleApplyChanges = (changes: any[]) => {
    setAppliedChanges(prev => [...prev, ...changes]);
    console.log('Applied changes:', changes);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Composer Examples</h1>
        <p className="text-muted-foreground">
          AI-powered code assistant with context-aware chat and intelligent code generation
        </p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="integrated">Integrated</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Basic Composer</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Simple chat interface with AI code assistance
            </p>
            <div className="h-96">
              <Composer
                initialFiles={sampleFileSystem}
                width="100%"
                height="100%"
                onFileSelect={handleFileSelect}
                onApplyChanges={handleApplyChanges}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="integrated" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Integrated with File System</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Composer integrated with file browser and code editor
            </p>
            <div className="grid grid-cols-3 gap-4 h-96">
              {/* File Browser */}
              <div className="border border-border rounded-lg p-2">
                <h4 className="font-medium mb-2">File Browser</h4>
                <div className="text-sm text-muted-foreground">
                  {selectedFile ? (
                    <div>
                      <p>Selected: {selectedFile.name}</p>
                      <p>Type: {selectedFile.type}</p>
                      <p>Path: {selectedFile.path}</p>
                    </div>
                  ) : (
                    <p>No file selected</p>
                  )}
                </div>
              </div>

              {/* Code Editor */}
              <div className="border border-border rounded-lg p-2">
                <h4 className="font-medium mb-2">Code Editor</h4>
                <div className="text-sm text-muted-foreground">
                  {selectedFile ? (
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                      {selectedFile.content || 'No content available'}
                    </pre>
                  ) : (
                    <p>Select a file to edit</p>
                  )}
                </div>
              </div>

              {/* Composer */}
              <div className="border border-border rounded-lg">
                <Composer
                  initialFiles={sampleFileSystem}
                  width="100%"
                  height="100%"
                  onFileSelect={handleFileSelect}
                  onApplyChanges={handleApplyChanges}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Advanced Workflow</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete development workflow with AI assistance
            </p>
            
            <div className="grid grid-cols-4 gap-4 h-96">
              {/* Project Overview */}
              <div className="border border-border rounded-lg p-3">
                <h4 className="font-medium mb-2">Project Overview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Files:</span>
                    <Badge variant="secondary">{sampleFileSystem.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Changes:</span>
                    <Badge variant="secondary">{appliedChanges.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
              </div>

              {/* File Browser */}
              <div className="border border-border rounded-lg p-3">
                <h4 className="font-medium mb-2">File Browser</h4>
                <div className="text-xs space-y-1">
                  {sampleFileSystem.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className={`p-1 rounded cursor-pointer ${
                        selectedFile?.id === item.id ? 'bg-primary/10' : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedFile(item)}
                    >
                      {item.name}
                    </div>
                  ))}
                  {sampleFileSystem.length > 5 && (
                    <div className="text-muted-foreground">
                      +{sampleFileSystem.length - 5} more files
                    </div>
                  )}
                </div>
              </div>

              {/* Code Editor */}
              <div className="border border-border rounded-lg p-3">
                <h4 className="font-medium mb-2">Code Editor</h4>
                <div className="text-xs">
                  {selectedFile ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{selectedFile.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {selectedFile.type}
                        </Badge>
                      </div>
                      <pre className="bg-muted p-2 rounded overflow-auto max-h-24 text-xs">
                        {selectedFile.content?.slice(0, 200) || 'No content available'}
                        {selectedFile.content && selectedFile.content.length > 200 && '...'}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Select a file to edit</p>
                  )}
                </div>
              </div>

              {/* Composer */}
              <div className="border border-border rounded-lg">
                <Composer
                  initialFiles={sampleFileSystem}
                  width="100%"
                  height="100%"
                  onFileSelect={handleFileSelect}
                  onApplyChanges={handleApplyChanges}
                />
              </div>
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
{`import Composer from '@/components/Composer/Composer';
import { sampleFileSystem } from '@/data/sampleFileSystem';

<Composer
  initialFiles={sampleFileSystem}
  onFileSelect={(file) => console.log('Selected:', file)}
  onApplyChanges={(changes) => console.log('Applied:', changes)}
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">With Custom Configuration</h4>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<Composer
  initialFiles={sampleFileSystem}
  width="500px"
  height="600px"
  onFileSelect={handleFileSelect}
  onApplyChanges={handleApplyChanges}
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">Integration with Code Editor</h4>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`// In your main app component
const [selectedFile, setSelectedFile] = useState(null);
const [fileContent, setFileContent] = useState('');

const handleFileSelect = (file) => {
  setSelectedFile(file);
  setFileContent(file.content || '');
};

const handleApplyChanges = (changes) => {
  // Apply changes to your file system
  changes.forEach(change => {
    // Update file content
    setFileContent(change.newContent);
  });
};

<div className="grid grid-cols-2 gap-4">
  <CodeEditor
    file={selectedFile}
    content={fileContent}
    onChange={setFileContent}
  />
  <Composer
    initialFiles={sampleFileSystem}
    onFileSelect={handleFileSelect}
    onApplyChanges={handleApplyChanges}
  />
</div>`}
            </pre>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Key Features</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Chat Interface</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Natural language code requests</li>
              <li>• Context-aware responses</li>
              <li>• Conversation history</li>
              <li>• Real-time AI processing</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Code Intelligence</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• File context selection</li>
              <li>• Diff viewer with side-by-side comparison</li>
              <li>• Apply/reject changes per file</li>
              <li>• Code generation and refactoring</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">File Management</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• File browser integration</li>
              <li>• Multiple file selection</li>
              <li>• File content analysis</li>
              <li>• Project structure understanding</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Developer Experience</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Keyboard shortcuts</li>
              <li>• Search and filtering</li>
              <li>• Export/import conversations</li>
              <li>• Customizable interface</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ComposerExample; 