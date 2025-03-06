
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Copy, Database, Download, Table } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UploadedSchema } from '@/lib/supabase';

interface SchemaViewerProps {
  schema: UploadedSchema;
}

const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema }) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const extractTables = (sql: string): { name: string, definition: string }[] => {
    const tables: { name: string, definition: string }[] = [];
    
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:"?(\w+)"?\.)?(?:"?(\w+)"?)\s*\(([\s\S]*?)(?:\);)/gi;
    
    let match;
    while ((match = tableRegex.exec(sql)) !== null) {
      const tableName = match[2] || match[1];
      const tableDefinition = match[0];
      
      if (tableName) {
        tables.push({
          name: tableName,
          definition: tableDefinition
        });
      }
    }
    
    return tables;
  };

  const tables = extractTables(schema.schema_sql);
  
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(schema.schema_sql);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Schema SQL has been copied to your clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSchema = () => {
    const blob = new Blob([schema.schema_sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.name.replace(/\s+/g, '_')}_schema.sql`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: `Schema "${schema.name}" has been downloaded`,
    });
  };

  return (
    <Card className="overflow-hidden mb-4">
      <CardHeader className="bg-muted/50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-4 w-4" />
              {schema.name}
            </CardTitle>
            <CardDescription>
              {new Date(schema.created_at).toLocaleString()}
              {tables.length > 0 && ` • ${tables.length} tables`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={downloadSchema}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={copyToClipboard}
              className="flex items-center gap-1"
            >
              <Copy className="h-4 w-4" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`p-0 overflow-hidden ${isExpanded ? 'h-[400px] overflow-y-auto' : 'h-0'}`}>
        {tables.length > 0 ? (
          <div className="divide-y">
            {tables.map((table, index) => (
              <SchemaTable key={index} table={table} />
            ))}
          </div>
        ) : (
          <div className="p-4">
            <SyntaxHighlighter 
              language="sql" 
              style={vscDarkPlus}
              customStyle={{ 
                margin: 0, 
                borderRadius: '0.375rem',
                fontSize: '0.875rem' 
              }}
            >
              {schema.schema_sql}
            </SyntaxHighlighter>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SchemaTable = ({ table }: { table: { name: string, definition: string } }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="py-2 px-4">
      <div 
        className="flex items-center justify-between cursor-pointer py-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Table className="h-4 w-4 text-primary" />
          <span className="font-medium">{table.name}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </div>
      
      {isExpanded && (
        <div className="pt-2 pl-6 max-h-[300px] overflow-y-auto">
          <SyntaxHighlighter 
            language="sql" 
            style={vscDarkPlus}
            customStyle={{ 
              margin: 0, 
              borderRadius: '0.375rem',
              fontSize: '0.875rem' 
            }}
          >
            {table.definition}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
};

export default SchemaViewer;
