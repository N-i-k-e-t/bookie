import { pipeline, env } from '@huggingface/transformers';
import type { AIWorkerRequest } from '../types';

// Configure environment
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = navigator.hardwareConcurrency || 4;

let generator: any = null;
let currentModel: string = '';

self.addEventListener('message', async (event: MessageEvent<AIWorkerRequest>) => {
  const data = event.data;

  try {
    if (data.type === 'load') {
      const modelName = data.model || 'onnx-community/Qwen2.5-0.5B-Instruct';

      if (generator && currentModel === modelName) {
        self.postMessage({ type: 'ready' });
        return;
      }

      // Update progress callback
      const progressCallback = (progressData: any) => {
        if (progressData.status === 'progress') {
          self.postMessage({
            type: 'progress',
            progress: progressData.progress || 0,
            message: `Downloading: ${progressData.file || ''} (${Math.round(progressData.progress || 0)}%)`,
          });
        } else if (progressData.status === 'ready') {
          self.postMessage({
            type: 'progress',
            progress: 100,
            message: `Warming up model...`,
          });
        }
      };

      // Determine device capability
      let device = 'wasm';
      try {
        if (navigator.gpu) {
          const adapter = await navigator.gpu.requestAdapter();
          if (adapter) {
            device = 'webgpu';
          }
        }
      } catch (e) {
        console.warn('WebGPU not supported/accessible, falling back to WASM:', e);
      }

      console.log(`Initializing text generation model: ${modelName} on ${device}`);

      generator = await pipeline('text-generation', modelName, {
        device: device as any,
        dtype: 'q4', // Using 4-bit quantization for performance/memory
        progress_callback: progressCallback,
      });

      currentModel = modelName;
      self.postMessage({ type: 'ready' });

    } else if (data.type === 'generate') {
      if (!generator) {
        throw new Error('AI Model is not loaded. Call load first.');
      }

      const prompt = data.prompt;
      const maxTokens = data.maxTokens || 128;
      const temperature = data.temperature || 0.7;

      console.log(`Generating text with prompt: "${prompt.slice(0, 100)}..."`);

      // We pass the prompt as messages format for Chat templates if needed
      // Or as raw string. Let's support both formats.
      const messages = [
        { role: 'user', content: prompt }
      ];

      // Clean up inputs and configure options
      const response = await generator(messages, {
        max_new_tokens: maxTokens,
        temperature: temperature,
        do_sample: temperature > 0,
        top_k: 50,
      });

      const responseText = response[0].generated_text.at(-1).content;
      console.log('Generation completed successfully.');

      self.postMessage({
        type: 'generated',
        text: responseText,
      });

    } else if (data.type === 'unload') {
      generator = null;
      currentModel = '';
      console.log('Model unloaded.');
    }
  } catch (error: any) {
    console.error('AI Worker error:', error);
    self.postMessage({
      type: 'error',
      error: error.message || 'Unknown error occurred in worker',
    });
  }
});
