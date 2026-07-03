import type { PersonalityProfile, PersonalityDimension, FaceAnalysisResult, ConversationMessage } from '../types';
import { PERSONALITY_DIMENSIONS, createEmptyProfile } from '../types';
import { extractPersonalitySignals } from './conversationEngine';

// ─── Build Profile from Conversation ─────────────────────────────────

export function buildPersonalityProfile(
  messages: ConversationMessage[],
  faceAnalysis: FaceAnalysisResult | null
): PersonalityProfile {
  const profile = createEmptyProfile();
  const signalCounts: Record<PersonalityDimension, number> = {} as Record<PersonalityDimension, number>;

  // Initialize counts
  for (const dim of PERSONALITY_DIMENSIONS) {
    signalCounts[dim] = 0;
  }

  // Extract signals from each user message
  for (const message of messages) {
    if (message.role !== 'user') continue;

    const signals = extractPersonalitySignals(message.content);
    for (const [dim, value] of Object.entries(signals)) {
      const dimension = dim as PersonalityDimension;
      profile[dimension] = (profile[dimension] * signalCounts[dimension] + value) / (signalCounts[dimension] + 1);
      signalCounts[dimension]++;
    }
  }

  // Integrate face analysis cues (minor weight)
  if (faceAnalysis && faceAnalysis.detected) {
    applyFaceCues(profile, faceAnalysis);
  }

  // Normalize all values to [0, 1]
  for (const dim of PERSONALITY_DIMENSIONS) {
    profile[dim] = Math.max(0, Math.min(1, profile[dim]));
  }

  return profile;
}

// ─── Face Cue Integration ────────────────────────────────────────────

function applyFaceCues(profile: PersonalityProfile, face: FaceAnalysisResult): void {
  const weight = 0.1; // Face cues are minor signals

  const blendshapes = face.blendshapes;

  // Smile → higher confidence, relationships, happiness indicators
  const smileScore = (blendshapes['mouthSmileLeft'] || 0 + blendshapes['mouthSmileRight'] || 0) / 2;
  if (smileScore > 0.3) {
    profile.confidence += weight * smileScore;
    profile.relationships += weight * smileScore * 0.5;
    profile.emotionalIntelligence += weight * smileScore * 0.3;
  }

  // Brow raise → curiosity, openness
  const browRaise = (blendshapes['browInnerUp'] || 0);
  if (browRaise > 0.2) {
    profile.curiosity += weight * browRaise;
    profile.learning += weight * browRaise * 0.5;
  }

  // Overall expression energy
  switch (face.dominantEmotion) {
    case 'happy':
      profile.confidence += weight;
      profile.adventure += weight * 0.5;
      break;
    case 'neutral':
      profile.mindfulness += weight;
      profile.analyticalThinking += weight * 0.5;
      break;
    case 'surprise':
      profile.curiosity += weight;
      profile.riskTaking += weight * 0.5;
      break;
    case 'thoughtful':
      profile.analyticalThinking += weight;
      profile.selfAwareness += weight * 0.5;
      break;
  }
}

// ─── Profile to Text Summary ─────────────────────────────────────────

export function profileToText(profile: PersonalityProfile): string {
  // Get top 5 strongest dimensions
  const sorted = PERSONALITY_DIMENSIONS
    .map((dim) => ({ dim, score: profile[dim] }))
    .sort((a, b) => b.score - a.score);

  const topTraits = sorted.slice(0, 5);
  const traitDescriptions: Record<PersonalityDimension, string> = {
    curiosity: 'deeply curious and eager to explore new ideas',
    creativity: 'creative and imaginative',
    leadership: 'a natural leader who inspires others',
    discipline: 'disciplined and focused on building strong habits',
    learning: 'a passionate lifelong learner',
    confidence: 'building inner strength and self-belief',
    analyticalThinking: 'analytical and loves solving complex problems',
    emotionalIntelligence: 'emotionally aware and empathetic',
    communication: 'values clear and meaningful communication',
    entrepreneurship: 'entrepreneurial with a builder mindset',
    spirituality: 'seeking deeper meaning and purpose',
    productivity: 'focused on maximizing productivity and efficiency',
    riskTaking: 'willing to take bold risks for growth',
    mindfulness: 'values mindfulness and inner peace',
    adventure: 'adventurous and drawn to new experiences',
    finance: 'focused on financial growth and intelligence',
    relationships: 'values deep and meaningful relationships',
    careerGrowth: 'ambitious about career advancement',
    selfAwareness: 'highly self-aware and introspective',
    decisionMaking: 'decisive and values clear thinking',
  };

  const descriptions = topTraits.map((t) => traitDescriptions[t.dim]);
  return `This person is ${descriptions[0]}, ${descriptions[1]}, and ${descriptions[2]}. They also show signs of being ${descriptions[3]} and ${descriptions[4]}.`;
}

