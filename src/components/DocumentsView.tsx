import { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db, Document } from '@/lib/db';
import { processDocument, generateSummary } from '@/lib/documentProcessor';
import { useToast } from '@/hooks/use-toast';

export function DocumentsView() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const docs = await db.getDocuments();
    setDocuments(docs);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const { doc, chunks } = await processDocument(file);
        await db.addDocument(doc);
        await db.addChunks(chunks);
      }

      await loadDocuments();
      
      toast({
        title: 'Success',
        description: `${files.length} document(s) uploaded and processed`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload documents',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    await db.deleteDocument(id);
    await loadDocuments();
    
    toast({
      title: 'Deleted',
      description: 'Document removed successfully',
    });
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Documents</h2>
            <p className="text-muted-foreground">Upload and manage your knowledge base</p>
          </div>
          
          <label>
            <input
              type="file"
              accept=".txt,.md,.pdf"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <Button disabled={isUploading} asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </span>
            </Button>
          </label>
        </div>

        {documents.length === 0 ? (
          <Card className="glass">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Upload your first document to start building your knowledge base. Supports TXT, MD, and PDF files.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {documents.map((doc) => (
              <Card key={doc.id} className="glass hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{doc.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Summary:</span>
                    </div>
                    <p className="text-sm line-clamp-3">
                      {generateSummary(doc.content)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                      <span>{doc.type.toUpperCase()}</span>
                      <span>•</span>
                      <span>{(doc.content.length / 1000).toFixed(1)}K chars</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
