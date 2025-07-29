import { FileSystemItem } from '@/types/fileSystem';

export interface Prompt {
  id: string;
  name: string;
  content: string;
  type: 'agent' | 'chat' | 'memory' | 'tools';
  version?: string;
  path: string;
  lastModified: Date;
  metadata?: {
    description?: string;
    tags?: string[];
    author?: string;
    usage?: string;
  };
}

export interface PromptContext {
  userMessage: string;
  selectedFiles: FileSystemItem[];
  projectStructure: FileSystemItem[];
  conversationHistory: any[];
  currentTask?: string;
  userPreferences?: Record<string, any>;
}

export class PromptManager {
  private static instance: PromptManager;
  private prompts: Map<string, Prompt> = new Map();
  private loaded = false;

  private constructor() {}

  static getInstance(): PromptManager {
    if (!PromptManager.instance) {
      PromptManager.instance = new PromptManager();
    }
    return PromptManager.instance;
  }

  async loadPrompts(): Promise<void> {
    if (this.loaded) return;

    const promptFiles = [
      {
        id: 'agent-v1.2',
        name: 'Agent Prompt v1.2',
        path: 'src/prompts/Agent Prompt v1.2.txt',
        type: 'agent' as const,
        version: '1.2'
      },
      {
        id: 'agent-v1.0',
        name: 'Agent Prompt v1.0',
        path: 'src/prompts/Agent Prompt v1.0.txt',
        type: 'agent' as const,
        version: '1.0'
      },
      {
        id: 'agent-main',
        name: 'Agent Prompt',
        path: 'src/prompts/Agent Prompt.txt',
        type: 'agent' as const,
        version: 'main'
      },
      {
        id: 'chat',
        name: 'Chat Prompt',
        path: 'src/prompts/Chat Prompt.txt',
        type: 'chat' as const
      },
      {
        id: 'memory',
        name: 'Memory Prompt',
        path: 'src/prompts/Memory Prompt.txt',
        type: 'memory' as const
      },
      {
        id: 'memory-rating',
        name: 'Memory Rating Prompt',
        path: 'src/prompts/Memory Rating Prompt.txt',
        type: 'memory' as const
      },
      {
        id: 'tools-v1.0',
        name: 'Agent Tools v1.0',
        path: 'src/prompts/Agent Tools v1.0.json',
        type: 'tools' as const,
        version: '1.0'
      }
    ];

    for (const promptFile of promptFiles) {
      try {
        const response = await fetch(promptFile.path);
        let content = '';
        let lastModified = new Date();

        if (response.ok) {
          content = await response.text();
          const lastModifiedHeader = response.headers.get('last-modified');
          if (lastModifiedHeader) {
            lastModified = new Date(lastModifiedHeader);
          }
        } else {
          // Fallback content for development
          content = `# ${promptFile.name}\n\nPrompt content will be loaded here...\n\n## Status\nFile not found at ${promptFile.path}`;
        }

        const prompt: Prompt = {
          id: promptFile.id,
          name: promptFile.name,
          content,
          type: promptFile.type,
          version: promptFile.version,
          path: promptFile.path,
          lastModified,
          metadata: this.extractMetadata(content, promptFile.type)
        };

        this.prompts.set(promptFile.id, prompt);
      } catch (error) {
        console.warn(`Failed to load prompt ${promptFile.path}:`, error);
      }
    }

    this.loaded = true;
  }

  private extractMetadata(content: string, type: string): Prompt['metadata'] {
    const metadata: Prompt['metadata'] = {};

    // Extract description from comments or headers
    const descriptionMatch = content.match(/# (.+)/);
    if (descriptionMatch) {
      metadata.description = descriptionMatch[1];
    }

    // Extract tags from content
    const tagMatches = content.match(/tags?:\s*\[([^\]]+)\]/gi);
    if (tagMatches) {
      metadata.tags = tagMatches[0].match(/\[([^\]]+)\]/)?.[1]?.split(',').map(t => t.trim()) || [];
    }

    // Extract usage patterns
    if (type === 'agent') {
      metadata.usage = 'Used for autonomous AI agent interactions with codebase';
    } else if (type === 'chat') {
      metadata.usage = 'Used for conversational AI assistance';
    } else if (type === 'memory') {
      metadata.usage = 'Used for memory management and rating';
    } else if (type === 'tools') {
      metadata.usage = 'Defines available tools and their schemas';
    }

