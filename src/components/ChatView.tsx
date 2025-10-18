import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoice } from '@/hooks/useVoice';
import { db, Message } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentConversationId] = useState(crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isListening, isSpeaking, startListening, stopListening, speak, stopSpeaking } = useVoice();
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      conversationId: currentConversationId,
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    await db.addMessage(userMessage);
    setInput('');
    setIsProcessing(true);

    try {
      // Search for relevant document chunks
      const chunks = await db.searchChunks(input, 3);
      
      let responseText = '';
      
      if (chunks.length > 0) {
        const context = chunks.map(c => c.content).join('\n\n');
        responseText = `Based on your documents:\n\n${context.slice(0, 500)}...\n\nThis is relevant to your question: "${input}"`;
      } else {
        responseText = `I couldn't find specific information in your documents about "${input}". Please upload relevant documents or rephrase your question.`;
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        conversationId: currentConversationId,
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      await db.addMessage(assistantMessage);
      
      // Speak the response
      speak(responseText);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process your message',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        setInput(text);
        toast({
          title: 'Voice input received',
          description: text,
        });
      });
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="border-b border-border p-4 glass">
        <h2 className="text-xl font-semibold">Chat with Your Documents</h2>
        <p className="text-sm text-muted-foreground">Ask questions about your uploaded content</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-4 max-w-md">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Mic className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Start a Conversation</h3>
              <p className="text-muted-foreground">
                Upload documents and ask questions. I'll search through your knowledge base to provide answers.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-3',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[70%] rounded-lg p-4',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'glass'
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-border p-4 glass">
        <div className="flex gap-2">
          <Button
            size="icon"
            variant={isListening ? 'destructive' : 'outline'}
            onClick={handleVoiceInput}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          
          <Button
            size="icon"
            variant="outline"
            onClick={toggleSpeech}
            disabled={!isSpeaking}
          >
            {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question or use voice input..."
            disabled={isProcessing}
            className="flex-1"
          />
          
          <Button onClick={handleSend} disabled={isProcessing || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
