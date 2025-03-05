
import { toast } from "@/hooks/use-toast";

interface GenerateSqlParams {
  query: string;
  schema: string;
}

export const generateSql = async ({ query, schema }: GenerateSqlParams): Promise<string> => {
  try {
    // Get DeepSeek API key from localStorage
    const apiKey = localStorage.getItem('deepseek_api_key');
    
    if (!apiKey) {
      throw new Error("API key not found. Please enter your DeepSeek API key.");
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", // Changed to deepseek-chat model
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
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to generate SQL");
    }

    const data = await response.json();
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
