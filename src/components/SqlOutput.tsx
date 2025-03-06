
import React from 'react';
import { Check, Copy } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SqlOutputProps {
  sql: string;
}

const SqlOutput = ({ sql }: SqlOutputProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "SQL query has been copied to your clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 animate-enter">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Generated SQL</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="flex items-center gap-2"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <SyntaxHighlighter 
        language="sql" 
        style={vscDarkPlus}
        customStyle={{ 
          margin: 0, 
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          background: 'transparent'
        }}
      >
        {sql || 'No SQL generated yet'}
      </SyntaxHighlighter>
    </Card>
  );
};

export default SqlOutput;
