// Client-side IndexedDB for document storage
const DB_NAME = 'MuseAI';
const DB_VERSION = 1;

export interface Document {
  id: string;
  name: string;
  content: string;
  type: 'pdf' | 'txt' | 'md';
  uploadedAt: number;
  chunks?: DocumentChunk[];
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  index: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

class MuseAIDB {
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('chunks')) {
          const chunkStore = db.createObjectStore('chunks', { keyPath: 'id' });
          chunkStore.createIndex('documentId', 'documentId', { unique: false });
        }
        if (!db.objectStoreNames.contains('conversations')) {
          db.createObjectStore('conversations', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
          messageStore.createIndex('conversationId', 'conversationId', { unique: false });
        }
      };
    });
  }

  async addDocument(doc: Document): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('documents', 'readwrite');
      const request = tx.objectStore('documents').add(doc);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getDocuments(): Promise<Document[]> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('documents', 'readonly');
      const request = tx.objectStore('documents').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDocument(id: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const tx = this.db!.transaction(['documents', 'chunks'], 'readwrite');
        
        const deleteDoc = tx.objectStore('documents').delete(id);
        await new Promise((res, rej) => {
          deleteDoc.onsuccess = () => res(undefined);
          deleteDoc.onerror = () => rej(deleteDoc.error);
        });
        
        const chunkIndex = tx.objectStore('chunks').index('documentId');
        const getChunks = chunkIndex.getAll(id);
        
        getChunks.onsuccess = async () => {
          const chunks = getChunks.result;
          for (const chunk of chunks) {
            await new Promise((res, rej) => {
              const del = tx.objectStore('chunks').delete(chunk.id);
              del.onsuccess = () => res(undefined);
              del.onerror = () => rej(del.error);
            });
          }
          resolve();
        };
        getChunks.onerror = () => reject(getChunks.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async addChunks(chunks: DocumentChunk[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('chunks', 'readwrite');
      let completed = 0;
      
      for (const chunk of chunks) {
        const request = tx.objectStore('chunks').add(chunk);
        request.onsuccess = () => {
          completed++;
          if (completed === chunks.length) resolve();
        };
        request.onerror = () => reject(request.error);
      }
    });
  }

  async searchChunks(query: string, limit = 5): Promise<DocumentChunk[]> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('chunks', 'readonly');
      const request = tx.objectStore('chunks').getAll();
      
      request.onsuccess = () => {
        const chunks = request.result;
        const queryLower = query.toLowerCase();
        const scored = chunks.map((chunk: DocumentChunk) => ({
          chunk,
          score: this.calculateRelevance(chunk.content.toLowerCase(), queryLower)
        }));
        
        const results = scored
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(item => item.chunk);
        
        resolve(results);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private calculateRelevance(content: string, query: string): number {
    const words = query.split(/\s+/);
    let score = 0;
    
    for (const word of words) {
      const count = (content.match(new RegExp(word, 'g')) || []).length;
      score += count;
    }
    
    return score;
  }

  async addConversation(conv: Conversation): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('conversations', 'readwrite');
      const request = tx.objectStore('conversations').add(conv);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getConversations(): Promise<Conversation[]> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('conversations', 'readonly');
      const request = tx.objectStore('conversations').getAll();
      request.onsuccess = () => {
        const convs = request.result;
        resolve(convs.sort((a, b) => b.updatedAt - a.updatedAt));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async addMessage(msg: Message): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('messages', 'readwrite');
      const request = tx.objectStore('messages').add(msg);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('messages', 'readonly');
      const index = tx.objectStore('messages').index('conversationId');
      const request = index.getAll(conversationId);
      request.onsuccess = () => {
        const messages = request.result;
        resolve(messages.sort((a, b) => a.timestamp - b.timestamp));
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new MuseAIDB();
