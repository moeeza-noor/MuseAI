import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatView } from '@/components/ChatView';
import { DocumentsView } from '@/components/DocumentsView';
import { HistoryView } from '@/components/HistoryView';
import { SettingsView } from '@/components/SettingsView';
import { db } from '@/lib/db';

const Index = () => {
  const [activeView, setActiveView] = useState<'chat' | 'documents' | 'history' | 'settings'>('chat');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    db.init().then(() => setIsInitialized(true));
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing MuseAI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      {activeView === 'chat' && <ChatView />}
      {activeView === 'documents' && <DocumentsView />}
      {activeView === 'history' && <HistoryView />}
      {activeView === 'settings' && <SettingsView />}
    </div>
  );
};

export default Index;
