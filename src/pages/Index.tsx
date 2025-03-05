
import React, { useState, useEffect } from 'react';
import SchemaUploader from '@/components/SchemaUploader';
import QueryInput from '@/components/QueryInput';
import SqlOutput from '@/components/SqlOutput';
import ApiKeyInput from '@/components/ApiKeyInput';
import { useToast } from '@/hooks/use-toast';
import { generateSql, getApiConfig } from '@/services/openaiService';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Index = () => {
  const [schema, setSchema] = useState('');
  const [sql, setSql] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const { toast } = useToast();

  // Check if API key exists on component mount
  useEffect(() => {
    const { apiKey } = getApiConfig();
    setApiKeyMissing(!apiKey);
  }, []);

  const handleSchemaUpload = (uploadedSchema: string) => {
    setSchema(uploadedSchema);
    toast({
      title: "Schema uploaded",
      description: "Your database schema has been loaded successfully",
    });
  };

  const handleQuerySubmit = async (query: string) => {
    // Check if API key exists before making the request
    const { apiKey, provider } = getApiConfig();
    
    if (!apiKey) {
      setApiKeyMissing(true);
      toast({
        title: "API Key Missing",
        description: `Please enter your ${provider === 'deepseek' ? 'DeepSeek' : 'OpenRouter'} API key above`,
        variant: "destructive",
      });
      return;
    }
    
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
      setApiKeyMissing(false);
      
      toast({
        title: "SQL Generated",
        description: "Your query has been converted to SQL successfully",
      });
    } catch (error) {
      console.error("Error in handleQuerySubmit:", error);
      // Check if error is related to API key
      if (error instanceof Error && error.message.includes('API key')) {
        setApiKeyMissing(true);
      }
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
          
          {apiKeyMissing && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>API Key Required</AlertTitle>
              <AlertDescription>
                Please enter and save your API key in the form above to use the SQL generator.
              </AlertDescription>
            </Alert>
          )}
          
          <SchemaUploader onSchemaUpload={handleSchemaUpload} />
          <QueryInput onQuerySubmit={handleQuerySubmit} isLoading={isLoading} />
          <SqlOutput sql={sql} />
        </div>
      </div>
    </div>
  );
};

export default Index;
