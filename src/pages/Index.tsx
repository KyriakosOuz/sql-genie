import React, { useState, useEffect } from 'react';
import SchemaUploader from '@/components/SchemaUploader';
import QueryInput from '@/components/QueryInput';
import SqlOutput from '@/components/SqlOutput';
import ApiKeyInput from '@/components/ApiKeyInput';
import { useToast } from '@/hooks/use-toast';
import { generateSql, getApiConfig } from '@/services/openaiService';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const Index = () => {
  const [schema, setSchema] = useState('');
  const [sql, setSql] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if API key exists on component mount
  useEffect(() => {
    const { apiKey } = getApiConfig();
    setApiKeyMissing(!apiKey);
    
    // If user is logged in and Supabase is configured, try to get their last used schema
    if (user && isSupabaseConfigured) {
      fetchLastSchema();
    }
  }, [user]);

  // Fetch user's last used schema
  const fetchLastSchema = async () => {
    if (!isSupabaseConfigured) return;
    
    try {
      const { data, error } = await supabase
        .from('uploaded_schemas')
        .select('schema_sql')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setSchema(data[0].schema_sql);
        toast({
          title: "Schema loaded",
          description: "Your last used schema has been loaded",
        });
      }
    } catch (error) {
      console.error("Error fetching last schema:", error);
    }
  };

  const handleSchemaUpload = async (uploadedSchema: string, schemaName: string = "Uploaded Schema") => {
    setSchema(uploadedSchema);
    toast({
      title: "Schema uploaded",
      description: "Your database schema has been loaded successfully",
    });
    
    // Save schema to Supabase if user is logged in and Supabase is configured
    if (user && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('uploaded_schemas')
          .insert({
            user_id: user.id,
            name: schemaName,
            schema_sql: uploadedSchema,
          });
        
        if (error) throw error;
        
        toast({
          title: "Schema saved",
          description: "Your schema has been saved to your account",
        });
      } catch (error) {
        console.error("Error saving schema:", error);
        toast({
          title: "Error saving schema",
          description: error instanceof Error ? error.message : "Failed to save schema",
          variant: "destructive",
        });
      }
    }
  };

  const handleQuerySubmit = async (query: string) => {
    // Check if API key exists before making the request
    const { apiKey, provider } = getApiConfig();
    
    // Get provider display name for messages
    const providerDisplayName = 
      provider === 'deepseek' ? 'DeepSeek' : 
      provider === 'openrouter' ? 'OpenRouter' : 'Mistral AI';
    
    if (!apiKey) {
      setApiKeyMissing(true);
      toast({
        title: "API Key Missing",
        description: `Please enter your ${providerDisplayName} API key above`,
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
      
      // Save query to Supabase if user is logged in and Supabase is configured
      if (user && isSupabaseConfigured) {
        try {
          const { error } = await supabase
            .from('queries')
            .insert({
              user_id: user.id,
              prompt: query,
              sql_result: generatedSql,
              schema: schema
            });
          
          if (error) throw error;
          
          toast({
            title: "Query saved",
            description: "Your query and result have been saved to your account",
          });
        } catch (error) {
          console.error("Error saving query:", error);
        }
      }
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
          
          <SchemaUploader onSchemaUpload={handleSchemaUpload} initialSchema={schema} />
          <QueryInput onQuerySubmit={handleQuerySubmit} isLoading={isLoading} />
          <SqlOutput sql={sql} />
        </div>
      </div>
    </div>
  );
};

export default Index;
