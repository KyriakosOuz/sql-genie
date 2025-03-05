
import { toast } from "@/hooks/use-toast";

interface GenerateSqlParams {
  query: string;
  schema: string;
}

// Helper function to get the API key and provider
export const getApiConfig = () => {
  // Check which provider is active
  const activeProvider = localStorage.getItem('active_api_provider') || 'deepseek';
  
  // Get the appropriate API key
  const apiKey = localStorage.getItem(
    activeProvider === 'deepseek' ? 'deepseek_api_key' : 'openrouter_api_key'
  );
  
  return { apiKey, provider: activeProvider };
};

export const generateSql = async ({ query, schema }: GenerateSqlParams): Promise<string> => {
  try {
    // Get API configuration
    const { apiKey, provider } = getApiConfig();
    
    // Check if API key exists
    if (!apiKey) {
      throw new Error(`API key not found. Please enter your ${provider === 'deepseek' ? 'DeepSeek' : 'OpenRouter'} API key in the form above.`);
    }

    // Check API key format
    if (!apiKey.startsWith('sk-')) {
      throw new Error(`The API key format appears invalid. ${provider === 'deepseek' ? 'DeepSeek' : 'OpenRouter'} API keys typically start with 'sk-'.`);
    }

    console.log(`Making API request to ${provider === 'deepseek' ? 'DeepSeek' : 'OpenRouter'} with API key:`, apiKey.substring(0, 10) + "...");
    
    // Prepare API request based on the provider
    let endpoint, body;
    
    if (provider === 'deepseek') {
      endpoint = 'https://api.deepseek.com/v1/chat/completions';
      body = JSON.stringify({
        model: "Text To SQL", // Using the correct model name
        messages: [
          {
            role: "system",
            content: "You are an expert SQL developer. Your task is to convert a natural language query into valid SQL based on the provided database schema. Only return the SQL query without any explanations or markdown."
          },
          {
            role: "user",
            content: `Database Schema:\n${schema}\n\nNatural Language Query: ${query}\n\nGenerate a SQL query for this request.`
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      });
    } else {
      // OpenRouter config
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      body = JSON.stringify({
        model: "gpt-4-turbo", // A recommended model from OpenRouter
        messages: [
          {
            role: "system",
            content: "You are an expert SQL developer. Your task is to convert a natural language query into valid SQL based on the provided database schema. Only return the SQL query without any explanations or markdown."
          },
          {
            role: "user",
            content: `Database Schema:\n${schema}\n\nNatural Language Query: ${query}\n\nGenerate a SQL query for this request.`
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body
    });

    // Log response status for debugging
    console.log(`${provider === 'deepseek' ? 'DeepSeek' : 'OpenRouter'} API response status:`, response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error(`${provider === 'deepseek' ? 'DeepSeek' : 'OpenRouter'} API error:`, error);
      
      // Provide more helpful error messages based on status codes
      if (response.status === 401) {
        throw new Error(`Authentication failed. Please check that your ${provider === 'deepseek' ? 'DeepSeek' : 'OpenRouter'} API key is valid.`);
      } else if (response.status === 404 && provider === 'deepseek') {
        throw new Error("Model 'Text To SQL' not found. Please verify the model name or check your DeepSeek account for available models.");
      } else if (response.status === 402) {
        throw new Error("Payment required. Your account may need credits or has exceeded token limits.");
      } else {
        throw new Error(error.error?.message || `Failed to generate SQL using ${provider === 'deepseek' ? 'DeepSeek' : 'OpenRouter'}`);
      }
    }

    const data = await response.json();
    console.log("API response data:", data); // Add this to debug the response structure
    
    // Handle case where data.choices is undefined or empty
    if (!data.choices || data.choices.length === 0) {
      throw new Error(`No response received from ${provider === 'deepseek' ? 'DeepSeek' : 'OpenRouter'}. Please try again.`);
    }
    
    // Extract just the SQL from the response
    // The response format might be different between providers
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
