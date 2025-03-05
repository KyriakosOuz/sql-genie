
import { toast } from "@/hooks/use-toast";

interface GenerateSqlParams {
  query: string;
  schema: string;
}

// Helper function to get the API key and provider
export const getApiConfig = () => {
  // Check which provider is active
  const activeProvider = localStorage.getItem('active_api_provider') || 'deepseek';
  
  // Get the appropriate API key based on provider
  let apiKeyName;
  switch(activeProvider) {
    case 'deepseek': apiKeyName = 'deepseek_api_key'; break;
    case 'openrouter': apiKeyName = 'openrouter_api_key'; break;
    case 'mistral': apiKeyName = 'mistral_api_key'; break;
    default: apiKeyName = 'deepseek_api_key';
  }
  
  const apiKey = localStorage.getItem(apiKeyName);
  
  return { apiKey, provider: activeProvider };
};

export const generateSql = async ({ query, schema }: GenerateSqlParams): Promise<string> => {
  try {
    // Get API configuration
    const { apiKey, provider } = getApiConfig();
    
    // Get provider display name for error messages
    const providerDisplayName = 
      provider === 'deepseek' ? 'DeepSeek' : 
      provider === 'openrouter' ? 'OpenRouter' : 'Mistral AI';
    
    // Check if API key exists
    if (!apiKey) {
      throw new Error(`API key not found. Please enter your ${providerDisplayName} API key in the form above.`);
    }

    // Check API key format based on provider
    const hasValidFormat = provider === 'mistral' ? apiKey.startsWith('mis_') : apiKey.startsWith('sk-');
    if (!hasValidFormat) {
      const expectedPrefix = provider === 'mistral' ? "'mis_'" : "'sk-'";
      throw new Error(`The API key format appears invalid. ${providerDisplayName} API keys typically start with ${expectedPrefix}.`);
    }

    console.log(`Making API request to ${providerDisplayName} with API key:`, apiKey.substring(0, 10) + "...");
    
    // Prepare API request based on the provider
    let endpoint, body, headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    
    // Common system prompt for all providers
    const systemPrompt = "You are an expert SQL developer. Your task is to convert a natural language query into valid SQL based on the provided database schema. Only return the SQL query without any explanations or markdown.";
    const userPrompt = `Database Schema:\n${schema}\n\nNatural Language Query: ${query}\n\nGenerate a SQL query for this request.`;
    
    if (provider === 'deepseek') {
      endpoint = 'https://api.deepseek.com/v1/chat/completions';
      body = JSON.stringify({
        model: "Text To SQL", // Using the correct model name
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      });
    } 
    else if (provider === 'mistral') {
      // Mistral AI API configuration
      endpoint = 'https://api.mistral.ai/v1/chat/completions';
      body = JSON.stringify({
        model: "mistral-large-latest", // Using Mistral's powerful model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      });
    }
    else {
      // OpenRouter config
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      body = JSON.stringify({
        model: "gpt-4-turbo", // A recommended model from OpenRouter
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body
    });

    // Log response status for debugging
    console.log(`${providerDisplayName} API response status:`, response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error(`${providerDisplayName} API error:`, error);
      
      // Provide more helpful error messages based on status codes
      if (response.status === 401) {
        throw new Error(`Authentication failed. Please check that your ${providerDisplayName} API key is valid.`);
      } else if (response.status === 404 && provider === 'deepseek') {
        throw new Error("Model 'Text To SQL' not found. Please verify the model name or check your DeepSeek account for available models.");
      } else if (response.status === 404 && provider === 'mistral') {
        throw new Error("Model not found. Please verify the model name or check your Mistral AI account for available models.");
      } else if (response.status === 402) {
        throw new Error("Payment required. Your account may need credits or has exceeded token limits.");
      } else {
        throw new Error(error.error?.message || `Failed to generate SQL using ${providerDisplayName}`);
      }
    }

    const data = await response.json();
    console.log("API response data:", data); // Add this to debug the response structure
    
    // Handle case where data.choices is undefined or empty
    if (!data.choices || data.choices.length === 0) {
      throw new Error(`No response received from ${providerDisplayName}. Please try again.`);
    }
    
    // Extract just the SQL from the response
    const sqlContent = data.choices[0].message.content.trim();
    
    // Remove any markdown code blocks if present
    const cleanedSql = sqlContent.replace(/```sql|```/g, '').trim();
    
    return cleanedSql;
  } catch (error) {
    console.error("Error generating SQL:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to generate SQL",
      variant: "destructive",
    });
    throw error;
  }
}
