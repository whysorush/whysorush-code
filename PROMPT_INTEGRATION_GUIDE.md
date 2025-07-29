# Prompt Integration Guide

## Overview

The Whysorush Flow application now includes a comprehensive prompt management system that integrates AI prompts from the `/prompts` directory into the application's features. This system enhances the AI capabilities by providing contextual, intelligent responses based on the specific prompts loaded.

## 🚀 Features

### 1. **Prompt Management System**
- **Centralized Loading**: Automatically loads all prompts from the `/prompts` directory
- **Version Control**: Supports multiple versions of prompts (v1.0, v1.2, main)
- **Type Classification**: Categorizes prompts by type (agent, chat, memory, tools)
- **Metadata Extraction**: Automatically extracts descriptions, tags, and usage information

### 2. **Enhanced Composer Integration**
- **Smart Prompt Selection**: Automatically selects the best prompt based on user input
- **Context-Aware Responses**: Uses project structure and file context for better responses
- **Prompt Indicators**: Shows which prompt was used for each response
- **Mode Switching**: Users can manually switch between Chat, Agent, and Memory modes

### 3. **Memory System Enhancement**
- **Prompt-Based Memory**: Memories are created using appropriate prompts
- **Memory Rating**: Uses memory prompts to rate and evaluate memories
- **Context Preservation**: Maintains which prompt was used for each memory

### 4. **Prompt Registry**
- **Visual Management**: Browse and manage all loaded prompts
- **Live Editing**: Edit prompts directly in the application
- **Version Tracking**: View and manage different prompt versions
- **Export/Import**: Download and upload prompt files

## 📁 Prompt Files Structure

The system loads the following prompt files from `/src/prompts/`:

### Agent Prompts
- **Agent Prompt v1.2.txt** - Latest agent prompt with enhanced capabilities
- **Agent Prompt v1.0.txt** - Previous version for compatibility
- **Agent Prompt.txt** - Main agent prompt

### Chat Prompts
- **Chat Prompt.txt** - Conversational AI assistance

### Memory Prompts
- **Memory Prompt.txt** - Memory management and creation
- **Memory Rating Prompt.txt** - Memory evaluation and scoring

### Tools Prompts
- **Agent Tools v1.0.json** - Tool definitions and schemas

## 🔧 Technical Implementation

### Core Components

#### 1. **PromptManager** (`src/lib/promptManager.ts`)
```typescript
export class PromptManager {
  // Singleton pattern for global access
  static getInstance(): PromptManager
  
  // Load all prompts from the prompts directory
  async loadPrompts(): Promise<void>
  
  // Get prompts by type
  getPromptsByType(type: string): Prompt[]
  
  // Generate contextual responses
  async generatePromptResponse(promptId: string, context: PromptContext): Promise<string>
}
```

#### 2. **usePromptIntegration Hook** (`src/hooks/usePromptIntegration.ts`)
```typescript
export const usePromptIntegration = () => {
  // State management for prompts
  const { prompts, selectedPrompt, isLoading, error, stats }
  
  // Actions
  const { loadPrompts, selectPrompt, generateResponse, updatePrompt }
  
  return { ...state, ...actions }
}
```

#### 3. **Enhanced useComposer Hook** (`src/hooks/useComposer.ts`)
```typescript
export const useComposer = () => {
  // Integrates with prompt system
  const { prompts, selectedPrompt, selectPrompt, generateResponse }
  
  // Auto-selects appropriate prompt based on user input
  const sendMessage = async (content: string, context: FileSystemItem[]) => {
    // Smart prompt selection logic
    // Contextual response generation
  }
}
```

### Integration Points

#### 1. **Composer Component**
- **Prompt Selector**: UI for switching between AI modes
- **Response Indicators**: Shows which prompt was used
- **Context Integration**: Uses project files for better responses

#### 2. **PromptRegistry Component**
- **Visual Management**: Browse and edit prompts
- **Live Updates**: Real-time prompt editing
- **Version Control**: Manage different prompt versions

#### 3. **MemoryPanel Component**
- **Prompt-Based Creation**: Uses memory prompts for new memories
- **Context Preservation**: Tracks which prompt created each memory
- **Enhanced Management**: Better memory organization and editing

## 🎯 Usage Examples

### 1. **Using the Composer with Prompts**

```typescript
// The Composer automatically selects the best prompt based on your input:

// For refactoring requests
"Refactor the UserProfile component to improve performance"
// → Uses Agent Prompt v1.2

// For general questions
"What is the best way to handle state in React?"
// → Uses Chat Prompt

// For memory operations
"Remember that I prefer TypeScript over JavaScript"
// → Uses Memory Prompt
```

### 2. **Managing Prompts in the Registry**

```typescript
// View all prompts
const allPrompts = promptManager.getAllPrompts()

// Get prompts by type
const agentPrompts = promptManager.getPromptsByType('agent')

// Update a prompt
await promptManager.updatePrompt('agent-v1.2', newContent)
```

### 3. **Creating Contextual Responses**

```typescript
const context: PromptContext = {
  userMessage: "Refactor this component",
  selectedFiles: [componentFile],
  projectStructure: projectFiles,
  conversationHistory: messages,
  currentTask: "Component refactoring"
}

const response = await promptManager.generatePromptResponse('agent-v1.2', context)
```

## 🔄 Response Generation Logic

### 1. **Smart Prompt Selection**
The system automatically selects the best prompt based on:

