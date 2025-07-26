import React, { createContext, useContext, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Key, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeepSeekConfig {
  apiKey: string;
  endpoint: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface DeepSeekContextType {
  config: DeepSeekConfig;
  isConfigured: boolean;
  updateConfig: (newConfig: Partial<DeepSeekConfig>) => void;
  testConnection: () => Promise<boolean>;
  makeRequest: (prompt: string, context?: any) => Promise<string>;
}

const defaultConfig: DeepSeekConfig = {
  apiKey: '',
  endpoint: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-coder',
  maxTokens: 4096,
  temperature: 0.1
};

const DeepSeekContext = createContext<DeepSeekContextType | null>(null);

export const useDeepSeek = () => {
  const context = useContext(DeepSeekContext);
  if (!context) {
    throw new Error('useDeepSeek must be used within a DeepSeekProvider');
  }
  return context;
};

interface DeepSeekProviderProps {
  children: React.ReactNode;
}

export const DeepSeekProvider: React.FC<DeepSeekProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<DeepSeekConfig>(() => {
    // Try to load from localStorage
    const stored = localStorage.getItem('deepseek-config');
    return stored ? { ...defaultConfig, ...JSON.parse(stored) } : defaultConfig;
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();

  const updateConfig = useCallback((newConfig: Partial<DeepSeekConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    localStorage.setItem('deepseek-config', JSON.stringify(updated));
  }, [config]);

  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!config.apiKey) {
      toast({
        title: "API Key Required",
        description: "Please configure your DeepSeek API key first.",
        variant: "destructive"
      });
      return false;
    }

    setIsTestingConnection(true);
    try {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: 'Hello, this is a connection test.' }],
          max_tokens: 10,
          temperature: 0.1
        })
      });

      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "DeepSeek API is configured correctly.",
        });
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  }, [config, toast]);

  const makeRequest = useCallback(async (prompt: string, context?: any): Promise<string> => {
    if (!config.apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const messages = [
      {
        role: 'system',
        content: 'You are an advanced AI coding assistant. Provide precise, helpful responses focused on code quality and best practices.'
      },
      {
        role: 'user',
        content: context ? `Context: ${JSON.stringify(context)}\n\nPrompt: ${prompt}` : prompt
      }
    ];

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response generated';
  }, [config]);

  const isConfigured = Boolean(config.apiKey);

  const value: DeepSeekContextType = {
    config,
    isConfigured,
    updateConfig,
    testConnection,
    makeRequest
  };

  return (
    <DeepSeekContext.Provider value={value}>
      {children}
    </DeepSeekContext.Provider>
  );
};

interface DeepSeekConfigDialogProps {
  trigger?: React.ReactNode;
}

export const DeepSeekConfigDialog: React.FC<DeepSeekConfigDialogProps> = ({ trigger }) => {
  const { config, updateConfig, testConnection, isConfigured } = useDeepSeek();
  const [localConfig, setLocalConfig] = useState(config);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleSave = () => {
    updateConfig(localConfig);
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    await testConnection();
    setIsTestingConnection(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure DeepSeek
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Key className="h-5 w-5 text-primary-foreground" />
            </div>
            DeepSeek API Configuration
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Connection Status */}
          <Card className="p-4 bg-gradient-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isConfigured ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-warning" />
                )}
                <span className="font-medium">
                  {isConfigured ? 'API Configured' : 'API Not Configured'}
                </span>
              </div>
              <Badge variant={isConfigured ? 'default' : 'secondary'}>
                {isConfigured ? 'Ready' : 'Setup Required'}
              </Badge>
            </div>
          </Card>

          {/* API Configuration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={localConfig.apiKey}
                onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get your API key from the DeepSeek platform
              </p>
            </div>

            <div>
              <Label htmlFor="endpoint">API Endpoint</Label>
              <Input
                id="endpoint"
                placeholder="https://api.deepseek.com/v1/chat/completions"
                value={localConfig.endpoint}
                onChange={(e) => setLocalConfig({ ...localConfig, endpoint: e.target.value })}
                className="font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="deepseek-coder"
                  value={localConfig.model}
                  onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  placeholder="4096"
                  value={localConfig.maxTokens}
                  onChange={(e) => setLocalConfig({ ...localConfig, maxTokens: parseInt(e.target.value) || 4096 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                placeholder="0.1"
                value={localConfig.temperature}
                onChange={(e) => setLocalConfig({ ...localConfig, temperature: parseFloat(e.target.value) || 0.1 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lower values (0.1) for more focused responses, higher values (0.7-1.0) for more creative responses
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleTestConnection}
              disabled={!localConfig.apiKey || isTestingConnection}
              variant="outline"
              className="flex-1"
            >
              <Zap className={`h-4 w-4 mr-2 ${isTestingConnection ? 'animate-pulse' : ''}`} />
              Test Connection
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};