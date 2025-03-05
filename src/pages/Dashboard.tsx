
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Query, UploadedSchema } from '@/lib/supabase';
import { Download, FileCode, Loader2, RefreshCw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [queries, setQueries] = useState<Query[]>([]);
  const [schemas, setSchemas] = useState<UploadedSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('queries');
  
  // Fetch user's queries and schemas
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch queries
      const { data: queriesData, error: queriesError } = await supabase
        .from('queries')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      if (queriesError) throw queriesError;
      setQueries(queriesData as Query[]);

      // Fetch schemas
      const { data: schemasData, error: schemasError } = await supabase
        .from('uploaded_schemas')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      if (schemasError) throw schemasError;
      setSchemas(schemasData as UploadedSchema[]);
    } catch (error) {
      toast({
        title: "Error fetching data",
        description: error instanceof Error ? error.message : "Failed to load your data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchUserData();
      return;
    }
    
    setLoading(true);
    try {
      if (activeTab === 'queries') {
        const { data, error } = await supabase
          .from('queries')
          .select('*')
          .eq('user_id', user!.id)
          .ilike('prompt', `%${searchTerm}%`)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setQueries(data as Query[]);
      } else {
        const { data, error } = await supabase
          .from('uploaded_schemas')
          .select('*')
          .eq('user_id', user!.id)
          .ilike('name', `%${searchTerm}%`)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setSchemas(data as UploadedSchema[]);
      }
    } catch (error) {
      toast({
        title: "Error searching",
        description: error instanceof Error ? error.message : "Failed to search data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = (dataType: 'queries' | 'schemas') => {
    const data = dataType === 'queries' ? queries : schemas;
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataType}_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: `Your ${dataType} have been exported as JSON`,
    });
  };

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  const filteredQueries = searchTerm 
    ? queries.filter(q => 
        q.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.sql_result.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : queries;

  const filteredSchemas = searchTerm
    ? schemas.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.schema_sql.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : schemas;

  return (
    <div className="container py-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              View and manage your saved queries and schemas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={fetchUserData}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={() => exportData(activeTab as 'queries' | 'schemas')}
              disabled={loading}
            >
              <Download className="w-4 h-4 mr-2" />
              Export {activeTab}
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder={`Search your ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        <Tabs defaultValue="queries" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="queries">Queries</TabsTrigger>
            <TabsTrigger value="schemas">Schemas</TabsTrigger>
          </TabsList>

          <TabsContent value="queries" className="space-y-4 pt-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredQueries.length > 0 ? (
              filteredQueries.map((query) => (
                <Card key={query.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="text-lg">{query.prompt}</CardTitle>
                    <CardDescription>
                      {new Date(query.created_at).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="bg-code-background text-code-foreground p-4 rounded-lg overflow-x-auto">
                      <code className="font-mono text-sm">
                        {query.sql_result}
                      </code>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 border rounded-md">
                <FileCode className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No queries found</h3>
                <p className="text-muted-foreground mt-2">
                  {searchTerm ? "Try a different search term" : "You haven't saved any queries yet"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="schemas" className="space-y-4 pt-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredSchemas.length > 0 ? (
              filteredSchemas.map((schema) => (
                <Card key={schema.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="text-lg">{schema.name}</CardTitle>
                    <CardDescription>
                      {new Date(schema.created_at).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="bg-code-background text-code-foreground p-4 rounded-lg overflow-x-auto">
                      <code className="font-mono text-sm">
                        {schema.schema_sql.length > 300 
                          ? schema.schema_sql.substring(0, 300) + '...' 
                          : schema.schema_sql}
                      </code>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 border rounded-md">
                <FileCode className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No schemas found</h3>
                <p className="text-muted-foreground mt-2">
                  {searchTerm ? "Try a different search term" : "You haven't uploaded any schemas yet"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
