
import React from 'react';
import { Send } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface QueryInputProps {
  onQuerySubmit: (query: string) => void;
}

const QueryInput = ({ onQuerySubmit }: QueryInputProps) => {
  const [query, setQuery] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onQuerySubmit(query.trim());
    }
  };

  return (
    <Card className="p-6 animate-enter">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="query" className="text-sm font-medium">
            Natural Language Query
          </label>
          <Textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Example: Find all employees with salary greater than 1000"
            className="min-h-[120px] resize-none font-mono"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Generate SQL
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default QueryInput;
