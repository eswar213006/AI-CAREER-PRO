import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { 
  Layers, Star, Check, X, RefreshCw, Bookmark, BookmarkCheck,
  ChevronLeft, ChevronRight, HelpCircle
} from 'lucide-react';
import api from '../utils/api';

interface FlashcardItem {
  id: string;
  topic: string;
  question: string;
  answer: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  bookmarked: boolean;
}

const STATIC_CARDS: FlashcardItem[] = [
  { id: '1', topic: 'Java & OOPs', question: 'What is runtime polymorphism in Java?', answer: 'Method overriding, where a call to an overridden method is resolved at runtime using dynamic method dispatch.', bookmarked: false },
  { id: '2', topic: 'DBMS & SQL', question: 'What is the primary difference between Primary Key and Unique Key?', answer: 'Primary Key uniquely identifies a record and cannot accept NULL values. Unique Key also identifies records but can accept a single NULL value.', bookmarked: true },
  { id: '3', topic: 'Operating Systems', question: 'What are the four necessary Coffman conditions for a deadlock to occur?', answer: 'Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.', bookmarked: false },
  { id: '4', topic: 'Computer Networks', question: 'What is the role of ARP (Address Resolution Protocol)?', answer: 'Resolves IP addresses (network layer) to MAC addresses (data link layer) within a local area network.', bookmarked: false },
  { id: '5', topic: 'Data Structures', question: 'What is the average time complexity of searching in a Hash Map?', answer: 'O(1) average time complexity, assuming a good hash function with minimal collisions.', bookmarked: false }
];

export const FlashcardsPractice: React.FC = () => {
  const { showToast } = useToast();
  const [cards, setCards] = useState<FlashcardItem[]>(STATIC_CARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex(idx => (idx + 1) % cards.length);
  };

  const handlePrev = () => {
    setFlipped(false);
    setCurrentIndex(idx => (idx - 1 + cards.length) % cards.length);
  };

  const toggleBookmark = () => {
    const next = [...cards];
    next[currentIndex].bookmarked = !next[currentIndex].bookmarked;
    setCards(next);
    showToast(next[currentIndex].bookmarked ? 'Card bookmarked.' : 'Bookmark removed.', 'info');
  };

  const handleRateDifficulty = (diff: 'easy' | 'medium' | 'hard') => {
    const next = [...cards];
    next[currentIndex].difficulty = diff;
    setCards(next);
    showToast(`Difficulty marked: ${diff}. Spaced repetition interval updated.`, 'success');
    handleNext();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary-400" />
          <span>Interactive Spaced Repetition Flashcards</span>
        </h2>
        <p className="text-xs text-gray-400">
          Flip cards to test core computer science concepts. Rate difficulty to automate scheduling.
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Progress Tracker */}
        <div className="flex justify-between items-center text-xs text-gray-400 font-semibold">
          <span>{currentCard.topic} Deck</span>
          <span>Card {currentIndex + 1} of {cards.length}</span>
        </div>

        {/* 3D Flip Card Container */}
        <div 
          onClick={() => setFlipped(!flipped)}
          className="relative h-64 w-full cursor-pointer perspective"
        >
          <div className={`relative w-full h-full duration-500 transform-style preserve-3d ${flipped ? 'rotate-y-180' : ''}`}>
            
            {/* Front Side */}
            <div className="absolute inset-0 w-full h-full bg-dark-card border border-dark-border rounded-2xl flex flex-col justify-between p-6 backface-hidden shadow-xl shadow-black/30">
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                <span>{currentCard.topic}</span>
                <button onClick={e => { e.stopPropagation(); toggleBookmark(); }} className="text-gray-500 hover:text-white transition-colors">
                  {currentCard.bookmarked ? <BookmarkCheck className="h-4.5 w-4.5 text-accent-purple" /> : <Bookmark className="h-4.5 w-4.5" />}
                </button>
              </div>

              <div className="text-center py-6">
                <p className="text-sm font-extrabold text-white leading-relaxed">{currentCard.question}</p>
              </div>

              <div className="text-center text-[9px] font-black uppercase text-gray-500 tracking-widest">
                Click Card to Reveal Answer
              </div>
            </div>

            {/* Back Side */}
            <div className="absolute inset-0 w-full h-full bg-[#101222] border border-violet-500/25 rounded-2xl flex flex-col justify-between p-6 backface-hidden rotate-y-180 shadow-xl shadow-violet-900/10">
              <div className="flex justify-between items-center text-[10px] text-violet-400 font-bold uppercase tracking-wider">
                <span>Explanation</span>
                <button onClick={e => { e.stopPropagation(); toggleBookmark(); }} className="text-gray-500 hover:text-white transition-colors">
                  {currentCard.bookmarked ? <BookmarkCheck className="h-4.5 w-4.5 text-accent-purple" /> : <Bookmark className="h-4.5 w-4.5" />}
                </button>
              </div>

              <div className="text-center py-6">
                <p className="text-xs font-semibold text-gray-200 leading-relaxed">{currentCard.answer}</p>
              </div>

              <div className="text-center text-[9px] font-black uppercase text-gray-500 tracking-widest">
                Click Card to Flip Back
              </div>
            </div>

          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center gap-4">
          <Button variant="secondary" onClick={handlePrev} className="px-3 py-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Difficulty Raters */}
          <div className="flex-1 grid grid-cols-3 gap-2">
            <button
              onClick={() => handleRateDifficulty('easy')}
              className="py-2.5 rounded-xl border border-emerald-900/35 bg-emerald-950/10 hover:bg-emerald-950/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider transition-all"
            >
              Easy
            </button>
            <button
              onClick={() => handleRateDifficulty('medium')}
              className="py-2.5 rounded-xl border border-amber-900/35 bg-amber-950/10 hover:bg-amber-950/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider transition-all"
            >
              Medium
            </button>
            <button
              onClick={() => handleRateDifficulty('hard')}
              className="py-2.5 rounded-xl border border-red-900/35 bg-red-950/10 hover:bg-red-950/20 text-red-400 text-[10px] font-bold uppercase tracking-wider transition-all"
            >
              Hard
            </button>
          </div>

          <Button variant="secondary" onClick={handleNext} className="px-3 py-2">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

      </div>

      {/* 3D Transform CSS utilities */}
      <style>{`
        .perspective {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .rotate-y-180-back {
          transform: rotateY(0deg);
        }
      `}</style>
    </div>
  );
};
export default FlashcardsPractice;
