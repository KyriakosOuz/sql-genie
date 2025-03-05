
import React, { useState } from 'react';
import SchemaUploader from '@/components/SchemaUploader';
import QueryInput from '@/components/QueryInput';
import SqlOutput from '@/components/SqlOutput';
import ApiKeyInput from '@/components/ApiKeyInput';
import { useToast } from '@/hooks/use-toast';
import { generateSql } from '@/services/openaiService';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [schema, setSchema] = useState('');
  const [sql, setSql] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSchemaUpload = (uploadedSchema: string) => {
    setSchema(uploadedSchema);
    toast({
      title: "Schema uploaded",
      description: "Your database schema has been loaded successfully",
    });
  };

  const handleQuerySubmit = async (query: string) => {
    if (!schema) {
      toast({
        title: "Missing schema",
        description: "Please upload a database schema first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const generatedSql = await generateSql({ query, schema });
      setSql(generatedSql);
      
      toast({
        title: "SQL Generated",
        description: "Your query has been converted to SQL successfully",
      });
    } catch (error) {
      console.error("Error in handleQuerySubmit:", error);
      // Toast is already handled in the service
    } finally {
      setIsLoading(false);
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
          <ApiKeyInput />
          <SchemaUploader onSchemaUpload={handleSchemaUpload} />
          <QueryInput onQuerySubmit={handleQuerySubmit} isLoading={isLoading} />
          <SqlOutput sql={sql} />
        </div>
      </div>
    </div>
  );
};

export default Index;
