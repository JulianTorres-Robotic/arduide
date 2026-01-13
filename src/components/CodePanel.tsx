import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import { useIDE } from '@/contexts/IDEContext';
import { Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportAsIno } from '@/lib/storage';

const CodePanel: React.FC = () => {
  const { generatedCode, currentProject } = useIDE();
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [generatedCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      toast.success('Code copied to clipboard');
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const handleDownload = () => {
    const filename = currentProject?.name.replace(/[^a-z0-9]/gi, '_') || 'sketch';
    const content = exportAsIno(generatedCode, currentProject?.name || 'Untitled');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.ino`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sketch downloaded');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-panel-border bg-panel-header">
        <span className="text-sm font-medium text-foreground">Generated Code</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 bg-panel-bg">
        <pre className="text-sm leading-relaxed">
          <code ref={codeRef} className="language-cpp">
            {generatedCode || '// No code generated yet\n// Add blocks to the workspace'}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default CodePanel;
