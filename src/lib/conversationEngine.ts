import type { ConversationMessage, ConversationCategory, PersonalityDimension } from '../types';

// ─── Prompt Library ──────────────────────────────────────────────────
// Each prompt is categorized and maps to personality dimensions it helps assess.

interface ConversationPrompt {
  category: ConversationCategory;
  question: string;
  followUpHints: string[];
  dimensionsAssessed: PersonalityDimension[];
}

const OPENING_PROMPTS: ConversationPrompt[] = [
  {
    category: 'dreams',
    question: "Imagine it's exactly one year from today. What would make you smile and say — 'This year changed my life'?",
    followUpHints: ['career change', 'personal growth', 'relationships', 'creativity'],
    dimensionsAssessed: ['curiosity', 'confidence', 'selfAwareness'],
  },
  {
    category: 'purpose',
    question: "If you could master one skill so well that people came to you for advice — what would it be?",
    followUpHints: ['technical', 'creative', 'social', 'analytical'],
    dimensionsAssessed: ['learning', 'leadership', 'discipline'],
  },
  {
    category: 'happiness',
    question: "Think about the last time you completely lost track of time because you were so absorbed in something. What were you doing?",
    followUpHints: ['creative work', 'problem solving', 'helping others', 'exploring'],
    dimensionsAssessed: ['creativity', 'curiosity', 'mindfulness'],
  },
  {
    category: 'values',
    question: "If you had to describe yourself in a way that a stranger would instantly understand who you really are — what would you say?",
    followUpHints: ['identity', 'values', 'personality', 'aspirations'],
    dimensionsAssessed: ['selfAwareness', 'emotionalIntelligence', 'communication'],
  },
  {
    category: 'ambitions',
    question: "What's one thing you've always wanted to try, but something has been holding you back?",
    followUpHints: ['fear', 'time', 'resources', 'confidence'],
    dimensionsAssessed: ['riskTaking', 'confidence', 'adventure'],
  },
];

const FOLLOW_UP_PROMPTS: Record<string, ConversationPrompt[]> = {
  career: [
    {
      category: 'career',
      question: "That's exciting. When you think about your ideal workday — is it more about leading people, solving hard problems, or creating something beautiful?",
      followUpHints: ['leadership', 'technical', 'creative'],
      dimensionsAssessed: ['leadership', 'creativity', 'analyticalThinking'],
    },
    {
      category: 'career',
      question: "Do you feel more drawn to building something of your own, or becoming exceptional within a larger mission?",
      followUpHints: ['entrepreneur', 'corporate', 'hybrid'],
      dimensionsAssessed: ['entrepreneurship', 'discipline', 'riskTaking'],
    },
  ],
  creativity: [
    {
      category: 'creativity',
      question: "I love that. When you create — do you do it to express something inside you, or to solve a problem for others?",
      followUpHints: ['self-expression', 'problem-solving', 'both'],
      dimensionsAssessed: ['creativity', 'emotionalIntelligence', 'communication'],
    },
    {
      category: 'creativity',
      question: "What does creativity mean to you? Is it about making something new, or seeing something old in a completely new way?",
      followUpHints: ['innovation', 'perspective', 'art'],
      dimensionsAssessed: ['creativity', 'curiosity', 'analyticalThinking'],
    },
  ],
  growth: [
    {
      category: 'personalGrowth',
      question: "If I could give you the perfect book right now — would you want one that challenges how you think, or one that helps you feel more at peace?",
      followUpHints: ['intellectual', 'emotional', 'both'],
      dimensionsAssessed: ['learning', 'mindfulness', 'selfAwareness'],
    },
    {
      category: 'personalGrowth',
      question: "What part of yourself are you most actively trying to improve right now?",
      followUpHints: ['habits', 'mindset', 'skills', 'relationships'],
      dimensionsAssessed: ['discipline', 'selfAwareness', 'productivity'],
    },
  ],
  relationships: [
    {
      category: 'relationships',
      question: "When it comes to the people in your life — do you want to understand them better, or learn to communicate what you feel more clearly?",
      followUpHints: ['empathy', 'communication', 'boundaries'],
      dimensionsAssessed: ['emotionalIntelligence', 'communication', 'relationships'],
    },
  ],
  money: [
    {
      category: 'money',
      question: "Here's a fun one — if money was no longer a concern, what would you spend your time doing?",
      followUpHints: ['passion', 'travel', 'creation', 'helping'],
      dimensionsAssessed: ['finance', 'adventure', 'entrepreneurship'],
    },
  ],
  learning: [
    {
      category: 'learning',
      question: "Do you prefer learning by doing — jumping right in — or by deeply understanding the theory first?",
      followUpHints: ['practical', 'theoretical', 'mix'],
      dimensionsAssessed: ['learning', 'analyticalThinking', 'riskTaking'],
    },
  ],
  adventure: [
    {
      category: 'adventure',
      question: "If you could teleport anywhere right now for a month — no responsibilities, no limits — where would you go and what would you do?",
      followUpHints: ['travel', 'culture', 'nature', 'urban'],
      dimensionsAssessed: ['adventure', 'curiosity', 'mindfulness'],
    },
  ],
  confidence: [
    {
      category: 'confidence',
      question: "Think about someone you truly admire. What is it about them that draws you to them?",
      followUpHints: ['courage', 'wisdom', 'kindness', 'success'],
      dimensionsAssessed: ['confidence', 'leadership', 'selfAwareness'],
    },
  ],
  discipline: [
    {
      category: 'habits',
      question: "Are you the type who thrives with structure and routine, or do you feel most alive when every day is different?",
      followUpHints: ['structure', 'spontaneity', 'balance'],
      dimensionsAssessed: ['discipline', 'productivity', 'adventure'],
    },
  ],
  spirituality: [
    {
      category: 'purpose',
      question: "Do you ever find yourself wondering about the bigger questions — like why we're here, or what it all means?",
      followUpHints: ['philosophy', 'spirituality', 'science', 'pragmatic'],
      dimensionsAssessed: ['spirituality', 'curiosity', 'mindfulness'],
    },
  ],
};

