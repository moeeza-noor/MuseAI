import { useState, useEffect } from 'react';
import { Clock, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db, Conversation, Message } from '@/lib/db';

export function HistoryView() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv);
    }
  }, [selectedConv]);

  const loadConversations = async () => {
    const convs = await db.getConversations();
    setConversations(convs);
  };

  const loadMessages = async (convId: string) => {
    const msgs = await db.getMessages(convId);
    setMessages(msgs);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-80 border-r border-border overflow-y-auto p-4 space-y-2">
        <h3 className="font-semibold mb-4">Conversation History</h3>
        
        {conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No conversations yet
          </p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedConv === conv.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium truncate">{conv.title}</span>
              </div>
              <div className="flex items-center gap-1 text-xs opacity-70">
                <Clock className="w-3 h-3" />
                {new Date(conv.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {selectedConv ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <Card key={msg.id} className="glass">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className={msg.role === 'user' ? 'text-primary' : 'text-secondary'}>
                      {msg.role === 'user' ? 'You' : 'MuseAI'}
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to view history</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
