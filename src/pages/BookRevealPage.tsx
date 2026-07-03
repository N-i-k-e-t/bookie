import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../store/appStore';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { BookReveal3D } from '../components/3d/BookReveal3D';
import { getBooks } from '../lib/recommendationEngine';

export const BookRevealPage: React.FC = () => {
  const { recommendation, reset } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!recommendation) return null;

  const { book, matchScore, explanation, personalityInsights, keyLessons, whyItMatches } = recommendation;

  const handleShare = async () => {
    const shareText = `My reading recommendation from Bookie AI is: "${book.title}" by ${book.author} (${matchScore}% match)!\nFind your next favorite book: ${window.location.origin}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Bookie Recommendation',
          text: shareText,
          url: window.location.href,
        });
      } catch (e) {
        console.warn('Share failed:', e);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error('Clipboard copy failed:', e);
      }
    }
  };

  // Find detailed records for similar books
  const allBooks = getBooks();
  const matchedSimilar = book.similarBooks.map((simId) =>
    allBooks.find((b) => b.id === simId)
  ).filter(Boolean);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full min-h-screen relative z-10 justify-center">
      {/* Background radial highlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-purple/5 rounded-full blur-3xl" />

      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <span className="px-3 py-1 rounded-full bg-brand-purple/15 text-xs font-semibold text-brand-purple border border-brand-purple/20 uppercase tracking-widest">
          Your Perfect Match Found ({matchScore}% compatibility)
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold font-display text-white mt-4 tracking-tight">
          Your Next Favorite Book
        </h1>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3D Canvas + Core Stats */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <BookReveal3D title={book.title} author={book.author} genre={book.genre} />
          </motion.div>

          {/* Quick Metrics */}
          <GlassCard className="!p-5" delay={0.3}>
            <div className="grid grid-cols-2 gap-4 divide-x divide-white/10 text-center">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                  Reading Difficulty
                </span>
                <div className="flex justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`w-3.5 h-1.5 rounded-full ${
                        lvl <= book.difficultyLevel ? 'bg-brand-gold' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-300 mt-1 block">
                  {book.difficultyLevel === 1 && 'Easy'}
                  {book.difficultyLevel === 2 && 'Light'}
                  {book.difficultyLevel === 3 && 'Moderate'}
                  {book.difficultyLevel === 4 && 'Challenging'}
                  {book.difficultyLevel === 5 && 'Intense'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                  Estimated Time
                </span>
                <span className="text-lg font-bold text-white font-display block mt-1">
                  {book.estimatedReadingTime}
                </span>
                <span className="text-xs text-gray-400">Total duration</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Descriptions, Lessons, Insights */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Explanation */}
          <GlassCard delay={0.4}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-purple mb-3">
              Why it matches you
            </h3>
            <p className="text-lg font-medium text-white mb-4 leading-relaxed font-display">
              {whyItMatches}
            </p>
            <p className="text-sm text-gray-300 leading-relaxed">
              {explanation}
            </p>
          </GlassCard>

          {/* Key Lessons */}
          <GlassCard delay={0.5}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold mb-4">
              Key Lessons You'll Gain
            </h3>
            <ul className="flex flex-col gap-3">
              {keyLessons.map((lesson, idx) => (
                <li key={`lesson-${idx}`} className="flex gap-3 items-start text-sm text-gray-300">
                  <span className="text-brand-gold font-bold">✓</span>
                  <span>{lesson}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* Personality Insights */}
          <GlassCard delay={0.6}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-purple mb-4">
              Your Personality Insights
            </h3>
            <div className="flex flex-col gap-3">
              {personalityInsights.map((insight, idx) => (
                <p key={`insight-${idx}`} className="text-sm text-gray-300 leading-relaxed">
                  💡 {insight}
                </p>
              ))}
            </div>
          </GlassCard>

          {/* Similar Books */}
          {matchedSimilar.length > 0 && (
            <GlassCard delay={0.7} className="!pb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Other Books You Might Like
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {matchedSimilar.map((simBook: any) => (
                  <div
                    key={simBook.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-brand-purple font-medium">
                        {simBook.genre}
                      </span>
                      <h4 className="text-sm font-semibold text-white mt-1 leading-tight line-clamp-1">
                        {simBook.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        by {simBook.author}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-4 justify-center mt-12 mb-8"
      >
        <Button variant="primary" onClick={handleShare} className="px-8 py-3.5">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 10.742l4.887-2.443m0 9.878l-4.887-2.443m11.286-9.07a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zm-7 12.82a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zm0 0a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z"
            />
          </svg>
          {copied ? 'Copied to Clipboard!' : 'Share Recommendation'}
        </Button>

        <Button variant="secondary" onClick={reset} className="px-8 py-3.5">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5"
            />
          </svg>
          Find Another Book
        </Button>
      </motion.div>
    </div>
  );
};

export default BookRevealPage;
