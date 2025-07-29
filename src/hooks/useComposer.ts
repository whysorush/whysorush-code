import { useState, useCallback } from 'react';
import { FileSystemItem } from '@/types/fileSystem';
import { usePromptIntegration } from './usePromptIntegration';
import { useDeepSeek } from '@/components/DeepSeekProvider';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: FileSystemItem[];
  promptUsed?: string;
}

export interface CodeChange {
  id: string;
  filePath: string;
  fileName: string;
  originalContent: string;
  newContent: string;
  description: string;
  status: 'pending' | 'applied' | 'rejected';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  changes: CodeChange[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to estimate token count (rough approximation)
const estimateTokenCount = (text: string): number => {
  // Rough approximation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
};

// Helper function to truncate context to stay within token limits
const optimizeContextForAPI = (
  context: FileSystemItem[], 
  messages: Message[], 
  userMessage: string,
  maxTokens: number = 50000 // Leave buffer for response
): any => {
  let currentTokens = estimateTokenCount(userMessage);
  
  // Truncate file contents to essential parts
  const optimizedFiles = context.map(file => {
    let content = file.content || '';
    
    // If content is too large, keep only the most relevant parts
    if (content.length > 2000) {
      // Keep first 1000 chars and last 1000 chars
      const firstPart = content.substring(0, 1000);
      const lastPart = content.substring(content.length - 1000);
      content = `${firstPart}\n\n... [content truncated for token limit] ...\n\n${lastPart}`;
    }
    
    return {
      id: file.id,
      name: file.name,
      path: file.path,
      type: file.type,
      content: content.substring(0, 1500) // Limit each file to 1500 chars
    };
  });

  // Limit conversation history to last 5 messages
  const recentMessages = messages.slice(-5).map(msg => ({
    role: msg.role,
    content: msg.content.substring(0, 500) // Limit each message to 500 chars
  }));

  // Create optimized context
  const optimizedContext = {
    userMessage: userMessage.substring(0, 1000), // Limit user message
    selectedFiles: optimizedFiles.slice(0, 10), // Limit to 10 files max
    conversationHistory: recentMessages,
    currentTask: userMessage.substring(0, 200)
  };

  return optimizedContext;
};

export const useComposer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedContext, setSelectedContext] = useState<FileSystemItem[]>([]);
  const [pendingChanges, setPendingChanges] = useState<CodeChange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPromptType, setSelectedPromptType] = useState<'agent' | 'chat' | 'memory'>('chat');

  // Integrate with prompt system
  const {
    prompts,
    selectedPrompt,
    selectPrompt,
    generateResponse,
    getPromptsByType
  } = usePromptIntegration();

  // Integrate with DeepSeek API
  const { makeRequest: deepSeekRequest, isConfigured: deepSeekConfigured } = useDeepSeek();

  const sendMessage = useCallback(async (content: string, context: FileSystemItem[] = []) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      context
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Auto-select appropriate prompt based on message content
      const lowerContent = content.toLowerCase();
      let promptType: 'agent' | 'chat' | 'memory' = 'chat';
      
      if (lowerContent.includes('refactor') || lowerContent.includes('implement') || 
          lowerContent.includes('create') || lowerContent.includes('fix') ||
          lowerContent.includes('optimize') || lowerContent.includes('analyze')) {
        promptType = 'agent';
      } else if (lowerContent.includes('memory') || lowerContent.includes('remember') ||
                 lowerContent.includes('forget') || lowerContent.includes('recall')) {
        promptType = 'memory';
      }

      setSelectedPromptType(promptType);

      // Get the best prompt for this type
      const availablePrompts = getPromptsByType(promptType);
      const bestPrompt = availablePrompts.find(p => p.version === '1.2') || 
                        availablePrompts.find(p => p.version === '1.0') || 
                        availablePrompts[0];

      if (bestPrompt) {
        selectPrompt(bestPrompt.id);
      }

      // Optimize context to stay within token limits
      const optimizedContext = optimizeContextForAPI(context, messages, content);

      let aiResponseContent: string;
      
      // Try to use DeepSeek API if configured
      if (deepSeekConfigured && bestPrompt) {
        try {
          const fullPrompt = `${bestPrompt.content}\n\nContext: ${JSON.stringify(optimizedContext)}\n\nUser Message: ${content}`;
          aiResponseContent = await deepSeekRequest(fullPrompt, optimizedContext);
        } catch (error) {
          console.warn('DeepSeek API failed, falling back to prompt system:', error);
          // Show user-friendly error message
          if (error instanceof Error && error.message.includes('CORS')) {
            aiResponseContent = `⚠️ **API Connection Issue**: ${error.message}\n\nI'll continue with a simulated response for now:\n\n${await generateResponse(content, optimizedContext)}`;
          } else if (error instanceof Error && error.message.includes('maximum context length')) {
            aiResponseContent = `⚠️ **Token Limit Exceeded**: The context is too large for the AI model. I'll continue with a simplified response:\n\n${await generateResponse(content, { 
              userMessage: content, 
              selectedFiles: context.slice(0, 3),
              projectStructure: context.slice(0, 3),
              conversationHistory: messages.slice(-2),
              currentTask: content
            })}`;
          } else {
            aiResponseContent = await generateResponse(content, optimizedContext);
          }
        }
      } else if (bestPrompt) {
        // Use prompt-based response
        aiResponseContent = await generateResponse(content, optimizedContext);
      } else {
        // Fallback to original logic
        aiResponseContent = await generateAIResponse(content, context);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponseContent,
        timestamp: new Date(),
        context,
        promptUsed: bestPrompt?.name
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If the AI response includes code changes, add them to pending changes
      if (aiResponseContent.includes('changes') || aiResponseContent.includes('refactor')) {
        const newChanges: CodeChange[] = generateCodeChangesFromResponse(aiResponseContent, context);
        if (newChanges.length > 0) {
          setPendingChanges(prev => [...prev, ...newChanges]);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [messages, getPromptsByType, selectPrompt, generateResponse]);

  const addContext = useCallback((item: FileSystemItem) => {
    setSelectedContext(prev => {
      if (prev.find(existing => existing.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const removeContext = useCallback((itemId: string) => {
    setSelectedContext(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const applyChanges = useCallback(async () => {
    // Apply pending changes
    setPendingChanges([]);
  }, []);

  const rejectChanges = useCallback(() => {
    setPendingChanges([]);
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setSelectedContext([]);
    setPendingChanges([]);
    setError(null);
  }, []);

  const loadConversation = useCallback((conversation: Conversation) => {
    setMessages(conversation.messages);
    setPendingChanges(conversation.changes);
  }, []);

  // Original AI response generation (fallback)
  const generateAIResponse = async (userMessage: string, context: FileSystemItem[]) => {
    // This is a mock implementation - in a real app, this would call an AI service
    const lowerMessage = userMessage.toLowerCase();
    
    // Analyze the context to understand the project structure
    const hasReactFiles = context.some(file => 
      file.name.endsWith('.tsx') || file.name.endsWith('.jsx')
    );
    const hasTypeScriptFiles = context.some(file => 
      file.name.endsWith('.ts') || file.name.endsWith('.tsx')
    );
    const hasJavaScriptFiles = context.some(file => 
      file.name.endsWith('.js') || file.name.endsWith('.jsx')
    );
    const hasCSSFiles = context.some(file => 
      file.name.endsWith('.css') || file.name.endsWith('.scss') || file.name.endsWith('.sass')
    );
    const hasConfigFiles = context.some(file => 
      file.name.includes('package.json') || file.name.includes('tsconfig') || file.name.includes('vite.config')
    );

    // Check for specific file types in context
    const reactComponents = context.filter(file => 
      file.name.endsWith('.tsx') || file.name.endsWith('.jsx')
    );
    const configFiles = context.filter(file => 
      file.name.includes('package.json') || file.name.includes('tsconfig') || file.name.includes('vite.config')
    );

    // Generate contextual response based on user message and project structure
    if (lowerMessage.includes('refactor') || lowerMessage.includes('improve')) {
      if (hasReactFiles) {
        return `I'll help you refactor your React components. Based on the context, I can see you have ${reactComponents.length} React component(s). Here are some improvements I can suggest:

1. **Component Optimization**: Extract reusable components and improve prop interfaces
2. **Performance Improvements**: Implement React.memo, useMemo, and useCallback where appropriate
3. **Type Safety**: Enhance TypeScript interfaces and type definitions
4. **Code Organization**: Improve file structure and component hierarchy
5. **Best Practices**: Apply React best practices and modern patterns

Would you like me to analyze specific components or apply these improvements across your codebase?`;
      } else if (hasJavaScriptFiles) {
        return `I'll help you refactor your JavaScript code. Here are some improvements I can suggest:

1. **Code Organization**: Improve function structure and module organization
2. **Error Handling**: Add comprehensive error handling and validation
3. **Performance**: Optimize loops, reduce complexity, and improve efficiency
4. **Modern JavaScript**: Use ES6+ features and modern patterns
5. **Code Quality**: Improve readability and maintainability

Would you like me to analyze specific files or apply these improvements?`;
      }
    }

    if (lowerMessage.includes('bug') || lowerMessage.includes('fix') || lowerMessage.includes('error')) {
      return `I'll help you identify and fix bugs in your code. Based on the context, I can analyze your code for:

1. **Common Issues**: Type errors, undefined variables, and runtime errors
2. **Logic Errors**: Incorrect conditional statements and data flow issues
3. **Performance Issues**: Memory leaks, inefficient algorithms, and rendering problems
4. **Security Issues**: Potential vulnerabilities and unsafe practices
5. **Compatibility Issues**: Browser compatibility and dependency conflicts

Let me analyze your code and suggest specific fixes.`;
    }

    if (lowerMessage.includes('feature') || lowerMessage.includes('add') || lowerMessage.includes('create')) {
      if (hasReactFiles) {
        return `I'll help you add new features to your React application. Based on your project structure, I can help with:

1. **New Components**: Create reusable React components with TypeScript
2. **State Management**: Implement proper state management patterns
3. **API Integration**: Add API calls and data fetching logic
4. **UI/UX Improvements**: Enhance user interface and user experience
5. **Form Handling**: Create forms with validation and error handling

What specific feature would you like to add? I can create the necessary components and logic.`;
      } else {
        return `I'll help you add new features to your application. I can help with:

1. **New Functions**: Create utility functions and business logic
2. **API Integration**: Add API calls and data processing
3. **File Operations**: Implement file handling and data management
4. **Configuration**: Add new configuration options and settings
5. **Documentation**: Create documentation and comments

What specific feature would you like to add?`;
      }
    }

    if (lowerMessage.includes('test') || lowerMessage.includes('testing')) {
      return `I'll help you add testing to your project. Based on your setup, I can help with:

1. **Unit Tests**: Create comprehensive unit tests for your functions and components
2. **Integration Tests**: Test component interactions and API integrations
3. **Test Setup**: Configure testing frameworks and utilities
4. **Test Coverage**: Ensure good test coverage across your codebase
5. **Mocking**: Set up proper mocking for external dependencies

Would you like me to create test files for your existing code?`;
    }

    if (lowerMessage.includes('documentation') || lowerMessage.includes('comment') || lowerMessage.includes('readme')) {
      return `I'll help you improve documentation for your project. I can help with:

1. **Code Comments**: Add comprehensive JSDoc comments and inline documentation
2. **README Files**: Create or update README files with setup instructions
3. **API Documentation**: Document function signatures and parameters
4. **Component Documentation**: Create component documentation with examples
5. **Architecture Documentation**: Document project structure and design decisions

Let me analyze your code and add appropriate documentation.`;
    }

    if (lowerMessage.includes('optimize') || lowerMessage.includes('performance')) {
      return `I'll help you optimize your code for better performance. Based on your project, I can suggest:

1. **React Optimization**: Implement React.memo, useMemo, and useCallback
2. **Bundle Optimization**: Reduce bundle size and improve loading times
3. **Algorithm Optimization**: Improve time and space complexity
4. **Memory Management**: Fix memory leaks and optimize resource usage
5. **Rendering Optimization**: Reduce unnecessary re-renders and improve UI responsiveness

Let me analyze your code and suggest specific optimizations.`;
    }

    if (lowerMessage.includes('security') || lowerMessage.includes('vulnerability')) {
      return `I'll help you improve security in your application. I can help with:

1. **Input Validation**: Add comprehensive input validation and sanitization
2. **Authentication**: Implement secure authentication and authorization
3. **Data Protection**: Secure sensitive data and implement encryption
4. **Dependency Security**: Update dependencies and fix security vulnerabilities
5. **Best Practices**: Apply security best practices and patterns

Let me analyze your code and suggest security improvements.`;
    }

    // Default response for general questions or unclear instructions
    return `I understand you want to work on your code. Based on your project structure, I can help you with:

**Project Analysis:**
- You have ${context.length} files in context
- ${hasReactFiles ? 'React/TypeScript project detected' : hasJavaScriptFiles ? 'JavaScript project detected' : 'General project'}
- ${hasConfigFiles ? 'Configuration files detected' : 'No configuration files in context'}

**Available Services:**
• **Code Refactoring**: Improve existing code structure and performance
• **Feature Development**: Create new components and functionality  
• **Bug Fixes**: Identify and resolve issues in your codebase
• **Code Review**: Analyze code quality and suggest improvements
• **Documentation**: Generate documentation and comments
• **Testing**: Add unit tests and integration tests
• **Performance Optimization**: Optimize code for better performance
• **Security Improvements**: Enhance security and fix vulnerabilities

**To get the best results, try to:**
1. Be specific about what you want to achieve
2. Include relevant files in the context
3. Mention any specific requirements or constraints

**Examples:**
- "Refactor the PaymentModule component to improve error handling"
- "Add unit tests for the UserService functions"
- "Create a new Dashboard component with charts"
- "Fix the authentication bug in the login form"
- "Optimize the data fetching logic for better performance"

What would you like to work on?`;
  };

  // Helper function to generate code changes from AI response
  const generateCodeChangesFromResponse = (response: string, context: FileSystemItem[]): CodeChange[] => {
    const changes: CodeChange[] = [];
    
    // This is a simplified implementation - in a real app, you'd parse the response more intelligently
    if (response.includes('refactor') || response.includes('improve')) {
      context.forEach(file => {
        if (file.content && (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js'))) {
          changes.push({
            id: `${Date.now()}-${file.id}`,
            filePath: file.path,
            fileName: file.name,
            originalContent: file.content,
            newContent: `// Enhanced ${file.name} with improvements
${file.content}
// TODO: Apply suggested improvements`,
            description: `Enhanced ${file.name} with suggested improvements`,
            status: 'pending',
            timestamp: new Date()
          });
        }
      });
    }
    
    return changes;
  };

  return {
    messages,
    selectedContext,
    pendingChanges,
    isLoading,
    error,
    conversations,
    selectedPromptType,
    prompts,
    selectedPrompt,
    sendMessage,
    addContext,
    removeContext,
    applyChanges,
    rejectChanges,
    clearConversation,
    loadConversation,
    selectPrompt
  };
}; 