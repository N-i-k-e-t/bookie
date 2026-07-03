// One-off merge: backfill primaryIntent onto existing books + append authored new books.
// Run: node scripts/merge-books.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const BOOKS_PATH = join(ROOT, 'src', 'data', 'books.json');
const WORKFLOW_OUTPUT = process.argv[2]; // path to the workflow task output JSON

// ── Valid vocab (mirror of src/types + recommendationEngine toneMap) ──
const PERSONALITY_DIMENSIONS = new Set([
  'curiosity','creativity','leadership','discipline','learning','confidence',
  'analyticalThinking','emotionalIntelligence','communication','entrepreneurship',
  'spirituality','productivity','riskTaking','mindfulness','adventure','finance',
  'relationships','careerGrowth','selfAwareness','decisionMaking',
]);
const EMOTIONAL_TONES = new Set([
  'Inspiring','Practical','Reflective','Empowering','Thought-provoking',
  'Calming','Motivating','Adventurous','Emotional','Strategic',
]);

// ── primaryIntent backfill for existing books (by id) ──
// Mapped from the user's intent lists to the existing 80 books.
const INTENT_BY_ID = {
  'atomic-habits': 'Build Better Habits',
  'thinking-fast-and-slow': 'Better Decision Making',
  'the-alchemist': 'Finding Purpose',
  'sapiens': 'Understand Humanity',
  'zero-to-one': 'Innovation',
  'deep-work': 'Improve Focus',
  'mans-search-for-meaning': 'Finding Purpose',
  'the-lean-startup': 'Startup Building',
  'meditations': 'Stoicism',
  'the-psychology-of-money': 'Develop Financial Wisdom',
  'how-to-win-friends': 'Build Better Relationships',
  'mindset': 'Growth Mindset',
  'the-subtle-art': 'Emotional Resilience',
  'start-with-why': 'Find Purpose',
  'emotional-intelligence': 'Emotional Intelligence',
  'rich-dad-poor-dad': 'Financial Education',
  'daring-greatly': 'Vulnerability',
  'the-power-of-now': 'Mindfulness',
  'the-7-habits': 'Personal Effectiveness',
  'creative-confidence': 'Creativity & Innovation',
  'the-hard-thing-about-hard-things': 'Founder Leadership',
  'shoe-dog': 'Entrepreneurial Journey',
  'the-power-of-habit': 'Habit Formation',
  'never-split-the-difference': 'Negotiation',
  'the-four-agreements': 'Personal Freedom',
  'cant-hurt-me': 'Mental Toughness',
  'the-art-of-war': 'Strategic Thinking',
  'the-48-laws-of-power': 'Power Dynamics',
  'ikigai': 'Purpose',
  'the-obstacle-is-the-way': 'Turning Adversity into Growth',
  'steal-like-an-artist': 'Creativity & Innovation',
  'big-magic': 'Creative Living',
  'the-war-of-art': 'Overcoming Creative Resistance',
  'outliers': 'Success Factors',
  'grit': 'Perseverance',
  'influence': 'Persuasion',
  '12-rules-for-life': 'Meaningful Living',
  'the-intelligent-investor': 'Value Investing',
  'think-and-grow-rich': 'Success Mindset',
  'quiet': 'Introvert Strengths',
  'the-one-thing': 'Goal Focus',
  'the-compound-effect': 'Consistency',
  'a-brief-history-of-time': 'Scientific Curiosity',
  'ego-is-the-enemy': 'Humility',
  'drive': 'Motivation',
  'essentialism': 'Prioritization',
  'the-body-keeps-the-score': 'Trauma Understanding',
  'good-to-great': 'Business Growth',
  'into-the-wild': 'Adventure & Freedom',
  'flow': 'Peak Performance',
  'educated': 'Self-Education',
  'becoming': 'Personal Journey',
  'range': 'Broad Learning',
  'think-again': 'Rethinking Beliefs',
  '1984': 'Perspective & Awareness',
  'to-kill-a-mockingbird': 'Empathy & Perspective',
  'the-5am-club': 'Morning Discipline',
  'attached': 'Healthy Relationships',
  'the-five-love-languages': 'Relationship Communication',
  'the-courage-to-be-disliked': 'Self-Acceptance',
  'sapiens-21-lessons': 'Understanding the Present',
  'the-daily-stoic': 'Daily Reflection',
  'rework': 'Modern Entrepreneurship',
  'extreme-ownership': 'Personal Responsibility',
  'the-design-of-everyday-things': 'User Experience Design',
  'born-a-crime': 'Resilience',
  'make-your-bed': 'Discipline',
  'so-good-they-cant-ignore-you': 'Career Excellence',
  'the-untethered-soul': 'Inner Freedom',
  'mastery': 'Mastery',
  'show-your-work': 'Sharing Your Work',
  'when-breath-becomes-air': 'Living with Purpose',
  'the-power-of-your-subconscious-mind': 'Positive Thinking',
  'crushing-it': 'Personal Branding',
  'the-midnight-library': 'Perspective & Inspiration',
  'principles': 'Decision Making',
  'the-power-of-habit-2': 'Sustainable Productivity', // "Smarter Faster Better"
  'mans-search-for-meaning-2': 'Balanced Living',       // "The Monk Who Sold His Ferrari"
  'tiny-habits': 'Habit Formation',
  'the-art-of-possibility': 'Possibility Thinking',
};

