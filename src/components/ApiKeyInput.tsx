
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { KeyRound, Save, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ApiKeyInput = () => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if API key exists in localStorage
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('openai_api_key', apiKey.trim());
    setIsSaved(true);
    toast({
      title: "Success",
      description: "API key saved successfully",
    });
  };

  return (
    <Card className="p-6 animate-enter">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">OpenAI API Key</h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Enter your OpenAI API key to enable SQL generation. Your key is stored locally in your browser.
        </p>
        
        <div className="flex gap-2">
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              if (isSaved) setIsSaved(false);
            }}
            placeholder="sk-..."
            className="font-mono"
          />
          <Button onClick={handleSaveKey} variant="outline" className="flex items-center gap-2">
            {isSaved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {isSaved ? 'Saved' : 'Save Key'}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Your API key is stored only in your browser's localStorage and is never sent to our servers.
        </p>
      </div>
    </Card>
  );
};

export default ApiKeyInput;
