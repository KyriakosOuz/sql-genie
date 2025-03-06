
import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface SqlOptimizationInsightsProps {
  sql: string;
}

// This function analyzes the SQL query and provides optimization suggestions
const analyzeQuery = (sql: string): string[] => {
  const insights: string[] = [];
  
  // Check for missing WHERE clause
  if (sql.toLowerCase().includes('select') && !sql.toLowerCase().includes('where')) {
    insights.push("Consider adding a WHERE clause to filter results and improve query performance.");
  }
  
  // Check for SELECT * usage
  if (sql.toLowerCase().includes('select *')) {
    insights.push("Using 'SELECT *' retrieves all columns. For better performance, specify only the columns you need.");
  }
  
  // Check for potential JOIN optimization opportunities
  if (sql.toLowerCase().includes('join') && !sql.toLowerCase().includes('inner join')) {
    insights.push("Consider using INNER JOIN instead of JOIN if you only need matching records from both tables.");
  }
  
  // Check for ORDER BY without indexing hint
  if (sql.toLowerCase().includes('order by')) {
    insights.push("Ensure columns in ORDER BY have proper indexes to speed up sorting operations.");
  }
  
  // Check for GROUP BY operations which might be expensive
  if (sql.toLowerCase().includes('group by')) {
    insights.push("GROUP BY operations can be expensive. Consider indexing the columns used in the GROUP BY clause.");
  }
  
  // If no specific insights were generated, provide a general recommendation
  if (insights.length === 0) {
    insights.push("No specific optimization suggestions found. Consider adding indexes on frequently queried columns for better performance.");
  }
  
  return insights;
};

const SqlOptimizationInsights: React.FC<SqlOptimizationInsightsProps> = ({ sql }) => {
  const optimizationInsights = analyzeQuery(sql);
  
  if (!sql) {
    return null;
  }
  
  return (
    <Card className="mt-4 border-dashed border-primary/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Query Optimization Insights
        </CardTitle>
        <CardDescription>
          AI-powered suggestions to improve your query performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {optimizationInsights.map((insight, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                <Lightbulb className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm">{insight}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default SqlOptimizationInsights;
