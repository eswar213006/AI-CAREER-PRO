import React, { useEffect, useState } from 'react';
import api from '../utils/api';

interface Question {
  id: string;
  type?: string;
  question: string;
  options: string[];
  answer: number;
}

export const AptitudePractice: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [finished, setFinished] = useState<boolean>(false);

  useEffect(() => {
    const fetch = async () => {
      const res = await api.get('/aptitude');
      setQuestions(res.data);
    };
    fetch();
  }, []);

  const handleAnswer = () => {
    if (selected !== null && questions[current].answer === selected) {
      setScore((s) => s + 1);
    }
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  if (questions.length === 0) return <div className="flex justify-center items-center min-h-64 text-gray-400">Loading questions…</div>;

  if (finished) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Aptitude Test Completed</h2>
        <p className="text-lg text-gray-300">Your score: {score} / {questions.length}</p>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div className="max-w-2xl mx-auto p-6 bg-dark-card/60 backdrop-blur-lg rounded-xl shadow-xl border border-dark-border">
      <h2 className="text-xl font-semibold mb-4 text-white">Question {current + 1} of {questions.length}</h2>
      <p className="mb-6 text-gray-200">{q.question}</p>
      <ul className="space-y-3">
        {q.options.map((opt, idx) => (
          <li
            key={idx}
            onClick={() => setSelected(idx)}
            className={`cursor-pointer p-3 rounded-lg transition-colors duration-200 ${selected === idx ? 'bg-primary-600/30 text-white' : 'bg-dark-card/30 hover:bg-dark-hover text-gray-300'}`}
          >
            {opt}
          </li>
        ))}
      </ul>
      <button
        onClick={handleAnswer}
        className="mt-6 w-full py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg transition-colors"
        disabled={selected === null}
      >
        Submit Answer
      </button>
    </div>
  );
};
