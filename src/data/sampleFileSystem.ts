import { FileSystemItem } from '@/types/fileSystem';

export const sampleFileSystem: FileSystemItem[] = [
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
            content: `import React from "react";
import { CodeEditor } from "./CodeEditor";
import { ChatInterface } from "./ChatInterface";

const App = () => {
  return (
    <div className="app">
      <CodeEditor />
      <ChatInterface />
    </div>
  );
};

export default App;`
          },
          {
            id: 'src/components/ChatInterface.tsx',
            name: 'ChatInterface.tsx',
            type: 'file',
            path: 'src/components/ChatInterface.tsx',
            size: 2048,
            lastModified: new Date(),
            content: `import React, { useState } from "react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
  };

  return (
    <div className="chat-interface">
      <div className="messages">
        {messages.map(message => (
          <div key={message.id} className={\`message \${message.sender}\`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};`
          },
          {
            id: 'src/components/CodeEditor.tsx',
            name: 'CodeEditor.tsx',
            type: 'file',
            path: 'src/components/CodeEditor.tsx',
            size: 3072,
            lastModified: new Date(),
            content: `import React, { useState } from "react";
import { FileBrowser } from "./FileBrowser";

export const CodeEditor: React.FC = () => {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');

  const handleFileSelect = (file: any) => {
    setActiveFile(file.path);
    setFileContent(file.content || '');
  };

  return (
    <div className="code-editor">
      <FileBrowser onFileSelect={handleFileSelect} />
      <div className="editor-panel">
        <textarea
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          placeholder="Select a file to edit..."
        />
      </div>
    </div>
  );
};`
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
            lastModified: new Date(),
            content: `You are an intelligent coding assistant designed to help developers write, debug, and optimize code.

Your capabilities include:
- Code generation and completion
- Bug detection and fixing
- Code optimization and refactoring
- Documentation generation
- Testing strategy and implementation

Please provide clear, well-documented code with explanations when appropriate.`
          },
          {
            id: 'src/prompts/agent-v1.2.txt',
            name: 'Agent Prompt v1.2.txt',
            type: 'file',
            path: 'src/prompts/Agent Prompt v1.2.txt',
            size: 5120,
            lastModified: new Date(),
            content: `You are an advanced AI coding assistant with enhanced capabilities for modern development workflows.

Enhanced Features:
- Multi-language support (TypeScript, Python, Rust, Go, etc.)
- Framework-specific guidance (React, Vue, Angular, Django, FastAPI, etc.)
- Code review and best practices enforcement
- Performance optimization recommendations
- Security best practices implementation
- Testing strategy (unit, integration, e2e)

Always consider:
- Code maintainability and readability
- Performance implications
- Security considerations
- Testing coverage
- Documentation quality`
          },
          {
            id: 'src/prompts/tools.json',
            name: 'Agent Tools v1.0.json',
            type: 'file',
            path: 'src/prompts/Agent Tools v1.0.json',
            size: 3072,
            lastModified: new Date(),
            content: `{
  "tools": [
    {
      "name": "code_analyzer",
      "description": "Analyzes code for potential issues and improvements",
      "parameters": {
        "language": "string",
        "code": "string"
      }
    },
    {
      "name": "test_generator",
      "description": "Generates unit tests for given code",
      "parameters": {
        "language": "string",
        "framework": "string",
        "code": "string"
      }
    },
    {
      "name": "documentation_generator",
      "description": "Generates documentation for code",
      "parameters": {
        "format": "string",
        "code": "string"
      }
    }
  ],
  "version": "1.0.0",
  "lastUpdated": "2024-01-15"
}`
          }
        ]
      },
      {
        id: 'src/hooks',
        name: 'hooks',
        type: 'folder',
        path: 'src/hooks',
        lastModified: new Date(),
        children: [
          {
            id: 'src/hooks/useFileSystem.ts',
            name: 'useFileSystem.ts',
            type: 'file',
            path: 'src/hooks/useFileSystem.ts',
            size: 2048,
            lastModified: new Date(),
            content: `import { useState, useEffect, useCallback } from 'react';
import { FileSystemItem } from '@/types/fileSystem';

export const useFileSystem = (initialFiles: FileSystemItem[] = []) => {
  const [files, setFiles] = useState<FileSystemItem[]>(initialFiles);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const selectFile = useCallback((fileId: string) => {
    setSelectedFile(fileId);
  }, []);

  return {
    files,
    selectedFile,
    selectFile,
    setFiles
  };
};`
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
        lastModified: new Date(),
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Whysorush Flow</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`
      },
      {
        id: 'public/favicon.ico',
        name: 'favicon.ico',
        type: 'file',
        path: 'public/favicon.ico',
        size: 1024,
        lastModified: new Date()
      }
    ]
  },
  {
    id: 'package.json',
    name: 'package.json',
    type: 'file',
    path: 'package.json',
    size: 2048,
    lastModified: new Date(),
    content: `{
  "name": "intellicode-flow",
  "version": "1.0.0",
  "description": "AI-powered code editor and assistant",
  "main": "index.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}`
  },
  {
    id: 'README.md',
    name: 'README.md',
    type: 'file',
    path: 'README.md',
    size: 1024,
    lastModified: new Date(),
    content: `# Whysorush Flow

An AI-powered code editor and assistant built with React and TypeScript.

## Features

- **Smart Code Editor**: Syntax highlighting and intelligent code completion
- **File Browser**: Easy navigation and management of project files
- **AI Assistant**: Integrated chat interface for coding help
- **Real-time Collaboration**: Work together with team members
- **Multiple Language Support**: TypeScript, JavaScript, Python, and more

## Getting Started

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Start development server: \`npm run dev\`
4. Open http://localhost:5173

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

MIT License - see LICENSE file for details.`
  }
];

// Helper function to get file by path
export const getFileByPath = (path: string): FileSystemItem | null => {
  const findInTree = (items: FileSystemItem[]): FileSystemItem | null => {
    for (const item of items) {
      if (item.path === path) return item;
      if (item.children) {
        const found = findInTree(item.children);
        if (found) return found;
      }
    }
    return null;
  };
  return findInTree(sampleFileSystem);
};

// Helper function to get all files recursively
export const getAllFiles = (): FileSystemItem[] => {
  const files: FileSystemItem[] = [];
  
  const traverse = (items: FileSystemItem[]) => {
    for (const item of items) {
      if (item.type === 'file') {
        files.push(item);
      }
      if (item.children) {
        traverse(item.children);
      }
    }
  };
  
  traverse(sampleFileSystem);
  return files;
};

// Helper function to get all folders recursively
export const getAllFolders = (): FileSystemItem[] => {
  const folders: FileSystemItem[] = [];
  
  const traverse = (items: FileSystemItem[]) => {
    for (const item of items) {
      if (item.type === 'folder') {
        folders.push(item);
      }
      if (item.children) {
        traverse(item.children);
      }
    }
  };
  
  traverse(sampleFileSystem);
  return folders;
}; 