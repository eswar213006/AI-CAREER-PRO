import React, { useEffect, useState } from 'react';
import api from '../utils/api';

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

export const TechnicalMCQ: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await api.get('/mcq');
      setCategories(res.data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCat) {
      const fetchQuestions = async () => {
        const res = await api.get(`/mcq/${selectedCat}`);
        setQuestions(res.data);
        setCurrent(0);
        setScore(0);
        setFinished(false);
        setSelected(null);
      };
      fetchQuestions();
    }
  }, [selectedCat]);

  const handleAnswer = () => {
    if (selected !== null && questions[current].answer === selected) {
      setScore(s => s + 1);
    }
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  if (!categories.length) return <div className="flex justify-center items-center min-h-64 text-gray-400">Loading categories…</div>;

  if (!selectedCat) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Select a MCQ Category</h2>
        <ul className="space-y-2">
          {categories.map(cat => (
            <li key={cat} onClick={() => setSelectedCat(cat)} className="cursor-pointer p-3 bg-dark-card/30 rounded hover:bg-dark-hover text-gray-300">
              {cat}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (questions.length === 0) return <div className="flex justify-center items-center min-h-64 text-gray-400">Loading questions…</div>;

  if (finished) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Quiz Completed</h2>
        <p className="text-lg text-gray-300">Score: {score} / {questions.length}</p>
        <button onClick={() => setSelectedCat('')} className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded">Back to Categories</button>
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
          <li key={idx}
            onClick={() => setSelected(idx)}
            className={`cursor-pointer p-3 rounded-lg transition-colors duration-200 ${selected === idx ? 'bg-primary-600/30 text-white' : 'bg-dark-card/30 hover:bg-dark-hover text-gray-300'}`}
          >{opt}</li>
        ))}
      </ul>
      <button onClick={handleAnswer} disabled={selected===null}
        className="mt-6 w-full py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg transition-colors"
      >Submit Answer</button>
    </div>
  );
};
