// ─── App Navigation ───────────────────────────────────────────────
export type AppStep =
  | 'landing'
  | 'name'
  | 'photo'
  | 'conversation'
  | 'thinking'
  | 'reveal';

// ─── Personality System ───────────────────────────────────────────
export const PERSONALITY_DIMENSIONS = [
  'curiosity',
  'creativity',
  'leadership',
  'discipline',
  'learning',
  'confidence',
  'analyticalThinking',
  'emotionalIntelligence',
  'communication',
  'entrepreneurship',
  'spirituality',
  'productivity',
  'riskTaking',
  'mindfulness',
  'adventure',
  'finance',
  'relationships',
  'careerGrowth',
  'selfAwareness',
  'decisionMaking',
] as const;

export type PersonalityDimension = (typeof PERSONALITY_DIMENSIONS)[number];

export type PersonalityProfile = Record<PersonalityDimension, number>;

export function createEmptyProfile(): PersonalityProfile {
  return Object.fromEntries(
    PERSONALITY_DIMENSIONS.map((d) => [d, 0.5])
  ) as PersonalityProfile;
}

// ─── Conversation ─────────────────────────────────────────────────
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type ConversationCategory =
  | 'dreams'
  | 'ambitions'
  | 'career'
  | 'creativity'
  | 'money'
  | 'relationships'
  | 'curiosity'
  | 'learning'
  | 'adventure'
  | 'discipline'
  | 'emotionalResilience'
  | 'happiness'
  | 'leadership'
  | 'purpose'
  | 'confidence'
  | 'habits'
  | 'personalGrowth'
  | 'decisionMaking'
  | 'values'
  | 'lifestyle';

// ─── Face Analysis ────────────────────────────────────────────────
export interface FaceAnalysisResult {
  detected: boolean;
  expressionSummary: string;
  blendshapes: Record<string, number>;
  dominantEmotion: string;
  confidenceScore: number;
}

// ─── Book Data ────────────────────────────────────────────────────
export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  latestEdition?: string;
  publisher?: string;
  isbn?: string;
  publicationYear: number;
  coverImage?: string;
  description: string;
  genre: string;
  topics: string[];
  keywords: string[];
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  estimatedReadingTime: string;
  rating?: number;
  /**
   * The book's single strongest recommendation reason — the reader intent it
   * best serves (e.g. "Build Better Habits", "Develop Financial Wisdom").
   * The recommendation engine can match users to this before falling back to
   * genre or popularity. Optional; secondary intents live in `topics`/`keywords`.
   */
  primaryIntent?: string;
  personalityTags: PersonalityDimension[];
  skillsDeveloped: string[];
  emotionalTone: string;
  targetAudience: string[];
  language: string;
  similarBooks: string[];
  embeddingVector?: number[];
}

// ─── Recommendation ───────────────────────────────────────────────
export interface Recommendation {
  book: Book;
  matchScore: number;
  explanation: string;
  personalityInsights: string[];
  keyLessons: string[];
  whyItMatches: string;
}

// ─── AI Model Status ──────────────────────────────────────────────
export type ModelStatus =
  | 'idle'
  | 'downloading'
  | 'loading'
  | 'ready'
  | 'error';

export interface ModelProgress {
  status: ModelStatus;
  progress: number; // 0-100
  message: string;
}

// ─── Worker Messages ──────────────────────────────────────────────
export type AIWorkerRequest =
  | { type: 'load'; model: string }
  | { type: 'generate'; prompt: string; maxTokens?: number; temperature?: number }
  | { type: 'unload' };

export type AIWorkerResponse =
  | { type: 'progress'; progress: number; message: string }
  | { type: 'ready' }
  | { type: 'generated'; text: string }
  | { type: 'error'; error: string }
  | { type: 'token'; token: string };

export type EmbeddingWorkerRequest =
  | { type: 'load' }
  | { type: 'embed'; text: string }
  | { type: 'search'; query: number[]; books: { id: string; vector: number[] }[]; topK: number };

export type EmbeddingWorkerResponse =
  | { type: 'ready' }
  | { type: 'embedding'; vector: number[] }
  | { type: 'results'; matches: { id: string; score: number }[] }
  | { type: 'error'; error: string };
