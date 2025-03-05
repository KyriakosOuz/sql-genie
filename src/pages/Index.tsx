
import React, { useState } from 'react';
import SchemaUploader from '@/components/SchemaUploader';
import QueryInput from '@/components/QueryInput';
import SqlOutput from '@/components/SqlOutput';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [schema, setSchema] = useState('');
  const [sql, setSql] = useState('');
  const { toast } = useToast();

  const handleSchemaUpload = (uploadedSchema: string) => {
    setSchema(uploadedSchema);
  };

  const handleQuerySubmit = async (query: string) => {
    try {
      // TODO: Integrate with LLM API
      // For now, we'll just create a simple example
      setSql(`SELECT *\nFROM employees\nWHERE salary > 1000;`);
      
      toast({
        title: "SQL Generated",
        description: "Your query has been converted to SQL successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate SQL query",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold tracking-tight">SQL Query Generator</h1>
          <p className="text-lg text-muted-foreground">
            Transform natural language into SQL queries powered by AI
          </p>
        </div>

        <div className="grid gap-8">
          <SchemaUploader onSchemaUpload={handleSchemaUpload} />
          <QueryInput onQuerySubmit={handleQuerySubmit} />
          <SqlOutput sql={sql} />
        </div>
      </div>
    </div>
  );
};

export default Index;
