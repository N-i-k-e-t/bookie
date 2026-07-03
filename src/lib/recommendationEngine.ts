import type { Book, PersonalityProfile, Recommendation, PersonalityDimension } from '../types';
import { PERSONALITY_DIMENSIONS } from '../types';
import { generateInsights } from './personalityMapper';
import booksData from '../data/books.json';

// ─── Load Books ──────────────────────────────────────────────────────

let cachedBooks: Book[] | null = null;

export function getBooks(): Book[] {
  if (!cachedBooks) {
    cachedBooks = (booksData as unknown) as Book[];
  }
  return cachedBooks;
}

// ─── Cosine Similarity ──────────────────────────────────────────────

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

// ─── Personality-based Matching ──────────────────────────────────────

function personalityMatchScore(profile: PersonalityProfile, book: Book): number {
  let score = 0;
  let totalWeight = 0;

  // Match personality tags
  for (const tag of book.personalityTags) {
    const dim = tag as PersonalityDimension;
    if (PERSONALITY_DIMENSIONS.includes(dim)) {
      score += profile[dim] * 2; // Strong signal
      totalWeight += 2;
    }
  }

  // Match emotional tone
  const toneMap: Record<string, PersonalityDimension[]> = {
    'inspiring': ['confidence', 'leadership', 'entrepreneurship'],
    'practical': ['discipline', 'productivity', 'analyticalThinking'],
    'reflective': ['selfAwareness', 'mindfulness', 'spirituality'],
    'empowering': ['confidence', 'riskTaking', 'careerGrowth'],
    'thought-provoking': ['curiosity', 'analyticalThinking', 'learning'],
    'calming': ['mindfulness', 'spirituality', 'emotionalIntelligence'],
    'motivating': ['discipline', 'productivity', 'careerGrowth'],
    'adventurous': ['adventure', 'riskTaking', 'curiosity'],
    'emotional': ['emotionalIntelligence', 'relationships', 'selfAwareness'],
    'strategic': ['analyticalThinking', 'finance', 'decisionMaking'],
  };

  const toneDims = toneMap[book.emotionalTone.toLowerCase()] || [];
  for (const dim of toneDims) {
    score += profile[dim];
    totalWeight += 1;
  }

  return totalWeight > 0 ? score / totalWeight : 0.5;
}

// ─── Recommendation Engine ──────────────────────────────────────────

