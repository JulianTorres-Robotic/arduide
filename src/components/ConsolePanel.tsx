import React, { useRef, useEffect } from 'react';
import { useIDE } from '@/contexts/IDEContext';
import { Trash2, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const ConsolePanel: React.FC = () => {
  const { consoleMessages, clearConsole } = useIDE();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [consoleMessages]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0" />;
      case 'success':
        return <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />;
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-destructive';
      case 'warning':
        return 'text-warning';
      case 'success':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-panel-border bg-panel-header">
        <span className="text-sm font-medium text-foreground">Console</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearConsole}
          className="h-7 px-2 text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 bg-panel-bg" ref={scrollRef}>
        <div className="p-3 font-mono text-xs space-y-1">
          {consoleMessages.length === 0 ? (
            <div className="text-muted-foreground italic">Console output will appear here...</div>
          ) : (
            consoleMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 py-0.5 ${getColorClass(msg.type)}`}
              >
                {getIcon(msg.type)}
                <span className="text-muted-foreground text-[10px]">
                  [{msg.timestamp.toLocaleTimeString()}]
                </span>
                <span className="break-all">{msg.message}</span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConsolePanel;
