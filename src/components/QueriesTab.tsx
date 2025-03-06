
import React from 'react';
import { FileCode, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Query } from '@/lib/supabase';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
        <Card key={query.id} className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">{query.prompt}</CardTitle>
            <CardDescription>
              {new Date(query.created_at).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <SyntaxHighlighter 
              language="sql" 
              style={vscDarkPlus}
              customStyle={{ 
                margin: 0, 
                borderRadius: '0.375rem',
                fontSize: '0.875rem' 
              }}
            >
              {query.sql_result}
            </SyntaxHighlighter>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QueriesTab;