const CLOSING_PROMPTS: ConversationPrompt[] = [
  {
    category: 'lifestyle',
    question: "Last question — when you finish reading a great book, what feeling do you want to walk away with?",
    followUpHints: ['inspiration', 'peace', 'knowledge', 'motivation'],
    dimensionsAssessed: ['selfAwareness', 'emotionalIntelligence', 'mindfulness'],
  },
  {
    category: 'lifestyle',
    question: "One more thing — if this book could give you one superpower, what would it be?",
    followUpHints: ['confidence', 'focus', 'empathy', 'clarity'],
    dimensionsAssessed: ['confidence', 'discipline', 'creativity'],
  },
  {
    category: 'personalGrowth',
    question: "Before I find your book — is there anything you feel is missing in your life right now that a great read might help with?",
    followUpHints: ['direction', 'motivation', 'calm', 'knowledge'],
    dimensionsAssessed: ['selfAwareness', 'learning', 'emotionalIntelligence'],
  },
];

// ─── Keyword Detection ──────────────────────────────────────────────

const KEYWORD_MAP: Record<string, string[]> = {
  career: ['job', 'career', 'work', 'company', 'business', 'promotion', 'startup', 'professional', 'office', 'boss', 'colleague', 'hire', 'salary', 'interview'],
  creativity: ['create', 'art', 'write', 'design', 'music', 'paint', 'build', 'imagine', 'creative', 'story', 'film', 'craft', 'invent', 'compose'],
  growth: ['grow', 'improve', 'better', 'change', 'learn', 'develop', 'evolve', 'transform', 'progress', 'level up', 'skill', 'master'],
  relationships: ['relationship', 'love', 'family', 'friend', 'partner', 'people', 'connect', 'communicate', 'trust', 'bond', 'social'],
  money: ['money', 'invest', 'finance', 'wealth', 'rich', 'income', 'passive', 'retire', 'savings', 'budget', 'financial'],
  learning: ['study', 'read', 'course', 'knowledge', 'understand', 'research', 'discover', 'explore', 'curious', 'education'],
  adventure: ['travel', 'adventure', 'explore', 'new', 'experience', 'world', 'journey', 'discover', 'freedom', 'wild'],
  confidence: ['confident', 'courage', 'brave', 'fear', 'anxiety', 'shy', 'bold', 'strong', 'believe', 'self-doubt'],
  discipline: ['habit', 'routine', 'discipline', 'focus', 'productive', 'consistency', 'willpower', 'procrastinate', 'organize', 'time management'],
  spirituality: ['meaning', 'purpose', 'soul', 'spirit', 'meditate', 'mindful', 'peace', 'calm', 'zen', 'philosophy', 'existence'],
};

