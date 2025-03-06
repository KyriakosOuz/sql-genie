
import React from 'react';
import { Check, Copy } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import SqlOptimizationInsights from './SqlOptimizationInsights';

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
    <div className="space-y-4">
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
        <pre className="bg-code-background text-code-foreground p-4 rounded-lg overflow-x-auto">
          <code className="font-mono text-sm">{sql || 'No SQL generated yet'}</code>
        </pre>
      </Card>
      
      {sql && <SqlOptimizationInsights sql={sql} />}
    </div>
  );
};

export default SqlOutput;
