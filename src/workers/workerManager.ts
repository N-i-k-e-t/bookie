import type {
  AIWorkerRequest,
  AIWorkerResponse,
  EmbeddingWorkerRequest,
  EmbeddingWorkerResponse,
} from '../types';

let aiWorker: Worker | null = null;
let embeddingWorker: Worker | null = null;

let aiCallbacks: { resolve: (val: string) => void; reject: (err: any) => void }[] = [];
let aiProgressCallback: ((progress: number, message: string) => void) | null = null;

let embeddingCallbacks: { resolve: (val: number[]) => void; reject: (err: any) => void }[] = [];

// ─── Initialize Workers ──────────────────────────────────────────────

export function getAIWorker(onProgress?: (progress: number, message: string) => void): Worker {
  if (onProgress) {
    aiProgressCallback = onProgress;
  }

  if (!aiWorker) {
    console.log('Spawning AI Worker...');
    aiWorker = new Worker(new URL('./aiWorker.ts', import.meta.url), { type: 'module' });

    aiWorker.addEventListener('message', (event: MessageEvent<AIWorkerResponse>) => {
      const response = event.data;

      if (response.type === 'progress') {
        if (aiProgressCallback) {
          aiProgressCallback(response.progress, response.message);
        }
      } else if (response.type === 'ready') {
        if (aiProgressCallback) {
          aiProgressCallback(100, 'Model is ready');
        }
        const cb = aiCallbacks.shift();
        if (cb) cb.resolve('ready');
      } else if (response.type === 'generated') {
        const cb = aiCallbacks.shift();
        if (cb) cb.resolve(response.text);
      } else if (response.type === 'error') {
        const cb = aiCallbacks.shift();
        if (cb) cb.reject(new Error(response.error));
      }
    });
  }

  return aiWorker;
}

export function getEmbeddingWorker(): Worker {
  if (!embeddingWorker) {
    console.log('Spawning Embedding Worker...');
    embeddingWorker = new Worker(new URL('./embeddingWorker.ts', import.meta.url), {
      type: 'module',
    });

    embeddingWorker.addEventListener('message', (event: MessageEvent<EmbeddingWorkerResponse>) => {
      const response = event.data;

      if (response.type === 'ready') {
        const cb = embeddingCallbacks.shift();
        if (cb) cb.resolve([]); // Dummy return for ready status
      } else if (response.type === 'embedding') {
        const cb = embeddingCallbacks.shift();
        if (cb) cb.resolve(response.vector);
      } else if (response.type === 'error') {
        const cb = embeddingCallbacks.shift();
        if (cb) cb.reject(new Error(response.error));
      }
    });
  }

  return embeddingWorker;
}

// ─── AI Worker Calls ─────────────────────────────────────────────────

export function loadAIModel(
  modelName: string,
  onProgress?: (progress: number, message: string) => void
): Promise<string> {
  const worker = getAIWorker(onProgress);
  return new Promise((resolve, reject) => {
    aiCallbacks.push({ resolve, reject });
    worker.postMessage({ type: 'load', model: modelName });
  });
}

export function generateText(prompt: string, maxTokens = 128, temp = 0.7): Promise<string> {
  const worker = getAIWorker();
  return new Promise((resolve, reject) => {
    aiCallbacks.push({ resolve, reject });
    worker.postMessage({
      type: 'generate',
      prompt,
      maxTokens,
      temperature: temp,
    });
  });
}

// ─── Embedding Worker Calls ──────────────────────────────────────────

export function loadEmbeddingModel(): Promise<number[]> {
  const worker = getEmbeddingWorker();
  return new Promise((resolve, reject) => {
    embeddingCallbacks.push({ resolve, reject });
    worker.postMessage({ type: 'load' });
  });
}

export function getEmbedding(text: string): Promise<number[]> {
  const worker = getEmbeddingWorker();
  return new Promise((resolve, reject) => {
    embeddingCallbacks.push({ resolve, reject });
    worker.postMessage({ type: 'embed', text });
  });
}

// ─── Unload Workers ──────────────────────────────────────────────────

export function terminateWorkers() {
  if (aiWorker) {
    aiWorker.terminate();
    aiWorker = null;
  }
  if (embeddingWorker) {
    embeddingWorker.terminate();
    embeddingWorker = null;
  }
  aiCallbacks = [];
  embeddingCallbacks = [];
}