// ── Load ──
const existing = JSON.parse(readFileSync(BOOKS_PATH, 'utf8'));
const raw = JSON.parse(readFileSync(WORKFLOW_OUTPUT, 'utf8'));
const authored = (raw.result && raw.result.books) ? raw.result.books : (raw.books || []);

const existingIds = new Set(existing.map((b) => b.id));
const existingTitles = new Set(existing.map((b) => b.title.toLowerCase().trim()));

// ── Backfill primaryIntent on existing ──
let backfilled = 0;
let missingIntent = [];
for (const b of existing) {
  if (INTENT_BY_ID[b.id]) {
    b.primaryIntent = INTENT_BY_ID[b.id];
    backfilled++;
  } else {
    missingIntent.push(b.id);
  }
}

// ── Validate + dedupe authored new books ──
const problems = [];
const seenNewIds = new Set();
const toAppend = [];
for (const b of authored) {
  if (!b || !b.id) { problems.push('authored book missing id'); continue; }
  if (existingIds.has(b.id) || existingTitles.has((b.title || '').toLowerCase().trim())) {
    // Duplicate of an existing book — skip (existing wins), but ensure intent set
    continue;
  }
  if (seenNewIds.has(b.id)) continue; // dup within authored set
  seenNewIds.add(b.id);

  // Validate tags/tone; drop invalid tags, coerce tone
  b.personalityTags = (b.personalityTags || []).filter((t) => PERSONALITY_DIMENSIONS.has(t));
  if (b.personalityTags.length === 0) b.personalityTags = ['learning', 'curiosity'];
  if (!EMOTIONAL_TONES.has(b.emotionalTone)) {
    problems.push(`invalid tone "${b.emotionalTone}" on ${b.id} -> coerced to Practical`);
    b.emotionalTone = 'Practical';
  }
  if (!b.language) b.language = 'English';
  if (!b.primaryIntent) problems.push(`missing primaryIntent on ${b.id}`);
  toAppend.push(b);
}

const merged = [...existing, ...toAppend];

// ── Final validation ──
const allIds = merged.map((b) => b.id);
const dupIds = allIds.filter((id, i) => allIds.indexOf(id) !== i);
const withoutIntent = merged.filter((b) => !b.primaryIntent).map((b) => b.id);

writeFileSync(BOOKS_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf8');

console.log('=== MERGE REPORT ===');
console.log('Existing books:', existing.length);
console.log('Authored (raw):', authored.length);
console.log('Appended (new, deduped):', toAppend.length);
console.log('TOTAL now:', merged.length);
console.log('primaryIntent backfilled on existing:', backfilled);
console.log('Existing WITHOUT intent map:', missingIntent.length ? missingIntent.join(', ') : 'none');
console.log('Books still WITHOUT primaryIntent:', withoutIntent.length ? withoutIntent.join(', ') : 'none');
console.log('Duplicate ids in final:', dupIds.length ? [...new Set(dupIds)].join(', ') : 'none');
if (problems.length) {
  console.log('--- data issues (auto-fixed) ---');
  problems.forEach((p) => console.log('  •', p));
}
