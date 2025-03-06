
import React from 'react';
import { FileCode, Loader2 } from 'lucide-react';
import { UploadedSchema } from '@/lib/supabase';
import SchemaViewer from './SchemaViewer';

interface SchemasTabProps {
  schemas: UploadedSchema[];
  loading: boolean;
  searchTerm: string;
}

const SchemasTab: React.FC<SchemasTabProps> = ({ schemas, loading, searchTerm }) => {
  // Filter schemas based on search term
  const filteredSchemas = searchTerm
    ? schemas.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.schema_sql.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : schemas;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (filteredSchemas.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
        <FileCode className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No schemas found</h3>
        <p className="text-muted-foreground mt-2">
          {searchTerm ? "Try a different search term" : "You haven't uploaded any schemas yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      {filteredSchemas.map((schema) => (
        <SchemaViewer key={schema.id} schema={schema} />
      ))}
    </div>
  );
};

export default SchemasTab;
