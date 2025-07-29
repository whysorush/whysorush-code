import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  MessageSquare, 
  Trash2, 
  Search,
  Clock,
  FileText,
  GitBranch,
  Calendar,
  MoreHorizontal,
  Download,
  Upload
} from 'lucide-react';
import { Conversation } from '@/hooks/useComposer';

interface ConversationHistoryProps {
  onLoadConversation: (conversation: Conversation) => void;
  onClearHistory: () => void;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  onLoadConversation,
  onClearHistory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Mock conversation history - in a real app, this would come from storage
  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Payment Module Refactoring',
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Refactor the payment module to use Stripe v4 API',
          timestamp: new Date('2024-01-15T10:30:00')
        },
        {
          id: '2',
          role: 'assistant',
          content: 'I\'ll help you refactor the payment module. Here are the suggested changes...',
          timestamp: new Date('2024-01-15T10:32:00')
        }
      ],
      changes: [
        {
          id: '1',
          filePath: 'src/components/PaymentModule.tsx',
          fileName: 'PaymentModule.tsx',
          originalContent: '// Original content',
          newContent: '// New content',
          description: 'Enhanced payment module with Stripe v4',
          status: 'applied',
          timestamp: new Date('2024-01-15T10:32:00')
        }
      ],
      createdAt: new Date('2024-01-15T10:30:00'),
      updatedAt: new Date('2024-01-15T10:32:00')
    },
    {
      id: '2',
      title: 'Authentication Error Handling',
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Add error handling to the user authentication',
          timestamp: new Date('2024-01-14T15:20:00')
        },
        {
          id: '2',
          role: 'assistant',
          content: 'I\'ll add comprehensive error handling to your authentication system...',
          timestamp: new Date('2024-01-14T15:22:00')
        }
      ],
      changes: [
        {
          id: '1',
          filePath: 'src/components/AuthForm.tsx',
          fileName: 'AuthForm.tsx',
          originalContent: '// Original content',
          newContent: '// New content',
          description: 'Enhanced authentication with error handling',
          status: 'applied',
          timestamp: new Date('2024-01-14T15:22:00')
        }
      ],
      createdAt: new Date('2024-01-14T15:20:00'),
      updatedAt: new Date('2024-01-14T15:22:00')
    },
    {
      id: '3',
      title: 'Data Visualization Component',
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Create a new React component for data visualization',
          timestamp: new Date('2024-01-13T09:15:00')
        },
        {
          id: '2',
          role: 'assistant',
          content: 'I\'ll create a comprehensive data visualization component...',
          timestamp: new Date('2024-01-13T09:17:00')
        }
      ],
      changes: [
        {
          id: '1',
          filePath: 'src/components/DataVisualization.tsx',
          fileName: 'DataVisualization.tsx',
          originalContent: '',
          newContent: '// New component content',
          description: 'Created data visualization component',
          status: 'applied',
          timestamp: new Date('2024-01-13T09:17:00')
        }
      ],
      createdAt: new Date('2024-01-13T09:15:00'),
      updatedAt: new Date('2024-01-13T09:17:00')
    }
  ]);

  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getConversationSummary = (conversation: Conversation) => {
    const userMessages = conversation.messages.filter(msg => msg.role === 'user');
    const appliedChanges = conversation.changes.filter(change => change.status === 'applied');
    
    return {
      messageCount: conversation.messages.length,
      userMessages: userMessages.length,
      appliedChanges: appliedChanges.length,
      lastMessage: conversation.messages[conversation.messages.length - 1]?.content.slice(0, 100) + '...'
    };
  };

  const exportConversation = (conversation: Conversation) => {
    const data = {
      ...conversation,
      messages: conversation.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      })),
      changes: conversation.changes.map(change => ({
        ...change,
        timestamp: change.timestamp.toISOString()
      })),
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteConversation = (conversationId: string) => {
    // In a real app, this would remove from storage
    console.log('Deleting conversation:', conversationId);
  };

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No conversation history</p>
          <p className="text-sm">Your conversations will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Conversation History</h3>
            <Badge variant="secondary">{conversations.length}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={onClearHistory}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredConversations.map((conversation) => {
            const summary = getConversationSummary(conversation);
            
            return (
              <Card
                key={conversation.id}
                className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedConversation === conversation.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <h4 className="font-medium truncate">{conversation.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {summary.appliedChanges} changes
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {summary.lastMessage}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(conversation.updatedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {summary.messageCount} messages
                      </div>
                      <div className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        {summary.appliedChanges} applied
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportConversation(conversation);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Actions */}
      {selectedConversation && (
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                const conversation = conversations.find(c => c.id === selectedConversation);
                if (conversation) {
                  onLoadConversation(conversation);
                }
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Load Conversation
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedConversation(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationHistory; 