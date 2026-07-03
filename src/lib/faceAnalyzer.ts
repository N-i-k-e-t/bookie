import type { FaceAnalysisResult } from '../types';

// ─── MediaPipe Face Analysis ─────────────────────────────────────────
// Uses MediaPipe FaceLandmarker to analyze facial expressions from a photo.
// All processing is on-device. The image is never transmitted anywhere.

let faceLandmarker: any = null;
let isInitialized = false;

export async function initializeFaceAnalyzer(): Promise<boolean> {
  try {
    const vision = await import('@mediapipe/tasks-vision');
    const { FaceLandmarker, FilesetResolver } = vision;

    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      outputFaceBlendshapes: true,
      numFaces: 1,
    });

    isInitialized = true;
    return true;
  } catch (error) {
    console.warn('Face analyzer initialization failed:', error);
    return false;
  }
}

export async function analyzeFace(imageElement: HTMLImageElement): Promise<FaceAnalysisResult> {
  if (!isInitialized || !faceLandmarker) {
    // Try to initialize on-demand
    const success = await initializeFaceAnalyzer();
    if (!success) {
      return createNoFaceResult();
    }
  }

  try {
    const results = faceLandmarker.detect(imageElement);

    if (!results.faceBlendshapes || results.faceBlendshapes.length === 0) {
      return createNoFaceResult();
    }

    // Extract blendshapes
    const blendshapeCategories = results.faceBlendshapes[0].categories;
    const blendshapes: Record<string, number> = {};

    for (const bs of blendshapeCategories) {
      blendshapes[bs.categoryName] = bs.score;
    }

    // Determine dominant emotion from blendshapes
    const dominantEmotion = detectEmotion(blendshapes);
    const expressionSummary = generateExpressionSummary(dominantEmotion);

    return {
      detected: true,
      expressionSummary,
      blendshapes,
      dominantEmotion,
      confidenceScore: calculateConfidence(blendshapes),
    };
  } catch (error) {
    console.warn('Face analysis failed:', error);
    return createNoFaceResult();
  }
}

// ─── Emotion Detection ───────────────────────────────────────────────

function detectEmotion(blendshapes: Record<string, number>): string {
  const smileScore =
    ((blendshapes['mouthSmileLeft'] || 0) + (blendshapes['mouthSmileRight'] || 0)) / 2;
  const browRaise = blendshapes['browInnerUp'] || 0;
  const eyeWide =
    ((blendshapes['eyeWideLeft'] || 0) + (blendshapes['eyeWideRight'] || 0)) / 2;
  const browDown =
    ((blendshapes['browDownLeft'] || 0) + (blendshapes['browDownRight'] || 0)) / 2;
  const jawOpen = blendshapes['jawOpen'] || 0;

  // Simple emotion detection heuristics
  if (smileScore > 0.4) return 'happy';
  if (eyeWide > 0.3 && jawOpen > 0.2) return 'surprise';
  if (browDown > 0.3) return 'thoughtful';
  if (browRaise > 0.3) return 'curious';
  return 'neutral';
}

function generateExpressionSummary(
  emotion: string
): string {
  const summaries: Record<string, string> = {
    happy: 'Your warm smile suggests an optimistic and approachable personality.',
    surprise: 'Your expression shows openness and receptivity to new experiences.',
    thoughtful: 'Your focused expression suggests deep thinking and contemplation.',
    curious: 'Your raised brows hint at a naturally curious and engaged mindset.',
    neutral: 'Your calm expression suggests composure and inner stability.',
  };

  return summaries[emotion] || summaries.neutral;
}

function calculateConfidence(blendshapes: Record<string, number>): number {
  // Average of key blendshape scores as a proxy for detection quality
  const keyShapes = [
    'mouthSmileLeft',
    'mouthSmileRight',
    'browInnerUp',
    'eyeWideLeft',
    'eyeWideRight',
  ];

  let total = 0;
  let count = 0;
  for (const key of keyShapes) {
    if (blendshapes[key] !== undefined) {
      total += blendshapes[key];
      count++;
    }
  }

  return count > 0 ? Math.min(1, (total / count) * 3) : 0;
}

function createNoFaceResult(): FaceAnalysisResult {
  return {
    detected: false,
    expressionSummary: '',
    blendshapes: {},
    dominantEmotion: 'unknown',
    confidenceScore: 0,
  };
}

export function isFaceAnalyzerReady(): boolean {
  return isInitialized;
}
