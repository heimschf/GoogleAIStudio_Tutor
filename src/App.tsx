import { useState, useEffect } from "react";
import { curriculum } from "./data/curriculum";
import { Topic, UserProgress } from "./types";
import { LessonsList } from "./components/LessonsList";
import { QuizCard } from "./components/QuizCard";
import { SandboxConsole } from "./components/SandboxConsole";
import { AIChatCoach } from "./components/AIChatCoach";
import {
  Code2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  BrainCircuit,
  Lightbulb
} from "lucide-react";
import Markdown from "react-markdown";
import confetti from "canvas-confetti";

export default function App() {
  const [activeTopic, setActiveTopic] = useState<Topic>(curriculum[0]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(curriculum[0].lessons[0].id);
  const [activeMode, setActiveMode] = useState<"lesson" | "quiz" | "challenge">("lesson");

  // Terminal state buffers, shared so AI Chat is contextually aware
  const [sandboxCode, setSandboxCode] = useState<string>(curriculum[0].lessons[0].rSnippet);
  const [sandboxOutput, setSandboxOutput] = useState<string>("");

  // Student progress tracker with default structure
  const [progress, setProgress] = useState<UserProgress>({
    completedLessons: [],
    completedQuizzes: [],
    completedChallenges: [],
    stars: 0,
    streak: 1,
    lastActiveDate: null,
  });

  // Load progress from local storage on bootstrap
  useEffect(() => {
    const saved = localStorage.getItem("r_tutor_user_progress");
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error("Failed parsing user progress", e);
      }
    }
  }, []);

  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem("r_tutor_user_progress", JSON.stringify(newProgress));
  };

  const activeLessonIdx = activeTopic.lessons.findIndex((l) => l.id === activeLessonId);
  const currentLesson = activeTopic.lessons[activeLessonIdx] || activeTopic.lessons[0];

  // Logic to handle selecting a lesson
  const handleSelectLesson = (topic: Topic, lessonId: string) => {
    setActiveTopic(topic);
    setActiveLessonId(lessonId);
    setActiveMode("lesson");
    
    // Auto-populate the sandbox terminal with the tutorial's snippet!
    const targetLesson = topic.lessons.find((l) => l.id === lessonId);
    if (targetLesson) {
      setSandboxCode(targetLesson.rSnippet);
    }
  };

  // Logic to select quiz
  const handleSelectQuiz = (topic: Topic) => {
    setActiveTopic(topic);
    setActiveMode("quiz");
    setActiveLessonId(null);
  };

  // Logic to select challenge
  const handleSelectChallenge = (topic: Topic) => {
    setActiveTopic(topic);
    setActiveMode("challenge");
    setActiveLessonId(null);
    setSandboxCode(topic.challenge.placeholderCode);
  };

  // Callback when a user completes a lesson
  const handleCompleteCurrentLesson = () => {
    if (!activeLessonId) return;
    
    if (progress.completedLessons.includes(activeLessonId)) {
      // Already completed, just advance
      handleAdvanceNextStep();
      return;
    }

    const updatedLessons = [...progress.completedLessons, activeLessonId];
    const updatedStars = progress.stars + 5; // +5 Stars per lesson completed

    // Flash some quick mini confetti for small lesson accomplishment!
    confetti({
      particleCount: 20,
      angle: 90,
      spread: 35,
      origin: { y: 0.85 }
    });

    saveProgress({
      ...progress,
      completedLessons: updatedLessons,
      stars: updatedStars,
    });

    handleAdvanceNextStep();
  };

  // Helper to advance user logically to the next phase
  const handleAdvanceNextStep = () => {
    const totalLessons = activeTopic.lessons.length;
    
    if (activeLessonIdx < totalLessons - 1) {
      // Go to next lesson
      const nextL = activeTopic.lessons[activeLessonIdx + 1];
      setActiveLessonId(nextL.id);
      setSandboxCode(nextL.rSnippet);
    } else {
      // Go to topic quiz!
      setActiveMode("quiz");
      setActiveLessonId(null);
    }
  };

  // Callback when the user finishes a topic quiz
  const handleQuizCompleted = (topicId: string, gotPerfect: boolean) => {
    if (progress.completedQuizzes.includes(topicId)) return;

    let reward = 5;
    if (gotPerfect) reward = 15; // Golden bonus for 100% correct answers

    const updatedQuizzes = [...progress.completedQuizzes, topicId];
    saveProgress({
      ...progress,
      completedQuizzes: updatedQuizzes,
      stars: progress.stars + reward,
    });
  };

  // Callback when the user completes a coding challenge
  const handleChallengePassed = (topicId: string) => {
    if (progress.completedChallenges.includes(topicId)) return;

    const updatedChallenges = [...progress.completedChallenges, topicId];
    
    // Calculate streak update
    const todayStr = new Date().toDateString();
    let updatedStreak = progress.streak;
    if (progress.lastActiveDate !== todayStr) {
      updatedStreak += 1;
    }

    saveProgress({
      ...progress,
      completedChallenges: updatedChallenges,
      stars: progress.stars + 10, // +10 Stars for practical coding validation
      streak: updatedStreak,
      lastActiveDate: todayStr,
    });
  };

  const isCurrentChallengePassed = progress.completedChallenges.includes(activeTopic.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Visual Workspace header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-600">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest font-mono">
                Interactive Beta v1.2
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5 mt-0.5">
              <span>R Stats Coach</span>
              <span className="text-slate-350 font-extralight">|</span>
              <span className="text-sm text-slate-500 font-normal">Descriptive Statistics Tutor</span>
            </h1>
          </div>
        </div>
        
        {/* Core summary metrics box */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-lg">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            <span>
              <strong>Lessons</strong>: {progress.completedLessons.length} / 8 completed
            </span>
          </div>
          <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-lg">
            <Award className="h-4 w-4 text-amber-500 animate-pulse" />
            <span>
              <strong>Quizzes</strong>: {progress.completedQuizzes.length} passed
            </span>
          </div>
        </div>
      </header>

      {/* Main tripartite workspace layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        
        {/* Column 1: Navigation Sidebar */}
        <div className="w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col max-h-[45vh] lg:max-h-full">
          <LessonsList
            topics={curriculum}
            activeTopic={activeTopic}
            activeLessonId={activeLessonId}
            activeMode={activeMode}
            progress={progress}
            onSelectLesson={handleSelectLesson}
            onSelectQuiz={handleSelectQuiz}
            onSelectChallenge={handleSelectChallenge}
          />
        </div>

        {/* Column 2: Active Workspace (Lessons / Quiz / Challenges + Terminal) */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto bg-slate-50/50">
          
          {/* Top Panel: Task content block */}
          <div className="flex-1 p-5 min-h-[45vh] md:min-h-[50vh] flex flex-col justify-start">
            {activeMode === "lesson" && currentLesson && (
              <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative pb-8 animate-fade-in">
                
                {/* Lesson title */}
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider block">
                    {activeTopic.title} • Unit Lesson
                  </span>
                  <h2 className="text-xl font-bold text-slate-800 mt-1">{currentLesson.title}</h2>
                </div>

                {/* Rich text tutorial content */}
                <div className="prose prose-xs max-w-none text-slate-700 leading-relaxed space-y-4 flex-1">
                  <style>{`
                    .lesson-body h3 { color: #011627; font-size: 1.1rem; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.5rem; }
                    .lesson-body h4 { color: #334155; font-size: 0.95rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.25rem; }
                    .lesson-body p { margin-bottom: 0.85rem; font-size: 0.85rem; line-height: 1.62; color: #475569; }
                    .lesson-body ul, .lesson-body ol { margin-left: 1.25rem; margin-bottom: 1rem; list-style-type: disc; font-size: 0.85rem; color: #475569; }
                    .lesson-body li { margin-bottom: 0.35rem; }
                    .lesson-body code { background-color: #f1f5f9; padding: 0.15rem 0.3rem; border-radius: 4px; font-family: monospace; color: #4f46e5; font-size: 0.8rem; }
                    .lesson-body pre { background-color: #0f172a; padding: 0.85rem; border-radius: 8px; border: 1px solid #e2e8f0; overflow-x: auto; margin: 1rem 0; }
                    .lesson-body pre code { background: none; padding: 0; color: #a7f3d0; font-size: 0.775rem; }
                  `}</style>
                  <div className="lesson-body">
                    <Markdown>{currentLesson.content}</Markdown>
                  </div>
                </div>

                {/* Practical exercise link box */}
                <div className="mt-6 bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0 border border-indigo-100">
                      <Code2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Interactive Console Exercise</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Load this lesson's prepared code sample directly into the R compiler to experiment.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSandboxCode(currentLesson.rSnippet);
                      confetti({
                        particleCount: 15,
                        spread: 20,
                        origin: { y: 0.85 }
                      });
                    }}
                    className="bg-white hover:bg-slate-50 px-3.5 py-2 rounded-lg text-xs font-semibold text-indigo-650 border border-slate-250 hover:border-indigo-300 transition-all shrink-0 cursor-pointer shadow-sm"
                  >
                    Load into R Sandbox
                  </button>
                </div>

                {/* Navigation and progression triggers */}
                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between shrink-0">
                  <div />
                  <button
                    onClick={handleCompleteCurrentLesson}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-750 text-white py-2.5 px-5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md shadow-indigo-100"
                  >
                    <span>
                      {progress.completedLessons.includes(currentLesson.id)
                        ? "Continue Next"
                        : "Complete Lesson & Next (+5⭐)"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            )}

            {activeMode === "quiz" && (
              <div className="flex-1 flex flex-col justify-center animate-fade-in py-4">
                <QuizCard topic={activeTopic} onQuizCompleted={handleQuizCompleted} />
              </div>
            )}

            {activeMode === "challenge" && (
              <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative pb-4 animate-fade-in">
                
                {/* Challenge headers */}
                <div className="border-b border-slate-150 pb-4 mb-6 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider block">
                      Practical Coding Lab
                    </span>
                    <h2 className="text-xl font-bold text-slate-800 mt-1">Challenge: {activeTopic.title}</h2>
                  </div>
                  <span className="text-xs bg-indigo-55 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-mono font-medium">
                    Reward: +10 Stars ⭐
                  </span>
                </div>

                {/* Instructor description */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl text-slate-650 leading-relaxed text-xs space-y-4 mb-6 relative overflow-hidden shadow-inner">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                  <style>{`
                    .challenge-body h3 { color: #0f172a; font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; }
                    .challenge-body p { margin-bottom: 0.75rem; color: #475569; }
                    .challenge-body ul { margin-left: 1.25rem; margin-bottom: 0.75rem; list-style-type: square; color: #475569; }
                    .challenge-body li { margin-bottom: 0.3rem; }
                    .challenge-body code { background-color: #f1f5f9; padding: 0.15rem 0.3rem; border-radius: 4px; font-family: monospace; color: #4f46e5; }
                  `}</style>
                  <div className="challenge-body">
                    <Markdown>{activeTopic.challenge.instructionMarkdown}</Markdown>
                  </div>
                </div>

                {/* Challenge instruction card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50/50 border border-slate-205 p-4 rounded-xl shadow-sm">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <span>Dataset Summary</span>
                    </h4>
                    <p className="text-[11px] text-slate-550 leading-relaxed mb-2">
                       We preloaded <code className="text-indigo-700 font-mono font-bold bg-slate-100 px-1 py-0.5 rounded">{activeTopic.challenge.initialDatasetName}</code> containing {activeTopic.challenge.initialDataset.length} numerical metrics. Refer to it directly in your workspace.
                    </p>
                    <div className="text-[10px] font-mono bg-slate-900 p-2 rounded text-slate-300 truncate shadow-inner">
                      [{activeTopic.challenge.initialDataset.join(", ")}]
                    </div>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-205 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>Validation Criteria</span>
                      </h4>
                      <p className="text-[11px] text-slate-550 leading-relaxed font-sans">
                        Write R code to compute variables or run evaluation functions. The test engine checks your simulated terminal log to confirm you've executed:
                      </p>
                      <span className="inline-block mt-2 font-mono text-[10px] bg-indigo-50 py-1 px-2.5 rounded text-indigo-700 border border-indigo-100 font-bold">
                        {activeTopic.challenge.validationMetric}({activeTopic.challenge.initialDatasetName})
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Bottom Panel: Interactive R Terminal Sandbox */}
          <div className="p-4 bg-[#f8fafc] border-t border-slate-200 h-[480px] shrink-0">
            <SandboxConsole
              activeTopic={activeTopic}
              activeMode={activeMode}
              onChallengePassed={handleChallengePassed}
              sandboxCode={sandboxCode}
              setSandboxCode={setSandboxCode}
              sandboxOutput={sandboxOutput}
              setSandboxOutput={setSandboxOutput}
              isChallengePassed={isCurrentChallengePassed}
            />
          </div>

        </div>

        {/* Column 3: AI Professor Coaching sidebar chat panel */}
        <div className="w-full lg:w-96 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 p-3 bg-slate-100/50 h-[450px] lg:h-auto max-h-[80vh] lg:max-h-full">
          <AIChatCoach
            activeTopic={activeTopic}
            sandboxCode={sandboxCode}
            sandboxOutput={sandboxOutput}
          />
        </div>

      </div>
    </div>
  );
}