- **Keywords**: "refactor", "implement", "create" → Agent Prompt
- **Memory Operations**: "remember", "forget", "recall" → Memory Prompt
- **General Questions**: Everything else → Chat Prompt

### 2. **Context Analysis**
Before generating responses, the system analyzes:

- **Project Structure**: React, TypeScript, JavaScript detection
- **File Types**: Components, config files, documentation
- **User Context**: Selected files, conversation history
- **Current Task**: What the user is trying to accomplish

### 3. **Response Enhancement**
Responses are enhanced with:

- **Project-Specific Information**: Uses actual project structure
- **File Context**: References selected files and their content
- **Prompt Attribution**: Shows which prompt was used
- **Actionable Suggestions**: Provides specific next steps

## 🎨 UI Enhancements

### 1. **Composer Enhancements**
- **AI Mode Selector**: Dropdown to switch between Chat/Agent/Memory modes
- **Prompt Indicators**: Shows which prompt was used for each response
- **Context Badges**: Visual indicators for selected files
- **Enhanced Messages**: Better formatting and prompt attribution

### 2. **PromptRegistry Features**
- **Type Icons**: Visual indicators for different prompt types
- **Version Badges**: Shows prompt versions
- **Live Editing**: In-app prompt editing with syntax highlighting
- **Statistics**: Shows prompt counts by type

### 3. **MemoryPanel Improvements**
- **Prompt Attribution**: Shows which prompt created each memory
- **Enhanced Stats**: Better memory analytics
- **Improved Management**: Add, edit, and delete memories with prompts

## 🔧 Configuration

### 1. **Adding New Prompts**
To add a new prompt:

1. Create a new file in `/src/prompts/`
2. Follow the naming convention: `[Type] [Name] [Version].txt`
3. The system will automatically detect and load it

### 2. **Customizing Prompt Types**
```typescript
// In promptManager.ts, add new types:
const promptFiles = [
  // ... existing prompts
  {
    id: 'custom-type',
    name: 'Custom Prompt',
    path: 'src/prompts/Custom Prompt.txt',
    type: 'custom' as const
  }
]
```

### 3. **Response Customization**
```typescript
// In promptManager.ts, add custom response logic:
private generateCustomResponse(prompt: Prompt, context: PromptContext): string {
  // Custom response generation logic
  return `Custom response for ${prompt.name}`
}
```

## 🚀 Benefits

### 1. **Improved AI Responses**
- **Context-Aware**: Responses are tailored to your project
- **Intelligent Selection**: Automatically chooses the best prompt
- **Enhanced Quality**: Better, more relevant responses

### 2. **Better User Experience**
- **Visual Feedback**: See which prompt is being used
- **Easy Management**: Edit prompts without leaving the app
- **Flexible Control**: Switch between different AI modes

### 3. **Enhanced Memory System**
- **Prompt-Based Learning**: Memories are created using appropriate prompts
- **Better Organization**: Improved memory categorization and management
- **Context Preservation**: Maintains prompt context for future reference

### 4. **Developer-Friendly**
- **Easy Integration**: Simple API for prompt management
- **Extensible**: Easy to add new prompt types and responses
- **Maintainable**: Centralized prompt management

## 🔮 Future Enhancements

### 1. **AI Service Integration**
- **Real AI Backend**: Connect to actual AI services (OpenAI, Anthropic, etc.)
- **Streaming Responses**: Real-time response generation
- **Model Selection**: Choose different AI models for different tasks

### 2. **Advanced Prompt Features**
- **Prompt Templates**: Reusable prompt templates
- **Dynamic Variables**: Prompt variables based on context
- **Prompt Chaining**: Chain multiple prompts together

### 3. **Enhanced Memory System**
- **Automatic Memory Creation**: AI automatically creates memories
- **Memory Clustering**: Group related memories together
- **Memory Search**: Advanced memory search and retrieval

### 4. **Collaboration Features**
- **Shared Prompts**: Share prompts with team members
- **Prompt Versioning**: Git-like versioning for prompts
- **Prompt Analytics**: Track prompt usage and effectiveness

## 📚 API Reference

### PromptManager Methods

```typescript
// Core methods
loadPrompts(): Promise<void>
getPrompt(id: string): Prompt | undefined
getPromptsByType(type: string): Prompt[]
getAllPrompts(): Prompt[]

// Response generation
generatePromptResponse(promptId: string, context: PromptContext): Promise<string>

// Management
updatePrompt(id: string, content: string): Promise<void>
savePrompt(prompt: Prompt): Promise<void>
getPromptStats(): Record<string, number>
```

### usePromptIntegration Hook

```typescript
// State
const { prompts, selectedPrompt, isLoading, error, stats }

// Actions
const { loadPrompts, selectPrompt, generateResponse, updatePrompt, getPromptsByType, getPromptById }
```

### PromptContext Interface

```typescript
interface PromptContext {
  userMessage: string
  selectedFiles: FileSystemItem[]
  projectStructure: FileSystemItem[]
  conversationHistory: any[]
  currentTask?: string
  userPreferences?: Record<string, any>
}
```

## 🎉 Conclusion

The prompt integration system significantly enhances the Whysorush Flow application by providing:

- **Intelligent AI Responses**: Context-aware, project-specific responses
- **Better User Control**: Easy switching between different AI modes
- **Enhanced Memory Management**: Prompt-based memory creation and organization
- **Developer-Friendly**: Easy to extend and customize

This system transforms the application from a simple code editor into a powerful AI-assisted development environment that learns from your preferences and provides intelligent, contextual assistance for all your coding tasks. 