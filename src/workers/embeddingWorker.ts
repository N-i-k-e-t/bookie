import { pipeline, env } from '@huggingface/transformers';
import type { EmbeddingWorkerRequest } from '../types';

// Configure environment
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 2;

let extractor: any = null;

self.addEventListener('message', async (event: MessageEvent<EmbeddingWorkerRequest>) => {
  const data = event.data;

  try {
    if (data.type === 'load') {
      if (extractor) {
        self.postMessage({ type: 'ready' });
        return;
      }

      console.log('Initializing embedding model (all-MiniLM-L6-v2)...');
      extractor = await pipeline('feature-extraction', 'onnx-community/all-MiniLM-L6-v2', {
        device: 'wasm', // Embeddings are small, WASM is perfectly fast enough
      });
      console.log('Embedding model ready.');
      self.postMessage({ type: 'ready' });

    } else if (data.type === 'embed') {
      if (!extractor) {
        throw new Error('Embedding model is not loaded.');
      }

      const text = data.text;
      console.log(`Computing embedding for: "${text.slice(0, 100)}..."`);

      const output = await extractor(text, {
        pooling: 'mean',
        normalize: true,
      });

      const vector = Array.from(output.data) as number[];
      self.postMessage({
        type: 'embedding',
        vector,
      });

    } else if (data.type === 'search') {
      const { query, books, topK } = data;
      console.log(`Performing cosine similarity search across ${books.length} books...`);

      const scored = books.map((book) => {
        const similarity = cosineSimilarity(query, book.vector);
        return { id: book.id, score: similarity };
      });

      // Sort by descending score
      scored.sort((a, b) => b.score - a.score);
      const matches = scored.slice(0, topK);

      self.postMessage({
        type: 'results',
        matches,
      });
    }
  } catch (error: any) {
    console.error('Embedding Worker error:', error);
    self.postMessage({
      type: 'error',
      error: error.message || 'Unknown error in embedding worker',
    });
  }
});

// Helper: Cosine Similarity
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}
