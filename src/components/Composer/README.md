# Composer - AI Code Assistant

A powerful AI-powered code assistant that provides context-aware chat and intelligent code generation, similar to Cursor AI's Composer feature. This component enables developers to interact with their codebase using natural language and get intelligent suggestions for code improvements, refactoring, and new feature development.

## 🚀 Features

### **Chat Interface**
- **Natural Language Processing**: Ask questions and make requests in plain English
- **Context-Aware Responses**: AI understands your codebase structure and content
- **Conversation History**: Maintains chat history for iterative development
- **Real-time Processing**: Instant feedback and suggestions

### **Code Intelligence**
- **File Context Selection**: Choose specific files or folders for AI context
- **Diff Viewer**: Side-by-side comparison of original vs. modified code
- **Apply/Reject Changes**: Granular control over code modifications
- **Code Generation**: Generate new components, functions, and features
- **Refactoring Assistance**: Intelligent code restructuring suggestions

### **File Management**
- **File Browser Integration**: Seamless integration with project file structure
- **Multiple File Selection**: Include multiple files in AI context
- **File Content Analysis**: AI understands file relationships and dependencies
- **Project Structure Understanding**: Context-aware suggestions based on project architecture

### **Developer Experience**
- **Keyboard Shortcuts**: Efficient navigation and interaction
- **Search and Filtering**: Quick access to conversations and files
- **Export/Import**: Save and share conversations
- **Customizable Interface**: Adapt to your workflow preferences

## 📦 Installation

The Composer component is part of the intellicode-flow project. Ensure you have the required dependencies:

```bash
npm install lucide-react
```

## 🎯 Basic Usage

```tsx
import Composer from '@/components/Composer/Composer';
import { sampleFileSystem } from '@/data/sampleFileSystem';

function MyComponent() {
  const handleFileSelect = (file) => {
    console.log('Selected file:', file);
  };

  const handleApplyChanges = (changes) => {
    console.log('Applied changes:', changes);
  };

  return (
    <Composer
      initialFiles={sampleFileSystem}
      onFileSelect={handleFileSelect}
      onApplyChanges={handleApplyChanges}
    />
  );
}
```

## 🔧 Props

### ComposerProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `initialFiles` | `FileSystemItem[]` | `sampleFileSystem` | Initial file system structure |
| `onFileSelect` | `(file: FileSystemItem) => void` | - | Called when a file is selected |
| `onApplyChanges` | `(changes: CodeChange[]) => void` | - | Called when changes are applied |
| `width` | `string` | `"400px"` | Width of the component |
| `height` | `string` | `"100%"` | Height of the component |

## 🎨 Interface Overview

### **Main Chat Interface**
- **Input Area**: Natural language prompts and requests
- **Message History**: Conversation thread with user and AI messages
- **Context Badges**: Visual indicators of selected files/folders
- **Loading States**: Real-time feedback during AI processing

### **Context Builder**
- **File Tree**: Hierarchical view of project files
- **Search**: Quick file filtering and selection
- **Multi-selection**: Choose multiple files for context
- **Visual Indicators**: Clear selection state

### **Diff Viewer**
- **Side-by-side Comparison**: Original vs. modified code
- **Line-by-line Analysis**: Detailed change tracking
- **Apply/Reject Controls**: Granular change management
- **File Navigation**: Switch between multiple changes

### **Conversation History**
- **Saved Conversations**: Access previous chat sessions
- **Search**: Find specific conversations
- **Export/Import**: Share and backup conversations
- **Metadata**: Timestamps, file counts, and change summaries

## 💡 Usage Examples

### **Code Refactoring**
```
User: "Refactor the payment module to use Stripe v4 API"

AI Response: 
- Analyzes current payment implementation
- Suggests specific changes for Stripe v4 integration
- Provides diff view with before/after code
- Explains benefits and considerations
```

### **Feature Development**
```
User: "Create a new React component for data visualization"

AI Response:
- Generates complete component with TypeScript
- Includes proper error handling and accessibility
- Provides multiple chart type options
- Suggests integration points in existing codebase
```

### **Bug Fixes**
```
User: "Add error handling to the user authentication"

AI Response:
- Identifies potential failure points
- Implements comprehensive error handling
- Adds user-friendly error messages
- Includes logging and debugging features
```

### **Code Review**
```
User: "Review the authentication system for security issues"

AI Response:
- Analyzes code for security vulnerabilities
- Suggests improvements and best practices
- Provides specific code examples
- Explains security implications
```

## 🔄 Integration Patterns