export function generateRecommendation(
  profile: PersonalityProfile,
  userEmbedding?: number[]
): Recommendation {
  const books = getBooks();

  // Score all books
  const scored = books.map((book) => {
    let score = 0;

    // 1. Personality match (weight: 60%)
    const personalityScore = personalityMatchScore(profile, book);
    score += personalityScore * 0.6;

    // 2. Embedding similarity (weight: 30%)
    if (userEmbedding && book.embeddingVector && book.embeddingVector.length > 0) {
      const embeddingScore = cosineSimilarity(userEmbedding, book.embeddingVector);
      score += embeddingScore * 0.3;
    } else {
      // Fallback: keyword overlap bonus
      score += personalityScore * 0.3;
    }

    // 3. Diversity bonus (weight: 10%)
    // Slightly boost books outside the user's primary comfort zone for discovery
    const topDimensions = PERSONALITY_DIMENSIONS
      .map((d) => ({ d, s: profile[d] }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((x) => x.d);

    const hasOverlap = book.personalityTags.some((t) =>
      topDimensions.includes(t as PersonalityDimension)
    );
    const hasDiscovery = book.personalityTags.some(
      (t) => !topDimensions.includes(t as PersonalityDimension)
    );
    if (hasOverlap && hasDiscovery) {
      score += 0.1; // Books that bridge known + new territory
    }

    return { book, score };
  });

  // Sort by score and pick the best
  scored.sort((a, b) => b.score - a.score);
  const topBook = scored[0];

  // Generate explanation
  const insights = generateInsights(profile);
  const explanation = generateExplanation(profile, topBook.book);
  const keyLessons = generateKeyLessons(topBook.book);

  return {
    book: topBook.book,
    matchScore: Math.round(topBook.score * 100),
    explanation,
    personalityInsights: insights,
    keyLessons,
    whyItMatches: generateWhyItMatches(profile, topBook.book),
  };
}

// ─── Explanation Generation ──────────────────────────────────────────

function generateExplanation(profile: PersonalityProfile, book: Book): string {
  const bookTopics = book.topics.slice(0, 3).join(', ');

  return `Based on our conversation, I can tell you're someone who is ${getTopTraitDescriptor(profile)}. "${book.title}" by ${book.author} speaks directly to that part of you. It explores ${bookTopics}, which aligns perfectly with where you are right now in your journey. This isn't just a good book — it's the right book for you at this moment.`;
}

function generateWhyItMatches(profile: PersonalityProfile, book: Book): string {
  const sorted = PERSONALITY_DIMENSIONS
    .map((dim) => ({ dim, score: profile[dim] }))
    .sort((a, b) => b.score - a.score);

  const topDim = sorted[0].dim;
  const matchingTags = book.personalityTags.filter((t) =>
    sorted.slice(0, 5).map((s) => s.dim).includes(t as PersonalityDimension)
  );

  const tagStr = matchingTags.length > 0
    ? matchingTags.slice(0, 2).join(' and ')
    : book.genre;

  return `Your strongest trait is ${formatDimension(topDim)}, and this book is deeply connected to ${tagStr}. It was written for someone exactly like you.`;
}

function generateKeyLessons(book: Book): string[] {
  // Generate from book's skills developed and topics
  const lessons: string[] = [];

  if (book.skillsDeveloped.length > 0) {
    lessons.push(`Develop your ${book.skillsDeveloped[0].toLowerCase()}`);
  }
  if (book.topics.length > 0) {
    lessons.push(`Understand ${book.topics[0].toLowerCase()} from a new perspective`);
  }
  if (book.skillsDeveloped.length > 1) {
    lessons.push(`Build ${book.skillsDeveloped[1].toLowerCase()} skills`);
  }
  if (book.topics.length > 1) {
    lessons.push(`Explore the connection between ${book.topics[0].toLowerCase()} and ${book.topics[1].toLowerCase()}`);
  }

  return lessons.length > 0 ? lessons : ['Gain a new perspective on life', 'Discover actionable insights', 'Transform your thinking'];
}

function getTopTraitDescriptor(profile: PersonalityProfile): string {
  const sorted = PERSONALITY_DIMENSIONS
    .map((dim) => ({ dim, score: profile[dim] }))
    .sort((a, b) => b.score - a.score);

  const descriptors: Record<PersonalityDimension, string> = {
    curiosity: 'endlessly curious',
    creativity: 'deeply creative',
    leadership: 'a natural leader',
    discipline: 'remarkably disciplined',
    learning: 'a passionate learner',
    confidence: 'building real confidence',
    analyticalThinking: 'analytically sharp',
    emotionalIntelligence: 'emotionally intelligent',
    communication: 'a gifted communicator',
    entrepreneurship: 'entrepreneurial at heart',
    spirituality: 'spiritually aware',
    productivity: 'driven by productivity',
    riskTaking: 'unafraid to take bold risks',
    mindfulness: 'deeply mindful',
    adventure: 'hungry for adventure',
    finance: 'financially savvy',
    relationships: 'deeply relational',
    careerGrowth: 'career-driven',
    selfAwareness: 'remarkably self-aware',
    decisionMaking: 'a decisive thinker',
  };

  return `${descriptors[sorted[0].dim]} and ${descriptors[sorted[1].dim]}`;
}

function formatDimension(dim: PersonalityDimension): string {
  const names: Record<PersonalityDimension, string> = {
    curiosity: 'Curiosity',
    creativity: 'Creativity',
    leadership: 'Leadership',
    discipline: 'Discipline',
    learning: 'Love of Learning',
    confidence: 'Confidence',
    analyticalThinking: 'Analytical Thinking',
    emotionalIntelligence: 'Emotional Intelligence',
    communication: 'Communication',
    entrepreneurship: 'Entrepreneurship',
    spirituality: 'Spirituality',
    productivity: 'Productivity',
    riskTaking: 'Risk Taking',
    mindfulness: 'Mindfulness',
    adventure: 'Adventure',
    finance: 'Financial Intelligence',
    relationships: 'Relationships',
    careerGrowth: 'Career Growth',
    selfAwareness: 'Self-Awareness',
    decisionMaking: 'Decision Making',
  };
  return names[dim];
}