// ─── Conversation Engine ─────────────────────────────────────────────

function detectTopics(text: string): string[] {
  const lowerText = text.toLowerCase();
  const detected: string[] = [];

  for (const [topic, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some((kw) => lowerText.includes(kw))) {
      detected.push(topic);
    }
  }

  return detected.length > 0 ? detected : ['growth'];
}

function selectRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function getOpeningQuestion(): string {
  return selectRandomItem(OPENING_PROMPTS).question;
}

export function getFollowUpQuestion(
  userResponse: string,
  questionIndex: number,
  previousTopics: string[]
): string {
  const topics = detectTopics(userResponse);

  // Find a topic we haven't covered yet
  const newTopic = topics.find((t) => !previousTopics.includes(t)) || topics[0];

  const prompts = FOLLOW_UP_PROMPTS[newTopic];
  if (prompts && prompts.length > 0) {
    return selectRandomItem(prompts).question;
  }

  // Fallback to closing if we're deep enough
  if (questionIndex >= 3) {
    return selectRandomItem(CLOSING_PROMPTS).question;
  }

  // Generic follow-up
  const genericFollowUps = [
    "That's really interesting. Can you tell me more about what drives that feeling?",
    "I hear you. What would it look like if that part of your life was exactly the way you wanted it?",
    "That says a lot about you. What's the biggest lesson life has taught you so far?",
  ];
  return selectRandomItem(genericFollowUps);
}

export function getClosingQuestion(): string {
  return selectRandomItem(CLOSING_PROMPTS).question;
}

export function getThinkingMessages(): string[] {
  return [
    "I'm connecting the dots...",
    "Looking through hundreds of books...",
    "Matching your personality to the perfect read...",
    "Finding the book that was meant for you...",
    "Almost there — this one feels right...",
  ];
}

// ─── Adaptive Responses ──────────────────────────────────────────────

export function generateAITransition(userResponse: string): string {
  const topics = detectTopics(userResponse);
  const topic = topics[0];

  const transitions: Record<string, string[]> = {
    career: [
      "That's exciting — you have real ambition.",
      "I can tell you're someone who thinks big about their career.",
    ],
    creativity: [
      "I love that creative energy.",
      "You clearly have an artistic soul.",
    ],
    growth: [
      "That tells me you're always looking to evolve.",
      "Growth mindset — I like that about you.",
    ],
    relationships: [
      "Relationships really matter to you. That's beautiful.",
      "The people in your life clearly mean a lot.",
    ],
    money: [
      "Financial intelligence — that's a powerful goal.",
      "Smart thinking about your future.",
    ],
    learning: [
      "Your curiosity is one of your superpowers.",
      "A lifelong learner — the best kind of person.",
    ],
    adventure: [
      "You've got a real explorer's spirit.",
      "I can feel the wanderlust in your words.",
    ],
    confidence: [
      "Building inner strength — that's the foundation of everything.",
      "Courage isn't the absence of fear. It's moving forward anyway.",
    ],
    discipline: [
      "Discipline is freedom in disguise.",
      "You're building something powerful with those habits.",
    ],
    spirituality: [
      "Those deeper questions are what make life meaningful.",
      "Searching for meaning — that's a journey worth taking.",
    ],
  };

  const topicTransitions = transitions[topic] || transitions.growth;
  return selectRandomItem(topicTransitions!);
}

// ─── Personality Extraction ──────────────────────────────────────────

