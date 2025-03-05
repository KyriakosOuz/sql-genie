
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Save, X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface SchemaUploaderProps {
  onSchemaUpload: (schema: string, schemaName?: string) => void;
  initialSchema?: string;
}

const SchemaUploader = ({ onSchemaUpload, initialSchema = '' }: SchemaUploaderProps) => {
  const { toast } = useToast();
  const [schemaText, setSchemaText] = useState(initialSchema);
  const [showSchemaDialog, setShowSchemaDialog] = useState(false);
  const [fileName, setFileName] = useState('');
  const [schemaName, setSchemaName] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileName(file.name);
      setSchemaName(file.name.split('.')[0] || 'Uploaded Schema');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setSchemaText(text);
          setShowSchemaDialog(true);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.sql', '.txt'],
      'application/json': ['.json'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const handleSchemaSubmit = () => {
    if (schemaText.trim()) {
      onSchemaUpload(schemaText, schemaName || 'Uploaded Schema');
      setShowSchemaDialog(false);
      
      toast({
        title: "Schema uploaded successfully",
        description: schemaName ? `Schema: ${schemaName}` : undefined,
      });
    }
  };

  const hasSchema = initialSchema || schemaText;

  return (
    <>
      <Card className="p-6 animate-enter">
        {hasSchema ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Database Schema</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSchemaDialog(true)}
              >
                Edit Schema
              </Button>
            </div>
            <div className="bg-code-background text-code-foreground p-4 rounded-lg overflow-x-auto max-h-[300px] overflow-y-auto">
              <pre className="font-mono text-sm whitespace-pre-wrap">
                {schemaText || initialSchema}
              </pre>
            </div>
          </div>
        ) : (
          <div 
            {...getRootProps()} 
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200 ease-in-out
              ${isDragActive ? 'border-primary bg-secondary/50' : 'border-border hover:border-primary/50'}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop your schema file here' : 'Upload your database schema'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Drag & drop your .sql, .json, or .csv file here, or click to select
            </p>
            <Button variant="secondary" className="mt-2">
              Select File
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Or <button 
                    type="button" 
                    className="text-primary hover:underline focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSchemaDialog(true);
                    }}
                  >
                    enter schema manually
                  </button>
            </p>
          </div>
        )}
      </Card>

      <Dialog open={showSchemaDialog} onOpenChange={setShowSchemaDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enter Database Schema</DialogTitle>
            <DialogDescription>
              Paste your SQL schema or write it directly in the editor below
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="schema-name" className="text-sm font-medium">Schema Name</label>
              <Input
                id="schema-name"
                placeholder="My Database Schema"
                value={schemaName}
                onChange={(e) => setSchemaName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="schema-content" className="text-sm font-medium">Schema Content</label>
              <Textarea
                id="schema-content"
                className="font-mono min-h-[300px]"
                placeholder="CREATE TABLE users (...);"
                value={schemaText}
                onChange={(e) => setSchemaText(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setShowSchemaDialog(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSchemaSubmit}
              disabled={!schemaText.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Schema
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SchemaUploader;
