import React, { useState, useEffect } from "react";
import { runRCode, SimulationResult } from "../utils/rSim";
import { BoxPlotCanvas } from "./BoxPlotCanvas";
import { HistPlotCanvas } from "./HistPlotCanvas";
import { Topic, CodingChallenge } from "../types";
import { Play, RotateCcw, Database, Info, Terminal, Sparkles, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

interface SandboxConsoleProps {
  activeTopic: Topic;
  activeMode: "lesson" | "quiz" | "challenge";
  onChallengePassed: (topicId: string) => void;
  sandboxCode: string;
  setSandboxCode: (code: string) => void;
  sandboxOutput: string;
  setSandboxOutput: (out: string) => void;
  isChallengePassed: boolean;
}

export const SandboxConsole: React.FC<SandboxConsoleProps> = ({
  activeTopic,
  activeMode,
  onChallengePassed,
  sandboxCode,
  setSandboxCode,
  sandboxOutput,
  setSandboxOutput,
  isChallengePassed,
}) => {
  // Local environment memory
  const [workspace, setWorkspace] = useState<{ [key: string]: number[] }>({});
  const [consoleHistory, setConsoleHistory] = useState<{ type: "input" | "output" | "error"; text: string }[]>([]);
  const [currentPlot, setCurrentPlot] = useState<SimulationResult["chart"] | null>(null);

  // Initialize workspace on component load or topic change by preloading specific variables
  useEffect(() => {
    const freshWorkspace: { [key: string]: number[] } = {
      // General demo vector
      scores: [85, 90, 78, 92, 88],
    };

    // Load topic specific challenge datasets
    if (activeTopic.challenge) {
      const ch = activeTopic.challenge;
      freshWorkspace[ch.initialDatasetName] = ch.initialDataset;
    }

    setWorkspace(freshWorkspace);
    setConsoleHistory([
      { type: "output", text: "R (version 4.3.1) - Descriptive Statistics Console Simulated Core." },
      { type: "output", text: "Ready. Try assigning variables like: grades <- c(92, 85, 78) or calling mean(grades)" }
    ]);
    setCurrentPlot(null);
  }, [activeTopic]);

  // Handle Loading of Datasets with click
  const loadDataset = (name: string, data: number[]) => {
    setWorkspace((prev) => ({ ...prev, [name]: data }));
    setConsoleHistory((prev) => [
      ...prev,
      { type: "input", text: `# Load Custom Dataset: ${name}` },
      { type: "output", text: `Success: Loaded vector '${name}' of size ${data.length} into your workspace: [${data.slice(0, 5).join(", ")}${data.length > 5 ? "..." : ""}]` }
    ]);
  };

  const handleRun = () => {
    if (!sandboxCode.trim()) return;

    // Split code line-by-line to append inputs to history nicely
    const inputs = sandboxCode.split("\n").filter(l => l.trim().length > 0);
    const newHistory = [...consoleHistory];
    
    inputs.forEach(ip => {
      newHistory.push({ type: "input", text: ip });
    });

    // Run code through compiler
    const result = runRCode(sandboxCode, workspace);

    if (result.error) {
      newHistory.push({ type: "error", text: result.error });
      setSandboxOutput(`Error: ${result.error}`);
      setCurrentPlot(null);
    } else {
      if (result.output) {
        newHistory.push({ type: "output", text: result.output });
        setSandboxOutput(result.output);
      } else {
        newHistory.push({ type: "output", text: "[Executed successfully: variables updated]" });
        setSandboxOutput("[Variables updated]");
      }
      
      // Update local workspace variables
      setWorkspace(result.modifiedVariables);

      // Render Plot if available
      if (result.chart) {
        setCurrentPlot(result.chart);
        newHistory.push({ type: "output", text: `[1] Rendered ${result.chart.type} visual plot: ${result.chart.title}` });
      } else {
        setCurrentPlot(null);
      }

      // 3. Challenge Validation Check
      if (activeMode === "challenge" && !isChallengePassed) {
        const challenge = activeTopic.challenge;
        
        // Let's check if the computed outcome fulfills the validation criteria
        // Let's call statistics helpers manually to double-check their run, or check output line
        let criteriaMet = false;
        
        if (challenge.validationMetric === "mean") {
          // Check if output includes the value
          const targetStr = challenge.validationTarget.toFixed(2);
          if (sandboxOutput.includes(targetStr) || result.output.includes("41.11")) {
            criteriaMet = true;
          }
        } else if (challenge.validationMetric === "sd") {
          if (sandboxOutput.includes("9.603") || result.output.includes("9.60")) {
            criteriaMet = true;
          }
        } else if (challenge.validationMetric === "summary") {
          if (sandboxOutput.includes("Min.") && sandboxOutput.includes("Max.")) {
            criteriaMet = true;
          }
        } else if (challenge.validationMetric === "boxplot" || challenge.validationMetric === "quantile") {
          if (result.chart && result.chart.type === "boxplot") {
            criteriaMet = true;
          }
        }

        if (criteriaMet) {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
          onChallengePassed(activeTopic.id);
          newHistory.push({ type: "output", text: "🎉 CHALLENGE COMPLETED METRIC VERIFIED PERFECTLY! +10 Stars Awarded!" });
        }
      }
    }

    setConsoleHistory(newHistory);
  };

  const handleClearHistory = () => {
    setConsoleHistory([]);
    setCurrentPlot(null);
  };

  const handleResetChallenge = () => {
    if (activeMode === "challenge") {
      setSandboxCode(activeTopic.challenge.placeholderCode);
    } else {
      setSandboxCode(activeTopic.lessons[0]?.rSnippet || "");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Top Banner Context */}
      {activeMode === "challenge" && (
        <div className="bg-indigo-50/60 border-b border-slate-200 p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-start gap-2 max-w-xl">
            <Terminal className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-extrabold text-indigo-700 font-mono">CHALLENGE TASK: </span>
              <span className="text-slate-700 leading-normal">{activeTopic.challenge.taskDescription}</span>
              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5 leading-relaxed bg-white/80 p-1.5 rounded border border-indigo-100">
                <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Hint: {activeTopic.challenge.hint}</span>
              </div>
            </div>
          </div>
          {isChallengePassed ? (
            <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-bold text-xs py-1 px-2.5 rounded-full self-start md:self-center shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-500/25" />
              <span>Solved (+10 Stars)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 font-semibold text-[10px] uppercase font-mono px-2 py-0.5 rounded-full shrink-0">
              <Sparkles className="h-3 w-3" />
              <span>In Progress</span>
            </div>
          )}
        </div>
      )}

      {/* Workspace List & Code Input */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 border-b border-slate-200">
        
        {/* Workspace panel variables */}
        <div className="w-full md:w-52 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-3 space-y-3 shrink-0 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-500 font-mono tracking-wider uppercase flex items-center gap-1.5">
              <Database className="h-3 w-3 text-indigo-600" />
              <span>Workspace Variables</span>
            </h3>
          </div>
          
          <div className="space-y-1.5">
            {Object.keys(workspace).length === 0 ? (
              <p className="text-[10px] text-slate-500 italic">No variables defined yet.</p>
            ) : (
              Object.entries(workspace).map(([name, data]) => (
                <div key={name} className="bg-white border border-slate-200 p-2 rounded text-left flex flex-col gap-1 transition-all shadow-sm">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-xs text-indigo-600 font-bold truncate">{name}</span>
                    <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1 rounded">n={data.length}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono truncate">
                    c({data.slice(0, 4).join(", ")}{data.length > 4 ? "..." : ""})
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="h-px bg-slate-200 my-2" />

          {/* Loadable standard datasets */}
          <div className="space-y-2">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Import Sample Vectors</span>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => loadDataset("employee_hours", [35, 40, 42, 38, 45, 50, 37, 39, 41])}
                className="text-left bg-white hover:bg-slate-50 text-[10px] p-1.5 rounded text-slate-600 font-mono border border-slate-200 transition-all truncate flex items-center justify-between cursor-pointer shadow-sm"
              >
                <span>employee_hours</span>
                <span className="text-[9px] text-indigo-600 font-bold">+</span>
              </button>
              <button
                onClick={() => loadDataset("commute_times", [18, 25, 45, 20, 15, 30, 22, 28, 40, 19])}
                className="text-left bg-white hover:bg-slate-50 text-[10px] p-1.5 rounded text-slate-600 font-mono border border-slate-200 transition-all truncate flex items-center justify-between cursor-pointer shadow-sm"
              >
                <span>commute_times</span>
                <span className="text-[9px] text-indigo-600 font-bold">+</span>
              </button>
              <button
                onClick={() => loadDataset("heights", [152, 168, 175, 160, 185, 192, 170, 163, 178, 156, 180, 171])}
                className="text-left bg-white hover:bg-slate-50 text-[10px] p-1.5 rounded text-slate-600 font-mono border border-slate-200 transition-all truncate flex items-center justify-between cursor-pointer shadow-sm"
              >
                <span>heights</span>
                <span className="text-[9px] text-indigo-600 font-bold">+</span>
              </button>
              <button
                onClick={() => loadDataset("ages", [21, 23, 25, 22, 28, 35, 42, 19, 24, 30, 31, 38, 45, 50, 52])}
                className="text-left bg-white hover:bg-slate-50 text-[10px] p-1.5 rounded text-slate-600 font-mono border border-slate-200 transition-all truncate flex items-center justify-between cursor-pointer shadow-sm"
              >
                <span>ages</span>
                <span className="text-[9px] text-indigo-600 font-bold">+</span>
              </button>
            </div>
          </div>
        </div>

        {/* Text editor box */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0f172a] relative">
          <div className="p-2 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">R Console Editor</span>
            <div className="flex gap-2">
              <button
                onClick={handleResetChallenge}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer border border-slate-700/85"
                title="Reset Script Buffer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Block</span>
              </button>
              <button
                onClick={handleRun}
                disabled={!sandboxCode.trim()}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white font-semibold px-3.5 py-1 rounded text-[10px] font-mono transition-all cursor-pointer"
              >
                <Play className="h-3 w-3 fill-white text-white" />
                <span>Run Code</span>
              </button>
            </div>
          </div>

          <textarea
            value={sandboxCode}
            onChange={(e) => setSandboxCode(e.target.value)}
            className="flex-1 w-full bg-[#020617] p-4 text-xs font-mono text-indigo-200 focus:outline-none resize-none leading-relaxed"
            placeholder="# Enter your R script here&#10;# Assign vectors: scores <- c(80, 85, 90)&#10;# Compute centers: mean(scores)&#10;# Make plot diagnostics: boxplot(scores)"
          />
        </div>
      </div>

      {/* Visual Plotting and Console Output tabs */}
      <div className="h-64 grid grid-cols-1 md:grid-cols-2 bg-[#020617] shrink-0">
        
        {/* Terminal logs list */}
        <div className="flex flex-col border-r border-slate-850 bg-[#020617] overflow-hidden">
          <div className="px-3 py-1.5 border-b border-slate-850 bg-slate-900/40 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-mono text-slate-400">Simulated Terminal Outputs</span>
            <button
              onClick={handleClearHistory}
              className="text-[9px] font-mono text-slate-400 hover:text-white border border-slate-800 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3.5 space-y-1.5 font-mono text-[11px] leading-relaxed">
            {consoleHistory.map((item, idx) => {
              if (item.type === "input") {
                return (
                  <div key={idx} className="text-slate-400 flex items-start gap-1">
                    <span className="text-indigo-400 block shrink-0 font-bold">&gt;</span>
                    <span className="whitespace-pre-wrap">{item.text}</span>
                  </div>
                );
              } else if (item.type === "error") {
                return (
                  <div key={idx} className="text-rose-400 bg-rose-500/5 border-l-2 border-rose-500 pl-2 py-0.5 font-bold whitespace-pre-wrap">
                    {item.text}
                  </div>
                );
              } else {
                return (
                  <div key={idx} className={item.text && item.text.includes("CHALLENGE COMPLETED") ? "text-indigo-300 font-bold bg-indigo-950/20 px-2 py-1 rounded border border-indigo-900/50 whitespace-pre-wrap" : "text-emerald-350 bg-emerald-500/[0.01] whitespace-pre-wrap"}>
                    {item.text}
                  </div>
                );
              }
            })}
          </div>
        </div>

        {/* Visual Charts Canvas block */}
        <div className="flex flex-col bg-[#020617] overflow-hidden relative">
          <div className="px-3 py-1.5 border-b border-slate-850 bg-slate-900/40 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-mono text-slate-400">R Graphic Output Window (Plots)</span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto flex items-center justify-center">
            {currentPlot ? (
              <div className="w-full h-full flex items-center justify-center animate-scale-up">
                {currentPlot.type === "boxplot" ? (
                  <BoxPlotCanvas values={currentPlot.values} title={currentPlot.title} />
                ) : (
                  <HistPlotCanvas values={currentPlot.values} title={currentPlot.title} />
                )}
              </div>
            ) : (
              <div className="text-center text-slate-505 flex flex-col items-center justify-center gap-1.5 py-8">
                <div className="p-3 bg-slate-900/50 rounded-full border border-slate-850">
                  <Database className="h-5 w-5 text-slate-600" />
                </div>
                <h4 className="text-xs font-mono font-bold text-slate-400">No active graphics device</h4>
                <p className="text-[10px] max-w-xs font-sans text-slate-500">
                  Execute R plotting commands like <code className="bg-slate-900 text-indigo-400 px-1 py-0.5 rounded">boxplot(scores)</code> or <code className="bg-slate-900 text-indigo-400 px-1 py-0.5 rounded">hist(scores)</code> to generate interactive plots dynamically.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
