
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { KeyRound, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const ApiKeyInput = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState('deepseek');
  const [isSaved, setIsSaved] = useState(false);
  const [isValidFormat, setIsValidFormat] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if API key exists in localStorage based on selected provider
    const storageKey = apiProvider === 'deepseek' ? 'deepseek_api_key' : 'openrouter_api_key';
    const savedKey = localStorage.getItem(storageKey);
    
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
      setIsValidFormat(validateApiKeyFormat(savedKey, apiProvider));
    } else {
      // Clear the form when switching providers if no key is saved
      setApiKey('');
      setIsSaved(false);
      setIsValidFormat(true);
    }
  }, [apiProvider]);

  // Validate API key format based on provider
  const validateApiKeyFormat = (key: string, provider: string) => {
    if (!key) return true;
    if (provider === 'deepseek') {
      return key.startsWith('sk-');
    } else {
      // OpenRouter keys typically start with sk- as well
      return key.startsWith('sk-');
    }
  };

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    const isValid = validateApiKeyFormat(apiKey.trim(), apiProvider);
    setIsValidFormat(isValid);

    if (!isValid) {
      toast({
        title: "Warning",
        description: `The API key format doesn't look right. ${apiProvider === 'deepseek' ? 'DeepSeek' : 'OpenRouter'} API keys typically start with 'sk-'. Saving anyway.`,
        variant: "default", // Changed from "warning" to "default"
      });
    }

    // Save to the appropriate localStorage key based on provider
    const storageKey = apiProvider === 'deepseek' ? 'deepseek_api_key' : 'openrouter_api_key';
    localStorage.setItem(storageKey, apiKey.trim());
    localStorage.setItem('active_api_provider', apiProvider);
    setIsSaved(true);
    
    toast({
      title: "Success",
      description: `${apiProvider === 'deepseek' ? 'DeepSeek' : 'OpenRouter'} API key saved successfully`,
    });
  };

  return (
    <Card className="p-6 animate-enter">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">API Key Configuration</h3>
        </div>
        
        <Tabs defaultValue="deepseek" onValueChange={setApiProvider} value={apiProvider}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deepseek">DeepSeek</TabsTrigger>
            <TabsTrigger value="openrouter">OpenRouter</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deepseek" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your DeepSeek API key to enable SQL generation. Your key is stored locally in your browser.
            </p>
          </TabsContent>
          
          <TabsContent value="openrouter" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your OpenRouter API key as an alternative to DeepSeek. Your key is stored locally in your browser.
            </p>
          </TabsContent>
        </Tabs>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => {
                const newKey = e.target.value;
                setApiKey(newKey);
                setIsValidFormat(validateApiKeyFormat(newKey, apiProvider));
                if (isSaved) setIsSaved(false);
              }}
              placeholder={`Enter your ${apiProvider === 'deepseek' ? 'DeepSeek' : 'OpenRouter'} API key...`}
              className={`font-mono ${!isValidFormat && apiKey ? 'border-orange-400' : ''}`}
            />
            {!isValidFormat && apiKey && (
              <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-orange-500" />
            )}
          </div>
          <Button onClick={handleSaveKey} variant="outline" className="flex items-center gap-2 whitespace-nowrap">
            {isSaved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {isSaved ? 'Saved' : 'Save Key'}
          </Button>
        </div>
        
        {!isValidFormat && apiKey && (
          <p className="text-xs text-orange-500">
            This key format doesn't match the expected pattern (should start with 'sk-'). You can still save it, but it might not work.
          </p>
        )}
        
        <p className="text-xs text-muted-foreground">
          Your API key is stored only in your browser's localStorage and is never sent to our servers.
        </p>
      </div>
    </Card>
  );
};

export default ApiKeyInput;
