
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface SchemaUploaderProps {
  onSchemaUpload: (schema: string) => void;
}

const SchemaUploader = ({ onSchemaUpload }: SchemaUploaderProps) => {
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          onSchemaUpload(text);
          toast({
            title: "Schema uploaded successfully",
            description: `File: ${file.name}`,
          });
        }
      };
      reader.readAsText(file);
    }
  }, [onSchemaUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.sql', '.txt'],
      'application/json': ['.json'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  return (
    <Card className="p-6 animate-enter">
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
      </div>
    </Card>
  );
};

export default SchemaUploader;
