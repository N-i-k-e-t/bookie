import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../store/appStore';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { TypewriterText } from '../components/ui/TypewriterText';
import {
  getOpeningQuestion,
  getFollowUpQuestion,
  getConversationTopics,
} from '../lib/conversationEngine';

export const ConversationPage: React.FC = () => {
  const { userName, messages, addMessage, setStep } = useAppStore();

  const [input, setInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fully static, on-device conversation — NO model downloads. Starts instantly
  // and works offline. Questions come from a curated bank in conversationEngine.
  useEffect(() => {
    if (messages.length === 0) {
      startConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiTyping]);

  const startConversation = () => {
    const firstQuestion = getOpeningQuestion();
    addMessage({
      role: 'assistant',
      content: `Hello ${userName}. I'm here to find your next great read. To start, ${firstQuestion.toLowerCase()}`,
      timestamp: Date.now(),
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || aiTyping) return;

    const userText = input.trim();
    setInput('');

    // Append user message
    addMessage({
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    });

    const userMessagesCount = messages.filter((m) => m.role === 'user').length + 1;

    if (userMessagesCount >= 4) {
      // Enough signal gathered — move to analysis.
      setStep('thinking');
      return;
    }

    // Static, reflective follow-up with a short "typing" beat for a natural feel.
    setAiTyping(true);
    const prevTopics = getConversationTopics(messages);
    const nextQuestion = getFollowUpQuestion(userText, userMessagesCount, prevTopics);
    window.setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: `I appreciate you sharing that. Tell me: ${nextQuestion}`,
        timestamp: Date.now(),
      });
      setAiTyping(false);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto p-4 md:p-6 min-h-[95vh] relative z-10 justify-between">
      {/* Step Progress */}
      <div className="w-full flex items-center justify-between px-2 mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-purple">
          Consultation in progress
        </span>
        <span className="text-xs text-gray-500 font-medium">
          Step 4 of 6
        </span>
      </div>

      {/* Chat Messages Area */}
      <GlassCard className="flex-1 overflow-y-auto mb-4 flex flex-col gap-4 max-h-[60vh] custom-scrollbar scroll-smooth">
        <div className="flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={`${msg.timestamp}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex flex-col max-w-[85%] ${
                msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <span className="text-[10px] text-gray-500 mb-1 px-1">
                {msg.role === 'user' ? userName : 'Bookie'}
              </span>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-purple text-white rounded-tr-none'
                    : 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-none'
                }`}
              >
                {msg.role === 'assistant' && idx === messages.length - 1 ? (
                  <TypewriterText text={msg.content} speed={12} />
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {aiTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="self-start flex flex-col max-w-[80%]"
            >
              <span className="text-[10px] text-gray-500 mb-1 px-1">Bookie is thinking</span>
              <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </GlassCard>

      {/* Input bar */}
      <form onSubmit={handleSend} className="flex gap-3 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={aiTyping ? 'Please wait...' : 'Type your thoughts...'}
          disabled={aiTyping}
          className="flex-1 px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple text-sm transition-all disabled:opacity-50"
        />
        <Button variant="primary" type="submit" disabled={aiTyping || !input.trim()} className="h-12 w-12 !p-0">
          <svg
            className="w-5 h-5 rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </Button>
      </form>
    </div>
  );
};

export default ConversationPage;
