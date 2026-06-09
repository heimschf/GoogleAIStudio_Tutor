import React, { useState } from "react";
import { QuizQuestion, Topic } from "../types";
import { Check, X, Award, ChevronRight, RefreshCw, Star } from "lucide-react";
import confetti from "canvas-confetti";

interface QuizCardProps {
  topic: Topic;
  onQuizCompleted: (topicId: string, gotPerfect: boolean) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ topic, onQuizCompleted }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const questions = topic.quizzes;
  const currentQuestion: QuizQuestion = questions[currentIndex];

  const handleOptionSelect = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);

    if (optionIdx === currentQuestion.correctAnswerIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Completed last question
      setShowResult(true);
      const isPerfect = score + (selectedOption === currentQuestion.correctAnswerIndex ? 1 : 0) === questions.length;
      if (isPerfect) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      onQuizCompleted(topic.id, isPerfect);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center shadow-sm max-w-xl mx-auto my-4">
        <p className="text-slate-500">No quizzes available for this topic yet. Check back soon!</p>
      </div>
    );
  }

  if (showResult) {
    const perfectScore = score === questions.length;
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center max-w-xl mx-auto my-4 animate-fade-in">
        <div className="p-4 bg-amber-500/10 rounded-full border border-amber-500/20 mb-4">
          <Award className={`h-12 w-12 ${perfectScore ? "text-amber-500" : "text-amber-600"}`} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Quiz Complete!</h3>
        <p className="text-slate-500 text-center mb-6 text-sm">
          You completed the quiz on <strong className="text-slate-850">{topic.title}</strong>.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 w-full text-center mb-6">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Your Score</p>
          <p className="text-4xl font-extrabold text-slate-850 mt-1">
            {score} <span className="text-lg text-slate-400">/ {questions.length}</span>
          </p>
          
          {perfectScore ? (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-amber-700 bg-amber-500/10 py-1.5 px-3 rounded-full border border-amber-500/10 font-medium">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span>Perfect! +15 Stars & Gold Badge Unlocked!</span>
            </div>
          ) : (
            <div className="mt-3 text-xs text-slate-550">
              Get all answers correct to earn maximum statistical stars!
            </div>
          )}
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium py-2.5 px-4 rounded-lg text-sm transition-all border border-slate-250 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 max-w-2xl mx-auto my-2 w-full animate-fade-in">
      {/* Progress header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Assessment</span>
          <h2 className="text-sm font-semibold text-slate-800 truncate max-w-xs">{topic.title}</h2>
        </div>
        <span className="text-xs bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-full font-mono text-slate-500">
          Question <strong className="text-indigo-650">{currentIndex + 1}</strong> of {questions.length}
        </span>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-850 leading-relaxed">
          {currentQuestion.question}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-2.5 mb-6">
        {currentQuestion.options.map((option, idx) => {
          let optionStyle = "bg-slate-50/50 border-slate-200 text-slate-705 hover:bg-slate-50 hover:border-slate-350 cursor-pointer";
          let icon = null;

          if (isAnswered) {
            const isCorrect = idx === currentQuestion.correctAnswerIndex;
            const isSelected = idx === selectedOption;

            if (isCorrect) {
              optionStyle = "bg-emerald-500/5 border-emerald-250 text-emerald-800 pointer-events-none";
              icon = <Check className="h-4 w-4 text-emerald-650 shrink-0" />;
            } else if (isSelected) {
              optionStyle = "bg-rose-500/5 border-rose-200 text-rose-850 pointer-events-none";
              icon = <X className="h-4 w-4 text-rose-650 shrink-0" />;
            } else {
              optionStyle = "bg-slate-50 border-slate-100 text-slate-400 pointer-events-none opacity-40";
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleOptionSelect(idx)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left border text-xs leading-relaxed transition-all ${optionStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className={`h-6 w-6 rounded-full flex items-center justify-center font-mono text-xs border ${
                  isAnswered && idx === currentQuestion.correctAnswerIndex
                    ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                    : isAnswered && idx === selectedOption
                    ? "bg-rose-100 border-rose-300 text-rose-700"
                    : "bg-white border-slate-200 text-slate-500 shadow-sm"
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="font-medium">{option}</span>
              </div>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Answer Explanations */}
      {isAnswered && (
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 mb-5 animate-slide-up">
          <h4 className="text-xs font-bold text-indigo-800 flex items-center gap-1 mb-1">
            <span>💡 Real-world Stats Explanation:</span>
          </h4>
          <p className="text-xs text-indigo-950/80 leading-relaxed font-medium">
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Bottom bar */}
      <div className="flex justify-end border-t border-slate-100 pt-3.5">
        <button
          disabled={!isAnswered}
          onClick={handleNext}
          className={`flex items-center gap-1.5 font-semibold py-2 px-4 rounded-lg text-xs transition-all ${
            isAnswered
              ? "bg-indigo-600 hover:bg-indigo-750 text-white cursor-pointer shadow-sm shadow-indigo-100"
              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
          }`}
        >
          <span>{currentIndex === questions.length - 1 ? "Complete Quiz" : "Next Question"}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
