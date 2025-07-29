import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Check, 
  X, 
  FileText, 
  Download,
  Eye,
  Copy,
  GitBranch,
  AlertCircle
} from 'lucide-react';
import { CodeChange } from '@/hooks/useComposer';

interface DiffViewerProps {
  changes: CodeChange[];
  onApply: () => void;
  onReject: (changeId?: string) => void;
  isLoading?: boolean;
}

const DiffViewer: React.FC<DiffViewerProps> = ({
  changes,
  onApply,
  onReject,
  isLoading = false
}) => {
  const [selectedChange, setSelectedChange] = useState<string | null>(
    changes.length > 0 ? changes[0].id : null
  );

  const selectedChangeData = changes.find(change => change.id === selectedChange);

  const renderDiff = (original: string, modified: string) => {
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');
    
    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    const diffLines = [];

    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || '';
      const modifiedLine = modifiedLines[i] || '';
      
      if (originalLine === modifiedLine) {
        diffLines.push({
          type: 'unchanged',
          original: originalLine,
          modified: modifiedLine,
          lineNumber: i + 1
        });
      } else {
        diffLines.push({
          type: 'changed',
          original: originalLine,
          modified: modifiedLine,
          lineNumber: i + 1
        });
      }
    }

    return diffLines;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (changes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No pending changes</p>
          <p className="text-sm">Start a conversation to see code changes here</p>
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
            <GitBranch className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Code Changes</h3>
            <Badge variant="secondary">{changes.length}</Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReject()}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Reject All
            </Button>
            <Button
              onClick={onApply}
              disabled={isLoading || changes.length === 0}
            >
              <Check className="h-4 w-4 mr-2" />
              Apply All
            </Button>
          </div>
        </div>

        {/* Change List */}
        <div className="flex gap-2 overflow-x-auto">
          {changes.map((change) => (
            <Button
              key={change.id}
              variant={selectedChange === change.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedChange(change.id)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <FileText className="h-4 w-4" />
              {change.fileName}
              {change.status === 'applied' && (
                <Badge variant="secondary" className="ml-1">Applied</Badge>
              )}
              {change.status === 'rejected' && (
                <Badge variant="destructive" className="ml-1">Rejected</Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Diff Content */}
      {selectedChangeData && (
        <div className="flex-1 flex flex-col">
          {/* File Header */}
          <div className="p-3 border-b border-border bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{selectedChangeData.fileName}</span>
                <Badge variant="outline" className="text-xs">
                  {selectedChangeData.filePath}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(selectedChangeData.newContent)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadFile(selectedChangeData.newContent, selectedChangeData.fileName)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedChangeData.description}
            </p>
          </div>

          {/* Diff View */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Original */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Original</h4>
                    <Badge variant="outline" className="text-xs">Removed</Badge>
                  </div>
                  <Card className="p-3 bg-red-50 border-red-200">
                    <pre className="text-sm font-mono text-red-800 whitespace-pre-wrap">
                      {selectedChangeData.originalContent}
                    </pre>
                  </Card>
                </div>

                {/* Modified */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Modified</h4>
                    <Badge variant="outline" className="text-xs">Added</Badge>
                  </div>
                  <Card className="p-3 bg-green-50 border-green-200">
                    <pre className="text-sm font-mono text-green-800 whitespace-pre-wrap">
                      {selectedChangeData.newContent}
                    </pre>
                  </Card>
                </div>
              </div>

              {/* Line-by-line diff */}
              <div className="mt-6">
                <h4 className="font-medium text-sm mb-3">Line-by-line Changes</h4>
                <Card className="overflow-hidden">
                  <div className="grid grid-cols-3 gap-0 border-b border-border">
                    <div className="p-2 bg-muted/50 text-xs font-medium">Line</div>
                    <div className="p-2 bg-muted/50 text-xs font-medium">Original</div>
                    <div className="p-2 bg-muted/50 text-xs font-medium">Modified</div>
                  </div>
                  <ScrollArea className="max-h-64">
                    {renderDiff(selectedChangeData.originalContent, selectedChangeData.newContent).map((line, index) => (
                      <div
                        key={index}
                        className={`grid grid-cols-3 gap-0 border-b border-border ${
                          line.type === 'changed' ? 'bg-yellow-50' : ''
                        }`}
                      >
                        <div className="p-2 text-xs text-muted-foreground font-mono">
                          {line.lineNumber}
                        </div>
                        <div className={`p-2 text-xs font-mono ${
                          line.type === 'changed' ? 'text-red-600 bg-red-50' : ''
                        }`}>
                          {line.original || ' '}
                        </div>
                        <div className={`p-2 text-xs font-mono ${
                          line.type === 'changed' ? 'text-green-600 bg-green-50' : ''
                        }`}>
                          {line.modified || ' '}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </Card>
              </div>
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedChangeData.status === 'pending' && 'Ready to apply'}
                {selectedChangeData.status === 'applied' && 'Changes applied'}
                {selectedChangeData.status === 'rejected' && 'Changes rejected'}
              </div>
              <div className="flex gap-2">
                {selectedChangeData.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReject(selectedChangeData.id)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={onApply}
                      disabled={isLoading}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiffViewer; 