export function extractPersonalitySignals(
  userResponse: string
): Partial<Record<PersonalityDimension, number>> {
  const topics = detectTopics(userResponse);
  const signals: Partial<Record<PersonalityDimension, number>> = {};
  const lowerText = userResponse.toLowerCase();

  // Topic-based signals
  for (const topic of topics) {
    switch (topic) {
      case 'career':
        signals.careerGrowth = 0.8;
        signals.discipline = 0.7;
        signals.productivity = 0.7;
        break;
      case 'creativity':
        signals.creativity = 0.85;
        signals.curiosity = 0.7;
        break;
      case 'growth':
        signals.selfAwareness = 0.8;
        signals.learning = 0.75;
        break;
      case 'relationships':
        signals.emotionalIntelligence = 0.8;
        signals.relationships = 0.85;
        signals.communication = 0.7;
        break;
      case 'money':
        signals.finance = 0.85;
        signals.entrepreneurship = 0.7;
        break;
      case 'learning':
        signals.learning = 0.85;
        signals.curiosity = 0.8;
        signals.analyticalThinking = 0.7;
        break;
      case 'adventure':
        signals.adventure = 0.85;
        signals.riskTaking = 0.7;
        break;
      case 'confidence':
        signals.confidence = 0.75;
        signals.selfAwareness = 0.7;
        break;
      case 'discipline':
        signals.discipline = 0.85;
        signals.productivity = 0.8;
        break;
      case 'spirituality':
        signals.spirituality = 0.85;
        signals.mindfulness = 0.8;
        break;
    }
  }

  // Sentiment / intensity adjustments
  const passionateWords = ['love', 'passionate', 'obsessed', 'dream', 'must', 'need', 'always'];
  const thoughtfulWords = ['maybe', 'think', 'wonder', 'perhaps', 'consider', 'ponder'];
  const actionWords = ['start', 'build', 'launch', 'create', 'begin', 'already', 'working on'];

  if (passionateWords.some((w) => lowerText.includes(w))) {
    signals.confidence = Math.min(1, (signals.confidence || 0.5) + 0.15);
    signals.riskTaking = Math.min(1, (signals.riskTaking || 0.5) + 0.1);
  }
  if (thoughtfulWords.some((w) => lowerText.includes(w))) {
    signals.analyticalThinking = Math.min(1, (signals.analyticalThinking || 0.5) + 0.15);
    signals.mindfulness = Math.min(1, (signals.mindfulness || 0.5) + 0.1);
  }
  if (actionWords.some((w) => lowerText.includes(w))) {
    signals.entrepreneurship = Math.min(1, (signals.entrepreneurship || 0.5) + 0.15);
    signals.discipline = Math.min(1, (signals.discipline || 0.5) + 0.1);
  }

  // Response length as a signal
  if (userResponse.length > 200) {
    signals.communication = Math.min(1, (signals.communication || 0.5) + 0.15);
    signals.emotionalIntelligence = Math.min(1, (signals.emotionalIntelligence || 0.5) + 0.1);
  }

  return signals;
}

export function getConversationTopics(messages: ConversationMessage[]): string[] {
  const topics: string[] = [];
  for (const msg of messages) {
    if (msg.role === 'user') {
      topics.push(...detectTopics(msg.content));
    }
  }
  return [...new Set(topics)];
}

// ─── SLM System Prompt ──────────────────────────────────────────────

export function buildSystemPrompt(userName: string): string {
  return `You are Bookie, a warm, insightful, and emotionally intelligent AI reading mentor. You are having a personal conversation with ${userName} to understand who they are as a person, so you can recommend the perfect book for them.

Your personality:
- Warm but not overly enthusiastic
- Thoughtful and perceptive
- You speak like an intelligent friend, not a chatbot
- You ask emotionally engaging questions, never robotic ones
- You notice details in what people say and reflect them back
- You keep responses concise — 2-3 sentences max

Rules:
- Never list multiple questions at once
- Never use bullet points or numbered lists
- Never say "Great question!" or similar filler
- Always make the conversation feel personal and flowing
- Respond to what the user actually said before asking the next question
- Keep your tone conversational and genuine`;
}
