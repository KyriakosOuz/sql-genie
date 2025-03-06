
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Query, UploadedSchema } from '@/lib/supabase';
import { Download, Loader2, RefreshCw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QueriesTab from '@/components/QueriesTab';
import SchemasTab from '@/components/SchemasTab';

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

          <TabsContent value="queries">
            <QueriesTab 
              queries={queries} 
              loading={loading} 
              searchTerm={searchTerm} 
            />
          </TabsContent>

          <TabsContent value="schemas">
            <SchemasTab 
              schemas={schemas} 
              loading={loading} 
              searchTerm={searchTerm} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