### **With Code Editor**
```tsx
const [selectedFile, setSelectedFile] = useState(null);
const [fileContent, setFileContent] = useState('');

const handleFileSelect = (file) => {
  setSelectedFile(file);
  setFileContent(file.content || '');
};

const handleApplyChanges = (changes) => {
  changes.forEach(change => {
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
</div>
```

### **With File Browser**
```tsx
const [projectFiles, setProjectFiles] = useState(sampleFileSystem);

<Composer
  initialFiles={projectFiles}
  onFileSelect={(file) => {
    // Update file browser selection
    setSelectedFile(file);
  }}
  onApplyChanges={(changes) => {
    // Update file system with changes
    changes.forEach(change => {
      updateFileContent(change.filePath, change.newContent);
    });
  }}
/>
```

### **With Project Management**
```tsx
const [conversations, setConversations] = useState([]);
const [projectContext, setProjectContext] = useState({});

<Composer
  initialFiles={projectFiles}
  onApplyChanges={(changes) => {
    // Track changes in project management
    addToChangeLog(changes);
    updateProjectStatus('modified');
  }}
/>
```

## 🎛️ Advanced Configuration

### **Custom AI Responses**
The Composer uses a mock AI service that can be extended:

```tsx
// In useComposer.ts
const generateAIResponse = async (userMessage: string, context: FileSystemItem[]) => {
  // Integrate with your preferred AI service
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userMessage, context })
  });
  
  return response.json();
};
```

### **File System Integration**
Connect with your actual file system:

```tsx
const fileSystemService = {
  loadFiles: async () => {
    // Load from your file system
    return await getProjectFiles();
  },
  saveFile: async (file) => {
    // Save to your file system
    return await writeFile(file.path, file.content);
  }
};
```

### **Custom Styling**
```tsx
<Composer
  className="custom-composer"
  style={{
    '--composer-primary': '#3B82F6',
    '--composer-secondary': '#64748B'
  }}
/>
```

## 🔧 Customization

### **Theming**
The Composer uses CSS custom properties for theming:

```css
.composer {
  --composer-primary: #3B82F6;
  --composer-secondary: #64748B;
  --composer-background: #FFFFFF;
  --composer-border: #E5E7EB;
  --composer-text: #374151;
  --composer-muted: #6B7280;
}
```

### **Keyboard Shortcuts**
```tsx
// Add custom keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'k') {
      // Open context builder
      setShowContextBuilder(true);
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

## 🚀 Best Practices

### **Effective Prompts**
- **Be Specific**: "Add error handling to the login function" vs "Fix bugs"
- **Include Context**: Mention specific files or features
- **Iterative Refinement**: Build on previous responses
- **Clear Objectives**: State what you want to achieve

### **File Context Selection**
- **Relevant Files**: Include only files related to your request
- **Dependencies**: Include imported files and related components
- **Configuration**: Include config files for project-specific context
- **Documentation**: Include README and docs for project understanding

### **Change Management**
- **Review Changes**: Always review diffs before applying
- **Test Incrementally**: Apply changes in small batches
- **Backup First**: Ensure you have version control or backups
- **Understand Impact**: Consider how changes affect other parts of the codebase

## 🔍 Troubleshooting

### **Common Issues**

**AI Not Responding**
- Check network connectivity
- Verify AI service configuration
- Ensure proper file context is selected

**Changes Not Applying**
- Verify file permissions
- Check file system integration
- Ensure proper error handling

**Performance Issues**
- Limit file context selection
- Use file filtering for large projects
- Implement proper caching

### **Debug Mode**
```tsx
<Composer
  debug={true}
  onError={(error) => console.error('Composer error:', error)}
/>
```

## 📚 API Reference

### **Hooks**

#### `useComposer()`
Returns the Composer state and actions:

```tsx
const {
  messages,
  selectedContext,
  pendingChanges,
  isLoading,
  error,
  sendMessage,
  addContext,
  removeContext,
  applyChanges,
  rejectChanges,
  clearConversation,
  loadConversation
} = useComposer();
```

### **Types**

#### `Message`
```tsx
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: FileSystemItem[];
}
```

#### `CodeChange`
```tsx
interface CodeChange {
  id: string;
  filePath: string;
  fileName: string;
  originalContent: string;
  newContent: string;
  description: string;
  status: 'pending' | 'applied' | 'rejected';
  timestamp: Date;
}
```

#### `Conversation`
```tsx
interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  changes: CodeChange[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by Cursor AI's Composer feature
- Built with React and TypeScript
- Uses Lucide React for icons
- Styled with Tailwind CSS 