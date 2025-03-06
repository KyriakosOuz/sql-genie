
import React from 'react';
import { FileCode, Loader2, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Query } from '@/lib/supabase';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useToast } from '@/hooks/use-toast';

interface QueriesTabProps {
  queries: Query[];
  loading: boolean;
  searchTerm: string;
}

const QueriesTab: React.FC<QueriesTabProps> = ({ queries, loading, searchTerm }) => {
  // Filter queries based on search term
  const filteredQueries = searchTerm 
    ? queries.filter(q => 
        q.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.sql_result.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : queries;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (filteredQueries.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
        <FileCode className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No queries found</h3>
        <p className="text-muted-foreground mt-2">
          {searchTerm ? "Try a different search term" : "You haven't saved any queries yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      {filteredQueries.map((query) => (
        <QueryCard key={query.id} query={query} />
      ))}
    </div>
  );
};

// Separate component for each query card
const QueryCard = ({ query }: { query: Query }) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(query.sql_result);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "SQL query has been copied to your clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{query.prompt}</CardTitle>
            <CardDescription>
              {new Date(query.created_at).toLocaleString()}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={copyToClipboard}
            className="flex items-center gap-1"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
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
          {query.sql_result}
        </SyntaxHighlighter>
      </CardContent>
    </Card>
  );
};

export default QueriesTab;
