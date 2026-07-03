import { create } from 'zustand';
import {
  type AppStep,
  type ConversationMessage,
  type PersonalityProfile,
  type FaceAnalysisResult,
  type Recommendation,
  type ModelProgress,
  createEmptyProfile,
} from '../types';

interface AppState {
  // ─── Navigation ─────────────────────────────────────────────
  currentStep: AppStep;
  setStep: (step: AppStep) => void;

  // ─── User Info ──────────────────────────────────────────────
  userName: string;
  setUserName: (name: string) => void;

  // ─── Face Analysis ──────────────────────────────────────────
  faceAnalysis: FaceAnalysisResult | null;
  setFaceAnalysis: (result: FaceAnalysisResult | null) => void;
  photoSkipped: boolean;
  setPhotoSkipped: (skipped: boolean) => void;

  // ─── Conversation ───────────────────────────────────────────
  messages: ConversationMessage[];
  addMessage: (message: ConversationMessage) => void;
  conversationComplete: boolean;
  setConversationComplete: (complete: boolean) => void;

  // ─── Personality ────────────────────────────────────────────
  personalityProfile: PersonalityProfile;
  setPersonalityProfile: (profile: PersonalityProfile) => void;
  updateDimension: (dimension: keyof PersonalityProfile, value: number) => void;

  // ─── Recommendation ─────────────────────────────────────────
  recommendation: Recommendation | null;
  setRecommendation: (rec: Recommendation) => void;

  // ─── AI Model Status ────────────────────────────────────────
  slmProgress: ModelProgress;
  setSlmProgress: (progress: ModelProgress) => void;
  embeddingProgress: ModelProgress;
  setEmbeddingProgress: (progress: ModelProgress) => void;

  // ─── Utilities ──────────────────────────────────────────────
  reset: () => void;
}

const initialState = {
  currentStep: 'landing' as AppStep,
  userName: '',
  faceAnalysis: null,
  photoSkipped: false,
  messages: [],
  conversationComplete: false,
  personalityProfile: createEmptyProfile(),
  recommendation: null,
  slmProgress: { status: 'idle' as const, progress: 0, message: '' },
  embeddingProgress: { status: 'idle' as const, progress: 0, message: '' },
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  setUserName: (name) => set({ userName: name }),

  setFaceAnalysis: (result) => set({ faceAnalysis: result }),
  setPhotoSkipped: (skipped) => set({ photoSkipped: skipped }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setConversationComplete: (complete) =>
    set({ conversationComplete: complete }),

  setPersonalityProfile: (profile) =>
    set({ personalityProfile: profile }),
  updateDimension: (dimension, value) =>
    set((state) => ({
      personalityProfile: {
        ...state.personalityProfile,
        [dimension]: Math.max(0, Math.min(1, value)),
      },
    })),

  setRecommendation: (rec) => set({ recommendation: rec }),

  setSlmProgress: (progress) => set({ slmProgress: progress }),
  setEmbeddingProgress: (progress) => set({ embeddingProgress: progress }),

  reset: () => set(initialState),
}));