// ─── Generate Personality Insights ───────────────────────────────────

export function generateInsights(profile: PersonalityProfile): string[] {
  const sorted = PERSONALITY_DIMENSIONS
    .map((dim) => ({ dim, score: profile[dim] }))
    .sort((a, b) => b.score - a.score);

  const insights: string[] = [];
  const top3 = sorted.slice(0, 3);

  const insightTemplates: Record<PersonalityDimension, string[]> = {
    curiosity: ["Your curiosity is your superpower — you're wired to explore the unknown.", "You have an explorer's mind that thrives on discovery."],
    creativity: ["You see the world through a creative lens that most people miss.", "Your imagination is one of your greatest assets."],
    leadership: ["You naturally gravitate toward guiding and inspiring others.", "People look to you for direction, even when you don't realize it."],
    discipline: ["Your ability to commit and stay consistent sets you apart.", "You understand that great things are built through daily dedication."],
    learning: ["You're a natural student of life — always growing, always evolving.", "Knowledge isn't just information to you — it's transformation."],
    confidence: ["You're on a journey of building unshakeable self-belief.", "Your desire for confidence shows real self-awareness."],
    analyticalThinking: ["You think deeply and love unraveling complexity.", "Your analytical mind helps you see patterns others miss."],
    emotionalIntelligence: ["You understand people on a level that most don't.", "Emotional depth is one of your defining qualities."],
    communication: ["You value authentic expression and meaningful dialogue.", "Clear communication is something you deeply care about."],
    entrepreneurship: ["You have the mind of a builder — always creating, always iterating.", "Your entrepreneurial spirit is looking for the next challenge to solve."],
    spirituality: ["You're drawn to the deeper questions that give life meaning.", "Your spiritual awareness adds a beautiful dimension to who you are."],
    productivity: ["You're driven to make every moment count.", "Efficiency isn't just a habit for you — it's a philosophy."],
    riskTaking: ["You understand that growth lives on the other side of comfort.", "Your willingness to take risks is a rare and powerful quality."],
    mindfulness: ["You value presence and inner calm in a noisy world.", "Mindfulness isn't a practice for you — it's a way of being."],
    adventure: ["Your soul craves new experiences and horizons.", "Adventure runs through your veins."],
    finance: ["You think strategically about building financial freedom.", "Your financial awareness will serve you well on your journey."],
    relationships: ["Deep connections are at the heart of what matters to you.", "You invest in relationships the way others invest in careers."],
    careerGrowth: ["Your career ambition is fueled by a genuine desire to make an impact.", "You're not just climbing — you're building a legacy."],
    selfAwareness: ["Your level of self-awareness is remarkable and rare.", "You understand yourself better than most — that's a real gift."],
    decisionMaking: ["You value clarity in decision-making, even under pressure.", "Your decisiveness helps you cut through noise and take action."],
  };

  for (const trait of top3) {
    const templates = insightTemplates[trait.dim];
    if (templates) {
      insights.push(templates[Math.floor(Math.random() * templates.length)]);
    }
  }

  return insights;
}

// ─── Profile Embedding ───────────────────────────────────────────────

export function profileToEmbeddingText(profile: PersonalityProfile, messages: ConversationMessage[]): string {
  const profileText = profileToText(profile);
  const userMessages = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join('. ');

  return `${profileText} Based on their conversation: ${userMessages}`;
}