    return metadata;
  }

  getPrompt(id: string): Prompt | undefined {
    return this.prompts.get(id);
  }

  getPromptsByType(type: string): Prompt[] {
    return Array.from(this.prompts.values()).filter(p => p.type === type);
  }

  getAllPrompts(): Prompt[] {
    return Array.from(this.prompts.values());
  }

  async generatePromptResponse(
    promptId: string,
    context: PromptContext
  ): Promise<string> {
    const prompt = this.getPrompt(promptId);
    if (!prompt) {
      throw new Error(`Prompt not found: ${promptId}`);
    }

    // Try to use DeepSeek API if available
    try {
      // Check if DeepSeek is available in the global scope
      if (typeof window !== 'undefined' && (window as any).deepSeekAPI) {
        const deepSeekAPI = (window as any).deepSeekAPI;
        if (deepSeekAPI.isConfigured && deepSeekAPI.makeRequest) {
          const fullPrompt = `${prompt.content}\n\nContext: ${JSON.stringify(context)}\n\nUser Message: ${context.userMessage}`;
          return await deepSeekAPI.makeRequest(fullPrompt, context);
        }
      }
    } catch (error) {
      console.warn('DeepSeek API not available, falling back to mock response:', error);
    }

    // Fallback to mock response
    return this.generateContextualResponse(prompt, context);
  }

  private generateContextualResponse(prompt: Prompt, context: PromptContext): string {
    const { userMessage, selectedFiles, projectStructure } = context;

    switch (prompt.type) {
      case 'agent':
        return this.generateAgentResponse(prompt, context);
      case 'chat':
        return this.generateChatResponse(prompt, context);
      case 'memory':
        return this.generateMemoryResponse(prompt, context);
      case 'tools':
        return this.generateToolsResponse(prompt, context);
      default:
        return `Using ${prompt.name} to process: ${userMessage}`;
    }
  }

  private generateAgentResponse(prompt: Prompt, context: PromptContext): string {
    const { userMessage, selectedFiles } = context;
    
    return `Based on the Agent Prompt (${prompt.name}), I'll help you with your coding task.

**User Request:** ${userMessage}

**Context Analysis:**
- ${selectedFiles.length} files selected for context
- Project structure analyzed
- Ready to provide autonomous assistance

**Available Actions:**
• Code analysis and refactoring
• Feature development and implementation
• Bug identification and fixes
• Code review and optimization
• Documentation generation

I'll proceed with your request using the comprehensive agent capabilities defined in the prompt.`;
  }

  private generateChatResponse(prompt: Prompt, context: PromptContext): string {
    const { userMessage, selectedFiles } = context;
    
    return `Using the Chat Prompt (${prompt.name}) for conversational assistance.

**Your Message:** ${userMessage}

**Context:** ${selectedFiles.length} files in context

I'm here to help with your coding questions and provide guidance. What would you like to work on?`;
  }

  private generateMemoryResponse(prompt: Prompt, context: PromptContext): string {
    const { userMessage } = context;
    
    return `Using the Memory Prompt (${prompt.name}) for memory management.

**Memory Operation:** ${userMessage}

I'll help you manage and rate memories based on their relevance and usefulness for future interactions.`;
  }

  private generateToolsResponse(prompt: Prompt, context: PromptContext): string {
    const { userMessage } = context;
    
    return `Using the Tools Prompt (${prompt.name}) for tool orchestration.

**Tool Request:** ${userMessage}

Available tools have been loaded and are ready for use. I can help you with:
• Code search and analysis
• File operations
• Terminal commands
• Project management`;
  }

  async updatePrompt(id: string, content: string): Promise<void> {
    const prompt = this.prompts.get(id);
    if (prompt) {
      prompt.content = content;
      prompt.lastModified = new Date();
      prompt.metadata = this.extractMetadata(content, prompt.type);
    }
  }

  async savePrompt(prompt: Prompt): Promise<void> {
    // In a real implementation, this would save to the file system
    this.prompts.set(prompt.id, prompt);
  }

  getPromptStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const prompt of this.prompts.values()) {
      stats[prompt.type] = (stats[prompt.type] || 0) + 1;
    }
    return stats;
  }
}

export const promptManager = PromptManager.getInstance(); 