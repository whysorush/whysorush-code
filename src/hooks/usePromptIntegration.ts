import { useState, useEffect, useCallback } from 'react';
import { promptManager, Prompt, PromptContext } from '@/lib/promptManager';
import { FileSystemItem } from '@/types/fileSystem';

export interface PromptIntegrationState {
  prompts: Prompt[];
  selectedPrompt: Prompt | null;
  isLoading: boolean;
  error: string | null;
  stats: Record<string, number>;
}

export interface UsePromptIntegrationReturn extends PromptIntegrationState {
  loadPrompts: () => Promise<void>;
  selectPrompt: (promptId: string) => void;
  generateResponse: (userMessage: string, context: PromptContext) => Promise<string>;
  updatePrompt: (promptId: string, content: string) => Promise<void>;
  getPromptsByType: (type: string) => Prompt[];
  getPromptById: (id: string) => Prompt | undefined;
}

export const usePromptIntegration = (): UsePromptIntegrationReturn => {
  const [state, setState] = useState<PromptIntegrationState>({
    prompts: [],
    selectedPrompt: null,
    isLoading: false,
    error: null,
    stats: {}
  });

  const loadPrompts = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await promptManager.loadPrompts();
      const prompts = promptManager.getAllPrompts();
      const stats = promptManager.getPromptStats();
      
      setState(prev => ({
        ...prev,
        prompts,
        stats,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load prompts',
        isLoading: false
      }));
    }
  }, []);

  const selectPrompt = useCallback((promptId: string) => {
    const prompt = promptManager.getPrompt(promptId);
    setState(prev => ({
      ...prev,
      selectedPrompt: prompt || null
    }));
  }, []);

  const generateResponse = useCallback(async (
    userMessage: string,
    context: PromptContext
  ): Promise<string> => {
    if (!state.selectedPrompt) {
      throw new Error('No prompt selected');
    }

    try {
      return await promptManager.generatePromptResponse(
        state.selectedPrompt.id,
        context
      );
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to generate response');
    }
  }, [state.selectedPrompt]);

  const updatePrompt = useCallback(async (promptId: string, content: string) => {
    try {
      await promptManager.updatePrompt(promptId, content);
      
      // Refresh prompts
      const prompts = promptManager.getAllPrompts();
      const stats = promptManager.getPromptStats();
      
      setState(prev => ({
        ...prev,
        prompts,
        stats
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update prompt'
      }));
    }
  }, []);

  const getPromptsByType = useCallback((type: string): Prompt[] => {
    return promptManager.getPromptsByType(type);
  }, []);

  const getPromptById = useCallback((id: string): Prompt | undefined => {
    return promptManager.getPrompt(id);
  }, []);

  // Load prompts on mount
  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  return {
    ...state,
    loadPrompts,
    selectPrompt,
    generateResponse,
    updatePrompt,
    getPromptsByType,
    getPromptById
  };
}; 