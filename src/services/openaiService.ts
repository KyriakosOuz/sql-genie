
import { toast } from "@/hooks/use-toast";

interface GenerateSqlParams {
  query: string;
  schema: string;
}

export const generateSql = async ({ query, schema }: GenerateSqlParams): Promise<string> => {
  try {
    // This would typically call an API endpoint
    // For demo purposes, we're using a direct fetch to OpenAI API
    const apiKey = localStorage.getItem('openai_api_key');
    
    if (!apiKey) {
      throw new Error("API key not found. Please enter your OpenAI API key.");
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
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
