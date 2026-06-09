import React from "react";
import { Topic, UserProgress } from "../types";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Award,
  Flame,
  Star,
  Terminal,
  Trophy,
  GraduationCap
} from "lucide-react";

interface LessonsListProps {
  topics: Topic[];
  activeTopic: Topic;
  activeLessonId: string | null;
  activeMode: "lesson" | "quiz" | "challenge";
  progress: UserProgress;
  onSelectLesson: (topic: Topic, lessonId: string) => void;
  onSelectQuiz: (topic: Topic) => void;
  onSelectChallenge: (topic: Topic) => void;
}

export const LessonsList: React.FC<LessonsListProps> = ({
  topics,
  activeTopic,
  activeLessonId,
  activeMode,
  progress,
  onSelectLesson,
  onSelectQuiz,
  onSelectChallenge,
}) => {
  return (
    <div className="w-full flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200">
      {/* Metrics Banner */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-850 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-indigo-400" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">R Stats Academy</h1>
            <p className="text-[10px] text-slate-400 font-mono">Descriptive Stats Module</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded text-yellow-400 text-xs font-mono">
            <Star className="h-3 w-3 fill-yellow-400 animate-pulse" />
            <span>{progress.stars}</span>
          </div>
          <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded text-orange-400 text-xs font-mono">
            <Flame className="h-3 w-3 fill-orange-400" />
            <span>{progress.streak}d</span>
          </div>
        </div>
      </div>

      {/* Curriculum list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {topics.map((topic, topicIdx) => {
          const isTopicActive = activeTopic.id === topic.id;
          const isQuizCompleted = progress.completedQuizzes.includes(topic.id);
          const isChallengeCompleted = progress.completedChallenges.includes(topic.id);
          
          return (
            <div
              key={topic.id}
              className={`rounded-lg transition-all duration-200 overflow-hidden border ${
                isTopicActive
                  ? "bg-slate-800/80 border-indigo-500/40 shadow-lg ring-1 ring-indigo-500/10"
                  : "bg-slate-950/20 border-slate-800/60 hover:border-slate-800"
              }`}
            >
              {/* Topic Header */}
              <div className="p-3 bg-slate-950/60 flex items-start gap-2.5 border-b border-slate-800/50">
                <div className={`p-1.5 rounded-lg ${isTopicActive ? "bg-indigo-500/10 text-indigo-400" : "bg-slate-850 text-slate-400"}`}>
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider">
                      Unit 0{topicIdx + 1}
                    </span>
                    <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-medium">
                      {topic.difficulty}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white truncate">{topic.title}</h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{topic.subtitle}</p>
                </div>
              </div>

              {/* Lessons & Tasks Under Topic */}
              <div className="p-1.5 space-y-1 bg-slate-900/40">
                {topic.lessons.map((lesson) => {
                  const isLessonActive =
                    isTopicActive &&
                    activeMode === "lesson" &&
                    activeLessonId === lesson.id;
                  const isLessonCompleted = progress.completedLessons.includes(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onSelectLesson(topic, lesson.id)}
                      className={`w-full flex items-center justify-between p-2 rounded text-left transition-all ${
                        isLessonActive
                          ? "bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-500 font-medium pl-3"
                          : "text-slate-350 hover:bg-slate-800/50 pl-2.5"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {isLessonCompleted ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
                        )}
                        <span className="text-xs truncate">{lesson.title}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 shrink-0">
                        {lesson.estimatedMinutes}m
                      </span>
                    </button>
                  );
                })}

                {/* Separator */}
                <div className="h-px bg-slate-800/80 my-1 mx-2" />

                {/* Quiz Selector */}
                <button
                  onClick={() => onSelectQuiz(topic)}
                  className={`w-full flex items-center justify-between p-2 rounded text-left transition-all ${
                    isTopicActive && activeMode === "quiz"
                      ? "bg-amber-500/10 text-amber-300 border-l-2 border-amber-500 font-medium pl-3"
                      : "text-slate-350 hover:bg-slate-800/50 pl-2.5"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <Award className={`h-3.5 w-3.5 shrink-0 ${isQuizCompleted ? "text-amber-400" : "text-slate-500"}`} />
                    <span className="text-xs truncate">Topic Quiz</span>
                  </div>
                  {isQuizCompleted ? (
                    <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 rounded font-semibold">
                      Passed
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-500 font-mono">
                      {topic.quizzes.length} Qs
                    </span>
                  )}
                </button>

                {/* Challenge Selector */}
                <button
                  onClick={() => onSelectChallenge(topic)}
                  className={`w-full flex items-center justify-between p-2 rounded text-left transition-all ${
                    isTopicActive && activeMode === "challenge"
                      ? "bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-500 font-medium pl-3"
                      : "text-slate-350 hover:bg-slate-800/50 pl-2.5"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <Terminal className={`h-3.5 w-3.5 shrink-0 ${isChallengeCompleted ? "text-indigo-400" : "text-slate-500"}`} />
                    <span className="text-xs truncate">Coding Challenge</span>
                  </div>
                  {isChallengeCompleted ? (
                    <Trophy className="h-3.5 w-3.5 text-indigo-400 animate-bounce" />
                  ) : (
                    <span className="text-[9px] text-slate-500 font-mono">
                      +10 XP
                    </span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer Instructions Info */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-850 text-center">
        <p className="text-[10px] text-slate-400">
          Tip: Run R code at any time in the compiler. Ask Prof. Sigma if you get stuck!
        </p>
      </div>
    </div>
  );
};
