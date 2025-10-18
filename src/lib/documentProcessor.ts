import { Document, DocumentChunk } from './db';

const CHUNK_SIZE = 500; // characters per chunk
const CHUNK_OVERLAP = 50;

export async function processDocument(file: File): Promise<{ doc: Document; chunks: DocumentChunk[] }> {
  const content = await readFileContent(file);
  const docId = crypto.randomUUID();
  
  const doc: Document = {
    id: docId,
    name: file.name,
    content,
    type: getFileType(file.name),
    uploadedAt: Date.now(),
  };

  const chunks = chunkText(content, docId);
  
  return { doc, chunks };
}

async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result);
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function getFileType(filename: string): 'pdf' | 'txt' | 'md' {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'md' || ext === 'markdown') return 'md';
  if (ext === 'pdf') return 'pdf';
  return 'txt';
}

function chunkText(text: string, documentId: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let index = 0;
  let position = 0;

  while (position < text.length) {
    const end = Math.min(position + CHUNK_SIZE, text.length);
    const chunkContent = text.slice(position, end);
    
    chunks.push({
      id: crypto.randomUUID(),
      documentId,
      content: chunkContent,
      index: index++,
    });

    position = end - CHUNK_OVERLAP;
    if (position >= text.length) break;
  }

  return chunks;
}

export function generateSummary(text: string, maxLength = 200): string {
  // Simple extractive summary - takes first meaningful sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  let summary = '';
  
  for (const sentence of sentences) {
    if (summary.length + sentence.length > maxLength) break;
    summary += sentence;
  }
  
  return summary.trim() || text.slice(0, maxLength) + '...';
}
